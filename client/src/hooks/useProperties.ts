import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Property, InsertProperty, UpdateProperty } from "@shared/schema";

const API_BASE = "/api";

// Fetch all properties with optional auto-refresh
export function useProperties(options?: { refetchInterval?: number; enabled?: boolean }) {
  return useQuery<Property[]>({
    queryKey: ["properties"],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/properties`);
      if (!response.ok) {
        throw new Error("Failed to fetch properties");
      }
      return response.json();
    },
    refetchInterval: options?.refetchInterval,
    enabled: options?.enabled !== false,
  });
}

// Fetch single property
export function useProperty(id: string | undefined) {
  return useQuery<Property>({
    queryKey: ["property", id],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/properties/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch property");
      }
      return response.json();
    },
    enabled: !!id,
  });
}

// Admin hooks for create/update/delete
export function useAdminProperties() {
  const queryClient = useQueryClient();

  const createProperty = useMutation({
    mutationFn: async (property: InsertProperty & { sendAlert?: boolean }) => {
      const response = await fetch(`${API_BASE}/admin/properties`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(property),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create property");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["properties"] });
    },
  });

  const sendDealAlert = useMutation({
    mutationFn: async ({ id, force }: { id: string; force?: boolean }) => {
      const response = await fetch(`${API_BASE}/admin/properties/${id}/send-alert`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ force: force ?? false }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to send deal alert");
      }
      return data as { sent: number; failed: number; recipients: number };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["properties"] });
    },
  });

  const updateProperty = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateProperty }) => {
      const response = await fetch(`${API_BASE}/admin/properties/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update property");
      }
      return response.json();
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["properties"] });
      queryClient.invalidateQueries({ queryKey: ["property", id] });
    },
  });

  const deleteProperty = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`${API_BASE}/admin/properties/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete property");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["properties"] });
    },
  });

  return { createProperty, updateProperty, deleteProperty, sendDealAlert };
}

// Bulk operations
export function useBulkEditor() {
  const queryClient = useQueryClient();

  const bulkImport = useMutation({
    mutationFn: async (properties: InsertProperty[]) => {
      const response = await fetch(`${API_BASE}/admin/properties/bulk_import`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ properties }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to bulk import");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["properties"] });
    },
  });

  const bulkUpdate = useMutation({
    mutationFn: async (updates: { id: string; data: UpdateProperty }[]) => {
      const response = await fetch(`${API_BASE}/admin/properties/bulk_update`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to bulk update");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["properties"] });
    },
  });

  return { bulkImport, bulkUpdate };
}

// File upload hooks
export function useUpload() {
  const uploadPhoto = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("photo", file);
      
      const response = await fetch(`${API_BASE}/admin/upload/photo`, {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to upload photo");
      }
      return response.json();
    },
  });

  const uploadPhotos = useMutation({
    mutationFn: async (files: File[]) => {
      const formData = new FormData();
      files.forEach(file => formData.append("photos", file));
      
      const response = await fetch(`${API_BASE}/admin/upload/photos`, {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to upload photos");
      }
      return response.json();
    },
  });

  const uploadDocument = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("document", file);
      
      const response = await fetch(`${API_BASE}/admin/upload/document`, {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to upload document");
      }
      return response.json();
    },
  });

  return { uploadPhoto, uploadPhotos, uploadDocument };
}
