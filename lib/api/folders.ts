import { createMutation, createQuery } from "react-query-kit";
import { folderRepository } from "../db/folder-repository";
import { syncEngine } from "../sync/sync-engine";
import { uuid } from "../utils";
import type { CreateFolderRequest, Folder, UpdateFolderRequest } from "../types";

export const useFolders = createQuery({
  queryKey: ["folders"],
  fetcher: async (): Promise<Folder[]> => {
    return folderRepository.getAll();
  },
});

export const useCreateFolder = createMutation({
  mutationFn: async (variables: CreateFolderRequest) => {
    const id = uuid();
    const folder = await folderRepository.create(id, variables);
    syncEngine.triggerSync();
    return { folder };
  },
});

export const useUpdateFolder = createMutation({
  mutationFn: async (variables: UpdateFolderRequest & { id: string }) => {
    const { id, ...body } = variables;
    await folderRepository.update(id, body);
    syncEngine.triggerSync();
    return { detail: "Folder updated" };
  },
});

export const useDeleteFolder = createMutation({
  mutationFn: async (variables: { id: string }) => {
    await folderRepository.markDeleted(variables.id);
    syncEngine.triggerSync();
    return { detail: "Folder deleted" };
  },
});
