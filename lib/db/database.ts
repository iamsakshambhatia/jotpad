import * as SQLite from "expo-sqlite";
import { CREATE_TABLES_SQL } from "./schema";

let db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;

  db = await SQLite.openDatabaseAsync("jotpad.db");
  await db.execAsync("PRAGMA journal_mode = WAL;");
  await db.execAsync("PRAGMA foreign_keys = ON;");
  await db.execAsync(CREATE_TABLES_SQL);

  return db;
}

export async function clearDatabase(): Promise<void> {
  const database = await getDatabase();
  await database.execAsync(`
    DELETE FROM sync_queue;
    DELETE FROM notes;
    DELETE FROM folders;
    DELETE FROM sync_meta;
  `);
}
