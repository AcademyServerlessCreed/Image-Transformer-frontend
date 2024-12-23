export interface ImageSize {
  width: number;
  height: number;
}

export interface UploadPayload {
  filename: string;
  contentType: string;
  base64Image: string;
  sizes: ImageSize[];
}

export interface UploadResponse {
  message: string;
  filename: string;
  urls: {
    original: string;
    resized: string[];
  };
}

// First, update the types to match the API response
export type GetUrlResponse = {
  url1: string;
  url2: string;
  expiresIn: number;
};

export type ResizedImage = {
  url: string;
  width: number;
  height: number;
};
