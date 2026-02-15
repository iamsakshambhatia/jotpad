import { createMutation, createQuery } from "react-query-kit";
import { axiosInstance } from "./axios";
import type {
  CreateNoteRequest,
  Note,
  NotePreview,
  NotesQueryParams,
  UpdateNoteRequest,
} from "../types";

export const useNotes = createQuery({
  queryKey: ["notes"],
  fetcher: async (variables: NotesQueryParams): Promise<NotePreview[]> => {
    const { data } = await axiosInstance.get<{ notes: NotePreview[] }>("/api/v1/notes/", {
      params: variables,
    });
    return data.notes;
  },
});

export const useRecentNotes = createQuery({
  queryKey: ["notes", "recent"],
  fetcher: async (): Promise<NotePreview[]> => {
    const { data } = await axiosInstance.get<{ recent_notes: NotePreview[] }>(
      "/api/v1/notes/recent"
    );
    return data.recent_notes;
  },
});

export const useNote = createQuery({
  queryKey: ["notes", "detail"],
  fetcher: async (variables: { id: string }): Promise<Note> => {
    const { data } = await axiosInstance.get<{ note: Note }>(`/api/v1/notes/${variables.id}`);
    return data.note;
  },
});

export const useCreateNote = createMutation({
  mutationFn: async (variables: CreateNoteRequest) => {
    const { data } = await axiosInstance.post("/api/v1/notes/", variables);
    return data;
  },
});

export const useUpdateNote = createMutation({
  mutationFn: async (variables: UpdateNoteRequest & { id: string }) => {
    const { id, ...body } = variables;
    const { data } = await axiosInstance.patch<{ detail: string; note: Note }>(
      `/api/v1/notes/${id}`,
      body
    );
    return data;
  },
});

export const useRestoreNote = createMutation({
  mutationFn: async (variables: { id: string }) => {
    const { data } = await axiosInstance.post(`/api/v1/notes/${variables.id}/restore`);
    return data;
  },
});
