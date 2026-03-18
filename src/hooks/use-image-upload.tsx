import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./use-auth";

const BUCKET = "listing-images";

export function useImageUpload() {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);

  const uploadImage = useCallback(
    async (file: File): Promise<string | null> => {
      if (!user) return null;
      setUploading(true);

      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${user.id}/${crypto.randomUUID()}.${ext}`;

      const { error } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, { cacheControl: "3600", upsert: false });

      setUploading(false);
      if (error) {
        console.error("Upload error:", error.message);
        return null;
      }

      const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
      return data.publicUrl;
    },
    [user]
  );

  const deleteImage = useCallback(
    async (url: string) => {
      if (!user) return;
      // Extract path from URL: ...listing-images/USER_ID/FILE.ext
      const parts = url.split(`/${BUCKET}/`);
      if (parts.length < 2) return;
      const path = parts[1];
      await supabase.storage.from(BUCKET).remove([path]);
    },
    [user]
  );

  return { uploadImage, deleteImage, uploading };
}
