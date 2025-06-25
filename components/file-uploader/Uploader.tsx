import React, { useCallback, useState } from "react";
import { FileRejection, useDropzone } from "react-dropzone";
import { Card, CardContent } from "../ui/card";
import { cn } from "@/lib/utils";
import { RenderErrorState, RenderState } from "./RenderState";
import { toast } from "sonner";
import { boolean } from "zod";

interface UploaderState {
  id: string | null;
  file: File | null;
  uploadingState: boolean;
  progress: number;
  key?: string;
  isDeleteing: boolean;
  error: boolean;
  objectUrl?: string;
  fileType: "image" | "video";
}

const Uploader = () => {
  const [fileState, setFileState] = useState<UploaderState>({
    id: null,
    file: null,
    uploadingState: false,
    progress: 0,
    isDeleteing: false,
    error: false,
    fileType: "image"
  });

  function uploadFile(file: File) {
    setFileState((prev) => ({
      ...prev,
      id: crypto.randomUUID().substring(10),
      file,
      uploadingState: true,
      progress: 0
    }));

    try {




      
    } catch (error) {}
  }

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length) {
      const file = acceptedFiles[0];

      setFileState({
        id: crypto.randomUUID().substring(10),
        file,
        uploadingState: false,
        isDeleteing: false,
        progress: 0,
        objectUrl: URL.createObjectURL(file),
        error: false,
        fileType: "image"
      });
    }
  }, []);

  function rejectedFiles(fileRejection: FileRejection[]) {
    if (fileRejection.length) {
      const tooManyFiles = fileRejection.find((rejection) => {
        return rejection.errors[0].code === "too-many-files";
      });

      const fileSizeBig = fileRejection.find((rejection) => {
        return rejection.errors[0].code === "too-too-large";
      });

      const fileInvalidType = fileRejection.find((rejection) => {
        return rejection.errors[0].code === "file-invalid-type";
      });

      if (tooManyFiles) {
        toast.error("Too many files selected max is 1");
      }

      if (fileSizeBig) {
        toast.error("File Size exceeds the limit");
      }

      if (fileInvalidType) {
        toast.error("File type must be image");
      }
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    maxFiles: 1,
    multiple: false,
    maxSize: 5 * 1024 * 1024, // 5MB,
    onDropRejected: rejectedFiles
  });

  return (
    <Card
      {...getRootProps()}
      className={cn(
        "relative border-2 border-dashed transition-colors duration-200 ease-in-out w-full h-64 ",
        isDragActive
          ? "border-primary bg-primary/10 border-solid"
          : "border-border hover:border-primary"
      )}
    >
      <CardContent className="flex items-center justify-center h-full w-full p-4">
        <input {...getInputProps()} />
        <RenderState isDragActive={isDragActive} />
      </CardContent>
    </Card>
  );
};

export default Uploader;
