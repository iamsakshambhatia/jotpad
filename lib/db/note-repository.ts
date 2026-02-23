import { getDatabase } from "./database";
import type { SyncStatus } from "./schema";
import type { Note, NotePreview, NotesQueryParams, Folder } from "../types";

interface NoteRow {
  id: string;
  folder_id: string;
  title: string;
  content: string;
  preview: string;
  is_favorite: number;
  is_archive: number;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
  sync_status: SyncStatus;
  local_updated_at: string;
}

interface NoteWithFolderRow extends NoteRow {
  folder_name: string;
  folder_created_at: string;
  folder_updated_at: string;
  folder_archived_at: string | null;
}

function buildFolder(row: NoteWithFolderRow): Folder {
  return {
    id: row.folder_id,
    name: row.folder_name ?? "",
    created_at: row.folder_created_at ?? "",
    updated_at: row.folder_updated_at ?? "",
    archived_at: row.folder_archived_at ?? null,
  };
}

function rowToNotePreview(row: NoteWithFolderRow): NotePreview {
  return {
    id: row.id,
    folder_id: row.folder_id,
    title: row.title,
    preview: row.preview,
    is_favorite: !!row.is_favorite,
    is_archive: !!row.is_archive,
    created_at: row.created_at,
    updated_at: row.updated_at,
    archived_at: row.archived_at,
    folder: buildFolder(row),
  };
}

function rowToNote(row: NoteWithFolderRow): Note {
  return {
    id: row.id,
    folder_id: row.folder_id,
    title: row.title,
    content: row.content,
    is_favorite: !!row.is_favorite,
    is_archive: !!row.is_archive,
    created_at: row.created_at,
    updated_at: row.updated_at,
    archived_at: row.archived_at,
    folder: buildFolder(row),
  };
}

const JOIN_FOLDER = `LEFT JOIN folders f ON n.folder_id = f.id`;
const SELECT_WITH_FOLDER = `
  n.*,
  f.name AS folder_name,
  f.created_at AS folder_created_at,
  f.updated_at AS folder_updated_at,
  f.archived_at AS folder_archived_at
`;

export const noteRepository = {
  async getAll(params: NotesQueryParams): Promise<NotePreview[]> {
    const db = await getDatabase();
    const conditions: string[] = ["n.sync_status != 'pending_delete'"];
    const args: (string | number)[] = [];

    if (params.folder_id) {
      conditions.push("n.folder_id = ?");
      args.push(params.folder_id);
    }
    if (params.search) {
      conditions.push("(n.title LIKE ? OR n.preview LIKE ?)");
      const term = `%${params.search}%`;
      args.push(term, term);
    }
    if (params.favorite !== undefined) {
      conditions.push("n.is_favorite = ?");
      args.push(params.favorite ? 1 : 0);
    }
    if (params.archived !== undefined) {
      conditions.push("n.is_archive = ?");
      args.push(params.archived ? 1 : 0);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    const limit = params.limit ? `LIMIT ${params.limit}` : "";
    const offset = params.page && params.limit ? `OFFSET ${(params.page - 1) * params.limit}` : "";

    const rows = await db.getAllAsync<NoteWithFolderRow>(
      `SELECT ${SELECT_WITH_FOLDER} FROM notes n ${JOIN_FOLDER} ${where} ORDER BY n.updated_at DESC ${limit} ${offset}`,
      args
    );
    return rows.map(rowToNotePreview);
  },

  async getRecent(): Promise<NotePreview[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<NoteWithFolderRow>(
      `SELECT ${SELECT_WITH_FOLDER} FROM notes n ${JOIN_FOLDER}
       WHERE n.is_archive = 0 AND n.sync_status != 'pending_delete'
       ORDER BY n.updated_at DESC LIMIT 10`
    );
    return rows.map(rowToNotePreview);
  },

  async getById(id: string): Promise<Note | null> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<NoteWithFolderRow>(
      `SELECT ${SELECT_WITH_FOLDER} FROM notes n ${JOIN_FOLDER}
       WHERE n.id = ? AND n.sync_status != 'pending_delete'`,
      [id]
    );
    return row ? rowToNote(row) : null;
  },

  async create(
    id: string,
    data: { title: string; content: string; folder_id: string; is_favorite?: boolean; is_archive?: boolean },
    syncStatus: SyncStatus = "pending_create"
  ): Promise<Note> {
    const db = await getDatabase();
    const now = new Date().toISOString();
    const preview = data.content.slice(0, 200);
    const isFavorite = data.is_favorite ? 1 : 0;
    const isArchive = data.is_archive ? 1 : 0;

    await db.runAsync(
      `INSERT INTO notes (id, folder_id, title, content, preview, is_favorite, is_archive, created_at, updated_at, archived_at, sync_status, local_updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, ?, ?)`,
      [id, data.folder_id, data.title, data.content, preview, isFavorite, isArchive, now, now, syncStatus, now]
    );

    const folder = await db.getFirstAsync<{ id: string; name: string; created_at: string; updated_at: string; archived_at: string | null }>(
      `SELECT id, name, created_at, updated_at, archived_at FROM folders WHERE id = ?`,
      [data.folder_id]
    );

    return {
      id,
      folder_id: data.folder_id,
      title: data.title,
      content: data.content,
      is_favorite: !!isFavorite,
      is_archive: !!isArchive,
      created_at: now,
      updated_at: now,
      archived_at: null,
      folder: folder ?? { id: data.folder_id, name: "", created_at: now, updated_at: now, archived_at: null },
    };
  },

  async update(id: string, data: Partial<{ title: string; content: string; folder_id: string; is_favorite: boolean; is_archive: boolean }>): Promise<void> {
    const db = await getDatabase();
    const now = new Date().toISOString();

    const existing = await db.getFirstAsync<NoteRow>(`SELECT * FROM notes WHERE id = ?`, [id]);
    if (!existing) return;

    const newStatus: SyncStatus = existing.sync_status === "pending_create" ? "pending_create" : "pending_update";

    const fields: string[] = ["updated_at = ?", "sync_status = ?", "local_updated_at = ?"];
    const args: (string | number)[] = [now, newStatus, now];

    if (data.title !== undefined) {
      fields.push("title = ?");
      args.push(data.title);
    }
    if (data.content !== undefined) {
      fields.push("content = ?");
      fields.push("preview = ?");
      args.push(data.content);
      args.push(data.content.slice(0, 200));
    }
    if (data.folder_id !== undefined) {
      fields.push("folder_id = ?");
      args.push(data.folder_id);
    }
    if (data.is_favorite !== undefined) {
      fields.push("is_favorite = ?");
      args.push(data.is_favorite ? 1 : 0);
    }
    if (data.is_archive !== undefined) {
      fields.push("is_archive = ?");
      args.push(data.is_archive ? 1 : 0);
      if (data.is_archive) {
        fields.push("archived_at = ?");
        args.push(now);
      } else {
        fields.push("archived_at = NULL");
      }
    }

    args.push(id);
    await db.runAsync(`UPDATE notes SET ${fields.join(", ")} WHERE id = ?`, args);
  },

  async markDeleted(id: string): Promise<void> {
    const db = await getDatabase();
    const existing = await db.getFirstAsync<{ sync_status: SyncStatus }>(
      `SELECT sync_status FROM notes WHERE id = ?`,
      [id]
    );
    if (existing?.sync_status === "pending_create") {
      await db.runAsync(`DELETE FROM notes WHERE id = ?`, [id]);
    } else {
      await db.runAsync(
        `UPDATE notes SET sync_status = 'pending_delete', local_updated_at = datetime('now') WHERE id = ?`,
        [id]
      );
    }
  },

  async upsertFromServer(note: Note | NotePreview): Promise<void> {
    const db = await getDatabase();
    const existing = await db.getFirstAsync<{ sync_status: SyncStatus }>(
      `SELECT sync_status FROM notes WHERE id = ?`,
      [note.id]
    );

    if (existing && existing.sync_status !== "synced") return;

    const content = "content" in note ? note.content : "";
    const preview = "preview" in note ? note.preview : content.slice(0, 200);

    await db.runAsync(
      `INSERT INTO notes (id, folder_id, title, content, preview, is_favorite, is_archive, created_at, updated_at, archived_at, sync_status, local_updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'synced', datetime('now'))
       ON CONFLICT(id) DO UPDATE SET
         folder_id = excluded.folder_id,
         title = excluded.title,
         content = CASE WHEN excluded.content = '' THEN notes.content ELSE excluded.content END,
         preview = excluded.preview,
         is_favorite = excluded.is_favorite,
         is_archive = excluded.is_archive,
         created_at = excluded.created_at,
         updated_at = excluded.updated_at,
         archived_at = excluded.archived_at,
         sync_status = 'synced',
         local_updated_at = datetime('now')`,
      [
        note.id,
        note.folder_id,
        note.title,
        content,
        preview,
        note.is_favorite ? 1 : 0,
        note.is_archive ? 1 : 0,
        note.created_at,
        note.updated_at,
        note.archived_at,
      ]
    );
  },

  async markSynced(id: string, serverData?: { serverId?: string }): Promise<void> {
    const db = await getDatabase();
    if (serverData?.serverId && serverData.serverId !== id) {
      const existing = await db.getFirstAsync<NoteRow>(`SELECT * FROM notes WHERE id = ?`, [id]);
      if (existing) {
        await db.runAsync(`DELETE FROM notes WHERE id = ?`, [id]);
        await db.runAsync(
          `INSERT INTO notes (id, folder_id, title, content, preview, is_favorite, is_archive, created_at, updated_at, archived_at, sync_status, local_updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'synced', datetime('now'))`,
          [
            serverData.serverId,
            existing.folder_id,
            existing.title,
            existing.content,
            existing.preview,
            existing.is_favorite,
            existing.is_archive,
            existing.created_at,
            existing.updated_at,
            existing.archived_at,
          ]
        );
      }
    } else {
      await db.runAsync(
        `UPDATE notes SET sync_status = 'synced', local_updated_at = datetime('now') WHERE id = ?`,
        [id]
      );
    }
  },

  async getPendingChanges(): Promise<NoteRow[]> {
    const db = await getDatabase();
    return db.getAllAsync<NoteRow>(
      `SELECT * FROM notes WHERE sync_status != 'synced' ORDER BY local_updated_at ASC`
    );
  },

  async deleteServerRemoved(serverIds: Set<string>): Promise<void> {
    const db = await getDatabase();
    const localSynced = await db.getAllAsync<{ id: string }>(
      `SELECT id FROM notes WHERE sync_status = 'synced'`
    );
    for (const row of localSynced) {
      if (!serverIds.has(row.id)) {
        await db.runAsync(`DELETE FROM notes WHERE id = ?`, [row.id]);
      }
    }
  },
};
