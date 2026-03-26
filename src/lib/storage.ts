import { supabase } from "./supabase";

/**
 * Upload an image file to Supabase storage
 */
export const uploadImage = async (
  file: File,
  bucket: "product-images" | "profile-images" | "auction-images" | "hero-images",
  folder?: string
): Promise<string> => {
  try {
    // Create unique filename
    const timestamp = Date.now();
    const filename = `${folder ? folder + "/" : ""}${timestamp}-${file.name}`;

    // Upload to storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filename, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) throw error;
    if (!data?.path) throw new Error("Failed to upload image");

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return publicUrl;
  } catch (error) {
    throw new Error(
      `Image upload failed: ${error instanceof Error ? error.message : String(error)}`
    );
  }
};

/**
 * Delete an image from Supabase storage
 */
export const deleteImage = async (
  fileUrl: string,
  bucket: "product-images" | "profile-images" | "auction-images" | "hero-images"
): Promise<void> => {
  try {
    // Extract path from URL
    const urlParts = fileUrl.split("/");
    const filePath = urlParts.slice(-1).join("/");

    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);

    if (error) throw error;
  } catch (error) {
    throw new Error(
      `Image deletion failed: ${error instanceof Error ? error.message : String(error)}`
    );
  }
};

/**
 * Get public URL for a stored image
 */
export const getImageUrl = (
  filePath: string,
  bucket: "product-images" | "profile-images" | "auction-images" | "hero-images"
): string => {
  const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
  return data?.publicUrl || "";
};
