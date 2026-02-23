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
        // Store as base64 data URL for display
        resolve(result);
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

      {/* Image Preview Grid - Uniform Frame Sizes */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div key={index} className="relative group rounded-lg overflow-hidden border-2 border-gray-300 bg-gray-100 aspect-square shadow-md hover:shadow-lg transition">
              <img
                src={image}
                alt={`Preview ${index + 1}`}
                className="w-full h-full object-cover"
              />

              {/* Remove Button */}
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition font-bold text-xl hover:bg-red-700"
              >
                ✕
              </button>

              {/* Main Image Badge */}
              {index === 0 && (
                <div className="absolute bottom-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded font-semibold">
                  Main
                </div>
              )}
              
              {/* Image Order Badge */}
              <div className="absolute top-2 left-2 bg-gray-800 text-white text-xs px-2 py-1 rounded font-semibold">
                {index + 1}
              </div>
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
