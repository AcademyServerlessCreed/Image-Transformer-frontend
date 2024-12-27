"use client";

import { useState, useRef, useEffect } from "react";
import { Upload, ImageIcon, Download, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  validateFile,
  convertToBase64,
  predefinedSizes,
  MAX_FILE_SIZE,
  sanitizeFilename,
} from "@/lib/image-utils";
import type {
  UploadResponse,
  GetUrlResponse,
  ResizedImage,
} from "@/types/image";
import { ImagePreview } from "./image-preview";

const API_ENDPOINT =
  "ENTER_YOUR_URL_HERE";

export function ImageUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedImages, setUploadedImages] = useState<UploadResponse | null>(
    null
  );
  const [resizedImages, setResizedImages] = useState<ResizedImage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    handleFile(droppedFile);
  };

  const handleFile = (selectedFile: File) => {
    const error = validateFile(selectedFile);
    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error,
      });
      return;
    }

    setFile(selectedFile);
    const objectUrl = URL.createObjectURL(selectedFile);
    setPreview(objectUrl);
  };

  const handleUpload = async () => {
    if (!file) return;

    try {
      setIsUploading(true);
      setUploadProgress(0);

      const base64Image = await convertToBase64(file);

      const payload = {
        filename: sanitizeFilename(file.name),
        contentType: file.type,
        base64Image,
        sizes: predefinedSizes,
      };

      const response = await fetch(`${API_ENDPOINT}/upload`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Upload failed:", response.status, errorText);
        throw new Error(`Upload failed: ${response.status} ${errorText}`);
      }

      const data: UploadResponse = await response.json();
      console.log("upload data", data);
      setUploadedImages(data);

      toast({
        title: "Success",
        description: "Image uploaded successfully",
      });

      // Start processing
      setIsProcessing(true);
      setProcessingProgress(0);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to upload image",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(100);
    }
  };

  const fetchResizedImages = async () => {
    if (!uploadedImages) return;

    const resizedUrls: ResizedImage[] = [];

    try {
      const response = await fetch(
        `${API_ENDPOINT}/get-url?key=${uploadedImages.filename}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch URLs");
      }
      const data: GetUrlResponse = await response.json();
      console.log("resized data", data);

      // Add both resized versions with their corresponding dimensions
      resizedUrls.push({
        url: data.url1,
        width: 200,
        height: 200,
      });
      resizedUrls.push({
        url: data.url2,
        width: 800,
        height: 600,
      });
    } catch (error) {
      console.error(`Error fetching resized image URLs: ${error}`);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch resized images",
      });
    }

    setResizedImages(resizedUrls);
  };

  const resetAllStates = () => {
    setFile(null);
    setPreview(null);
    setIsUploading(false);
    setUploadProgress(0);
    setUploadedImages(null);
    setResizedImages([]);
    setIsProcessing(false);
    setProcessingProgress(0);
  };

  useEffect(() => {
    if (isProcessing) {
      const timer = setInterval(() => {
        setProcessingProgress((prev) => {
          if (prev >= 100) {
            clearInterval(timer);
            setIsProcessing(false);
            fetchResizedImages();
            return 100;
          }
          return prev + 20;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isProcessing]);

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Image Uploader</CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          {preview ? (
            <div className="space-y-4">
              <ImagePreview src={preview} alt="Preview" />
              <p className="text-sm text-muted-foreground">{file?.name}</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="mx-auto w-12 h-12 text-gray-400">
                <ImageIcon className="w-12 h-12" />
              </div>
              <div className="space-y-1">
                <p>Drag and drop your image here, or click to select</p>
                <p className="text-sm text-muted-foreground">
                  Maximum file size: {MAX_FILE_SIZE / (1024 * 1024)}MB
                </p>
              </div>
            </div>
          )}
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={(e) =>
              e.target.files?.[0] && handleFile(e.target.files[0])
            }
            ref={fileInputRef}
          />
        </div>
        {isUploading && (
          <div className="mt-4 space-y-2">
            <Progress value={uploadProgress} />
            <p className="text-sm text-center text-muted-foreground">
              Uploading...
            </p>
          </div>
        )}
        {isProcessing && (
          <div className="mt-4 space-y-2">
            <Progress value={processingProgress} />
            <p className="text-sm text-center text-muted-foreground">
              Processing image...
            </p>
          </div>
        )}
        {resizedImages.length > 0 && (
          <div className="mt-4 space-y-4">
            <h3 className="text-lg font-semibold">Resized Images</h3>
            <div className="grid grid-cols-2 gap-4">
              {resizedImages.map((image, index) => (
                <div key={index} className="space-y-2">
                  <ImagePreview
                    src={image.url}
                    alt={`Resized ${image.width}x${image.height}`}
                  />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      {image.width}x{image.height}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(image.url, "_blank")}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end space-x-2">
        {file && (
          <>
            <Button variant="outline" onClick={resetAllStates}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button
              onClick={handleUpload}
              disabled={isUploading || isProcessing}
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
}
