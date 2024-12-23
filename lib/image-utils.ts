export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export function validateFile(file: File): string | null {
  if (!file.type.startsWith("image/")) {
    return "File must be an image";
  }

  if (file.size > MAX_FILE_SIZE) {
    return "Image must be less than 5MB";
  }

  return null;
}

export const convertToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

export const predefinedSizes: { width: number; height: number }[] = [
  { width: 200, height: 200 },
  { width: 800, height: 600 },
];

export function sanitizeFilename(filename: string): string {
  // Remove any characters that are not alphanumeric, dots, dashes, or underscores
  return filename.replace(/[^a-zA-Z0-9._-]/g, "_");
}
