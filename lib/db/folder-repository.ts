import { getDatabase } from "./database";
import type { SyncStatus } from "./schema";
import type { Folder } from "../types";

interface FolderRow {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
  sync_status: SyncStatus;
  local_updated_at: string;
}

function rowToFolder(row: FolderRow): Folder {
  return {
    id: row.id,
    name: row.name,
    created_at: row.created_at,
    updated_at: row.updated_at,
    archived_at: row.archived_at,
  };
}

export const folderRepository = {
  async getAll(): Promise<Folder[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<FolderRow>(
      `SELECT * FROM folders WHERE sync_status != 'pending_delete' ORDER BY updated_at DESC`
    );
    return rows.map(rowToFolder);
  },

  async getByName(name: string): Promise<Folder | null> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<FolderRow>(
      `SELECT * FROM folders WHERE name = ? AND sync_status != 'pending_delete'`,
      [name]
    );
    return row ? rowToFolder(row) : null;
  },

  async getById(id: string): Promise<Folder | null> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<FolderRow>(
      `SELECT * FROM folders WHERE id = ? AND sync_status != 'pending_delete'`,
      [id]
    );
    return row ? rowToFolder(row) : null;
  },

  async create(id: string, data: { name: string }, syncStatus: SyncStatus = "pending_create"): Promise<Folder> {
    const db = await getDatabase();
    const now = new Date().toISOString();
    await db.runAsync(
      `INSERT INTO folders (id, name, created_at, updated_at, archived_at, sync_status, local_updated_at)
       VALUES (?, ?, ?, ?, NULL, ?, ?)`,
      [id, data.name, now, now, syncStatus, now]
    );
    return { id, name: data.name, created_at: now, updated_at: now, archived_at: null };
  },

  async update(id: string, data: { name: string }): Promise<void> {
    const db = await getDatabase();
    const now = new Date().toISOString();
    const existing = await db.getFirstAsync<{ sync_status: SyncStatus }>(
      `SELECT sync_status FROM folders WHERE id = ?`,
      [id]
    );
    const newStatus: SyncStatus = existing?.sync_status === "pending_create" ? "pending_create" : "pending_update";
    await db.runAsync(
      `UPDATE folders SET name = ?, updated_at = ?, sync_status = ?, local_updated_at = ? WHERE id = ?`,
      [data.name, now, newStatus, now, id]
    );
  },

  async markDeleted(id: string): Promise<void> {
    const db = await getDatabase();
    const existing = await db.getFirstAsync<{ sync_status: SyncStatus }>(
      `SELECT sync_status FROM folders WHERE id = ?`,
      [id]
    );
    if (existing?.sync_status === "pending_create") {
      await db.runAsync(`DELETE FROM notes WHERE folder_id = ?`, [id]);
      await db.runAsync(`DELETE FROM folders WHERE id = ?`, [id]);
    } else {
      await db.runAsync(
        `UPDATE folders SET sync_status = 'pending_delete', local_updated_at = datetime('now') WHERE id = ?`,
        [id]
      );
    }
  },

  async upsertFromServer(folder: Folder): Promise<void> {
    const db = await getDatabase();
    const existing = await db.getFirstAsync<{ sync_status: SyncStatus }>(
      `SELECT sync_status FROM folders WHERE id = ?`,
      [folder.id]
    );

    if (existing && existing.sync_status !== "synced") return;

    await db.runAsync(
      `INSERT INTO folders (id, name, created_at, updated_at, archived_at, sync_status, local_updated_at)
       VALUES (?, ?, ?, ?, ?, 'synced', datetime('now'))
       ON CONFLICT(id) DO UPDATE SET
         name = excluded.name,
         created_at = excluded.created_at,
         updated_at = excluded.updated_at,
         archived_at = excluded.archived_at,
         sync_status = 'synced',
         local_updated_at = datetime('now')`,
      [folder.id, folder.name, folder.created_at, folder.updated_at, folder.archived_at]
    );
  },

  async markSynced(id: string, serverData?: Folder & { serverId?: string }): Promise<void> {
    const db = await getDatabase();
    if (serverData?.serverId && serverData.serverId !== id) {
      await db.withTransactionAsync(async () => {
        await db.runAsync(`UPDATE notes SET folder_id = ? WHERE folder_id = ?`, [serverData.serverId, id]);
        await db.runAsync(`DELETE FROM folders WHERE id = ?`, [id]);
        await db.runAsync(
          `INSERT INTO folders (id, name, created_at, updated_at, archived_at, sync_status, local_updated_at)
           VALUES (?, ?, ?, ?, ?, 'synced', datetime('now'))`,
          [serverData.serverId, serverData.name, serverData.created_at, serverData.updated_at, serverData.archived_at]
        );
      });
    } else {
      await db.runAsync(
        `UPDATE folders SET sync_status = 'synced', local_updated_at = datetime('now') WHERE id = ?`,
        [id]
      );
    }
  },

  async getPendingChanges(): Promise<(FolderRow)[]> {
    const db = await getDatabase();
    return db.getAllAsync<FolderRow>(
      `SELECT * FROM folders WHERE sync_status != 'synced' ORDER BY local_updated_at ASC`
    );
  },

  async deleteServerRemoved(serverIds: Set<string>): Promise<void> {
    const db = await getDatabase();
    const localSynced = await db.getAllAsync<{ id: string }>(
      `SELECT id FROM folders WHERE sync_status = 'synced'`
    );
    for (const row of localSynced) {
      if (!serverIds.has(row.id)) {
        await db.runAsync(`DELETE FROM notes WHERE folder_id = ?`, [row.id]);
        await db.runAsync(`DELETE FROM folders WHERE id = ?`, [row.id]);
      }
    }
  },

  async cleanupStalePendingCreates(): Promise<void> {
    const db = await getDatabase();
    // Remove pending_create folders whose name already exists as a synced folder
    // (these are stale local copies left behind after sync assigned server IDs)
    const stale = await db.getAllAsync<{ id: string }>(
      `SELECT f.id FROM folders f
       WHERE f.sync_status = 'pending_create'
       AND EXISTS (SELECT 1 FROM folders s WHERE s.name = f.name AND s.sync_status = 'synced')`
    );
    for (const row of stale) {
      // Reassign any notes from the stale folder to the synced one
      const synced = await db.getFirstAsync<{ id: string }>(
        `SELECT s.id FROM folders s WHERE s.sync_status = 'synced' AND s.name = (SELECT name FROM folders WHERE id = ?)`,
        [row.id]
      );
      if (synced) {
        await db.runAsync(`UPDATE notes SET folder_id = ? WHERE folder_id = ?`, [synced.id, row.id]);
      }
      await db.runAsync(`DELETE FROM folders WHERE id = ?`, [row.id]);
    }
  },
};
