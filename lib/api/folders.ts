import { createMutation, createQuery } from "react-query-kit";
import { axiosInstance } from "./axios";
import type { CreateFolderRequest, Folder, UpdateFolderRequest } from "../types";

export const useFolders = createQuery({
  queryKey: ["folders"],
  fetcher: async (): Promise<Folder[]> => {
    const { data } = await axiosInstance.get<{ folders: Folder[] }>("/api/v1/folders/");
    return data.folders;
  },
});

export const useCreateFolder = createMutation({
  mutationFn: async (variables: CreateFolderRequest) => {
    const { data } = await axiosInstance.post("/api/v1/folders/", variables);
    return data;
  },
});

export const useUpdateFolder = createMutation({
  mutationFn: async (variables: UpdateFolderRequest & { id: string }) => {
    const { id, ...body } = variables;
    const { data } = await axiosInstance.patch(`/api/v1/folders/${id}`, body);
    return data;
  },
});

export const useDeleteFolder = createMutation({
  mutationFn: async (variables: { id: string }) => {
    const { data } = await axiosInstance.delete(`/api/v1/folders/${variables.id}`);
    return data;
  },
});
