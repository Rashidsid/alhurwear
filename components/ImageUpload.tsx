"use client";

import { useState, useRef } from "react";
import Image from "next/image";

interface ImageUploadProps {
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
}

export default function ImageUpload({ onImagesChange, maxImages = 4 }: ImageUploadProps) {
  const [images, setImages] = useState<string[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // For now, we'll use a simple path - in production, you'd upload to cloud storage
        resolve(`/products/${file.name}`);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFiles = async (files: FileList) => {
    const newFiles = Array.from(files);
    const remainingSlots = maxImages - images.length;
    const filesToProcess = newFiles.slice(0, remainingSlots);

    for (const file of filesToProcess) {
      if (file.type.startsWith("image/")) {
        try {
          const base64 = await convertFileToBase64(file);
          setImages(prev => {
            const updated = [...prev, base64];
            onImagesChange(updated);
            return updated;
          });
        } catch (error) {
          console.error("Error converting file:", error);
        }
      }
    }
  };

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const removeImage = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    setImages(updated);
    onImagesChange(updated);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        Product Images ({images.length}/{maxImages})
      </label>

      {/* Drag and Drop Area */}
      {images.length < maxImages && (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={handleClick}
          className={`relative rounded-lg border-2 border-dashed p-8 text-center cursor-pointer transition ${
            dragActive
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 bg-gray-50 hover:border-gray-400"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleChange}
            className="hidden"
          />
          <div className="space-y-2">
            <div className="text-3xl">📁</div>
            <div className="text-sm text-gray-600">
              <p className="font-medium">Drag and drop your images here</p>
              <p className="text-xs text-gray-500 mt-1">
                or click to browse (PNG, JPG, GIF)
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Maximum {maxImages} images
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div key={index} className="relative group rounded-lg overflow-hidden border border-gray-200 bg-gray-100 aspect-square">
              {image.startsWith("data:") ? (
                <img
                  src={image}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400 text-xs p-2 text-center break-words">
                  Image {index + 1}
                </div>
              )}

              {/* Remove Button */}
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
              >
                ✕
              </button>

              {/* Main Image Badge */}
              {index === 0 && (
                <div className="absolute bottom-1 left-1 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                  Main
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Added Image Indicators */}
      {images.length > 0 && (
        <div className="text-sm text-green-600 font-medium">
          ✓ {images.length} image{images.length !== 1 ? "s" : ""} added
        </div>
      )}
    </div>
  );
}
