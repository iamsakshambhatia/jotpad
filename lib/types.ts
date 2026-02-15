export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface Folder {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
}

export interface NotePreview {
  id: string;
  folder_id: string;
  title: string;
  preview: string;
  is_favorite: boolean;
  is_archive: boolean;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
  folder: Folder;
}

export interface Note {
  id: string;
  folder_id: string;
  title: string;
  content: string;
  is_favorite: boolean;
  is_archive: boolean;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
  folder: Folder;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface CreateFolderRequest {
  name: string;
}

export interface UpdateFolderRequest {
  name: string;
}

export interface CreateNoteRequest {
  title: string;
  content: string;
  folder_id: string;
  is_favorite?: boolean;
  is_archive?: boolean;
}

export interface UpdateNoteRequest {
  title?: string;
  content?: string;
  folder_id?: string;
  is_favorite?: boolean;
  is_archive?: boolean;
}

export interface NotesQueryParams {
  limit?: number;
  page?: number;
  archived?: boolean;
  favorite?: boolean;
  deleted?: boolean;
  folder_id?: string;
  search?: string;
}
