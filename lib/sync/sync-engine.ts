import type { QueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../api/axios";
import { folderRepository } from "../db/folder-repository";
import { noteRepository } from "../db/note-repository";
import { getDatabase } from "../db/database";
import { useNetworkStore } from "../store/network-store";
import type { Folder, Note, NotePreview } from "../types";

const SYNC_INTERVAL_MS = 30_000;

let queryClient: QueryClient | null = null;
let syncInterval: ReturnType<typeof setInterval> | null = null;
let isSyncing = false;

function invalidateAll() {
  queryClient?.invalidateQueries({ queryKey: ["notes"] });
  queryClient?.invalidateQueries({ queryKey: ["folders"] });
}

async function getLastSync(): Promise<string | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ value: string }>(
    `SELECT value FROM sync_meta WHERE key = 'last_sync'`
  );
  return row?.value ?? null;
}

async function setLastSync(timestamp: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `INSERT INTO sync_meta (key, value) VALUES ('last_sync', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
    [timestamp]
  );
}

async function pushFolders(): Promise<void> {
  const pending = await folderRepository.getPendingChanges();

  for (const folder of pending) {
    try {
      if (folder.sync_status === "pending_create") {
        const { data } = await axiosInstance.post<{ folder: Folder }>("/api/v1/folders/", {
          name: folder.name,
        });
        const serverFolder = data.folder;
        await folderRepository.markSynced(folder.id, {
          ...serverFolder,
          serverId: serverFolder.id !== folder.id ? serverFolder.id : undefined,
        });
      } else if (folder.sync_status === "pending_update") {
        await axiosInstance.patch(`/api/v1/folders/${folder.id}`, {
          name: folder.name,
        });
        await folderRepository.markSynced(folder.id);
      } else if (folder.sync_status === "pending_delete") {
        try {
          await axiosInstance.delete(`/api/v1/folders/${folder.id}`);
        } catch (err: any) {
          if (err?.response?.status !== 404) throw err;
        }
        const db = await getDatabase();
        await db.runAsync(`DELETE FROM notes WHERE folder_id = ?`, [folder.id]);
        await db.runAsync(`DELETE FROM folders WHERE id = ?`, [folder.id]);
      }
    } catch (err) {
      console.warn(`[Sync] Failed to push folder ${folder.id}:`, err);
    }
  }
}

async function pushNotes(): Promise<void> {
  const pending = await noteRepository.getPendingChanges();

  for (const note of pending) {
    try {
      if (note.sync_status === "pending_create") {
        const { data } = await axiosInstance.post<{ note: Note }>("/api/v1/notes/", {
          title: note.title,
          content: note.content,
          folder_id: note.folder_id,
          is_favorite: !!note.is_favorite,
          is_archive: !!note.is_archive,
        });
        const serverNote = data.note;
        await noteRepository.markSynced(note.id, {
          serverId: serverNote.id !== note.id ? serverNote.id : undefined,
        });
      } else if (note.sync_status === "pending_update") {
        await axiosInstance.patch(`/api/v1/notes/${note.id}`, {
          title: note.title,
          content: note.content,
          folder_id: note.folder_id,
          is_favorite: !!note.is_favorite,
          is_archive: !!note.is_archive,
        });
        await noteRepository.markSynced(note.id);
      } else if (note.sync_status === "pending_delete") {
        try {
          await axiosInstance.delete(`/api/v1/notes/${note.id}`);
        } catch (err: any) {
          if (err?.response?.status !== 404) throw err;
        }
        const db = await getDatabase();
        await db.runAsync(`DELETE FROM notes WHERE id = ?`, [note.id]);
      }
    } catch (err) {
      console.warn(`[Sync] Failed to push note ${note.id}:`, err);
    }
  }
}

async function pullFolders(): Promise<void> {
  try {
    const { data } = await axiosInstance.get<{ folders: Folder[] }>("/api/v1/folders/");
    const serverFolders = data.folders;

    const serverIds = new Set<string>();
    for (const folder of serverFolders) {
      serverIds.add(folder.id);
      await folderRepository.upsertFromServer(folder);
    }
    await folderRepository.deleteServerRemoved(serverIds);
    // Clean up stale pending_create rows left behind when sync replaced local IDs with server IDs
    await folderRepository.cleanupStalePendingCreates();
  } catch (err) {
    console.warn("[Sync] Failed to pull folders:", err);
  }
}

async function pullNotes(): Promise<void> {
  try {
    const { data } = await axiosInstance.get<{ notes: NotePreview[] }>("/api/v1/notes/");
    const serverNotes = data.notes;

    // Deduplicate server notes by (title, folder_id) — keep the most recently updated
    const keepByKey = new Map<string, NotePreview>();
    const duplicateIds: string[] = [];
    for (const note of serverNotes) {
      const key = `${note.title}::${note.folder_id}`;
      const existing = keepByKey.get(key);
      if (existing) {
        if (note.updated_at > existing.updated_at) {
          duplicateIds.push(existing.id);
          keepByKey.set(key, note);
        } else {
          duplicateIds.push(note.id);
        }
      } else {
        keepByKey.set(key, note);
      }
    }

    // Delete server-side duplicates (best effort)
    for (const dupId of duplicateIds) {
      try {
        await axiosInstance.delete(`/api/v1/notes/${dupId}`);
      } catch {
        // Ignore — server cleanup is best-effort
      }
    }

    const serverIds = new Set<string>();
    for (const notePreview of keepByKey.values()) {
      serverIds.add(notePreview.id);
      // Fetch full note detail to get content
      try {
        const { data: detailData } = await axiosInstance.get<{ note: Note }>(
          `/api/v1/notes/${notePreview.id}`
        );
        await noteRepository.upsertFromServer(detailData.note);
      } catch {
        // If detail fetch fails, upsert preview data (content will be preserved if exists)
        await noteRepository.upsertFromServer(notePreview);
      }
    }

    // Also remove local copies of deleted duplicates
    const db = await getDatabase();
    for (const dupId of duplicateIds) {
      await db.runAsync(`DELETE FROM notes WHERE id = ?`, [dupId]);
    }

    await noteRepository.deleteServerRemoved(serverIds);
    await noteRepository.cleanupStalePendingCreates();
  } catch (err) {
    console.warn("[Sync] Failed to pull notes:", err);
  }
}

export const syncEngine = {
  init(client: QueryClient) {
    queryClient = client;
  },

  async triggerSync(): Promise<void> {
    if (isSyncing) return;
    if (!useNetworkStore.getState().isOnline) return;

    isSyncing = true;
    try {
      // Push first (local changes take priority)
      await pushFolders();
      await pushNotes();

      // Then pull server state
      await pullFolders();
      await pullNotes();

      await setLastSync(new Date().toISOString());
      invalidateAll();
    } catch (err) {
      console.warn("[Sync] Sync failed:", err);
    } finally {
      isSyncing = false;
    }
  },

  async performFullSync(): Promise<void> {
    if (isSyncing) return;
    if (!useNetworkStore.getState().isOnline) return;

    isSyncing = true;
    try {
      await pushFolders();
      await pushNotes();
      await pullFolders();
      await pullNotes();
      await setLastSync(new Date().toISOString());
      invalidateAll();
    } catch (err) {
      console.warn("[Sync] Full sync failed:", err);
    } finally {
      isSyncing = false;
    }
  },

  startPeriodicSync() {
    if (syncInterval) return;
    syncInterval = setInterval(() => {
      this.triggerSync();
    }, SYNC_INTERVAL_MS);
  },

  stop() {
    if (syncInterval) {
      clearInterval(syncInterval);
      syncInterval = null;
    }
    queryClient = null;
    isSyncing = false;
  },
};
