import { createMutation, createQuery } from "react-query-kit";
import { noteRepository } from "../db/note-repository";
import { syncEngine } from "../sync/sync-engine";
import { uuid } from "../utils";
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
    return noteRepository.getAll(variables);
  },
});

export const useRecentNotes = createQuery({
  queryKey: ["notes", "recent"],
  fetcher: async (): Promise<NotePreview[]> => {
    return noteRepository.getRecent();
  },
});

export const useNote = createQuery({
  queryKey: ["notes", "detail"],
  fetcher: async (variables: { id: string }): Promise<Note> => {
    const note = await noteRepository.getById(variables.id);
    if (!note) throw new Error("Note not found");
    return note;
  },
});

export const useCreateNote = createMutation({
  mutationFn: async (variables: CreateNoteRequest) => {
    const id = uuid();
    const note = await noteRepository.create(id, variables);
    syncEngine.triggerSync();
    return { note };
  },
});

export const useUpdateNote = createMutation({
  mutationFn: async (variables: UpdateNoteRequest & { id: string }) => {
    const { id, ...body } = variables;
    await noteRepository.update(id, body);
    syncEngine.triggerSync();
    const note = await noteRepository.getById(id);
    return { detail: "Note updated", note };
  },
});

export const useRestoreNote = createMutation({
  mutationFn: async (variables: { id: string }) => {
    await noteRepository.update(variables.id, { is_archive: false });
    syncEngine.triggerSync();
    return { detail: "Note restored" };
  },
});
