import { cn } from "@/lib/utils";
import { useCallback, useState } from "react";
import { FileRejection, useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { Card, CardContent } from "../ui/card";
import {
  RenderErrorState,
  RenderState,
  RenderUploadedState,
  RenderUploadingState
} from "./RenderState";
import { useConstruct } from "@/hooks/use-construct-url";

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

interface UploaderProps {
  value?: string;
  onChange?: (value: string) => void;
  fileTypeAccepted: "image" | "video";
}

const Uploader = ({ value, onChange, fileTypeAccepted }: UploaderProps) => {
  const fileUrl = useConstruct(value);

  const [fileState, setFileState] = useState<UploaderState>({
    id: null,
    file: null,
    uploadingState: false,
    progress: 0,
    isDeleteing: false,
    error: false,
    fileType: fileTypeAccepted,
    key: value,
    objectUrl: value ? fileUrl : undefined
  });

  function renderContent() {
    if (fileState.uploadingState) {
      return (
        <RenderUploadingState
          progress={fileState.progress}
          file={fileState.file as File}
        />
      );
    }

    if (fileState.error) {
      return <RenderErrorState />;
    }

    if (fileState.objectUrl) {
      return (
        <RenderUploadedState
          fileType={fileState.fileType}
          previewUrl={fileState.objectUrl}
          isDeleting={fileState.isDeleteing}
          handleRemoval={handleRemoveFile}
        />
      );
    }

    return <RenderState isDragActive={isDragActive} />;
  }

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length) {
        const file = acceptedFiles[0];

        async function uploadFile(file: File) {
          setFileState((prev) => ({
            ...prev,
            uploadingState: true,
            progress: 0
          }));

          try {
            const preSignedResponse = await fetch("/api/s3/upload", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                fileName: file.name,
                contentType: file.type,
                size: file.size,
                isImage: fileTypeAccepted === "image" ? true : false
              })
            });

            if (!preSignedResponse.ok) {
              toast.error("Failed to get presigned URL");
              setFileState((prev) => ({
                ...prev,
                uploadingState: false,
                error: true,
                progress: 0
              }));
              return;
            }

            const { Key, presignedurl } = await preSignedResponse.json();

            await new Promise<void>((resolve, reject) => {
              const xhr = new XMLHttpRequest();

              xhr.upload.onprogress = (event) => {
                if (event.lengthComputable) {
                  const perecentageCompleted =
                    (event.loaded / event.total) * 100;
                  setFileState((prev) => ({
                    ...prev,
                    uploadingState: true,
                    progress: Math.round(perecentageCompleted)
                  }));
                }
              };
              xhr.onload = () => {
                if (xhr.status === 200 || xhr.status === 204) {
                  setFileState((prev) => ({
                    ...prev,
                    uploadingState: false,
                    progress: 100,
                    key: Key
                  }));
                  onChange?.(Key);
                  toast.success("File uploaded Successfully");
                  resolve();
                }
              };

              xhr.onerror = () => {
                reject(new Error("Upload Failed"));
              };

              xhr.open("PUT", presignedurl);
              xhr.setRequestHeader("Content-Type", file.type);
              xhr.send(file);
            });
          } catch {
            toast.error("something went wrong");
            setFileState((prev) => ({
              ...prev,
              uploadingState: false,
              progress: 0,
              error: true
            }));
          }
        }

        setFileState({
          id: crypto.randomUUID().substring(10),
          file,
          uploadingState: false,
          isDeleteing: false,
          progress: 0,
          objectUrl: URL.createObjectURL(file),
          error: false,
          fileType: fileTypeAccepted
        });

        uploadFile(file);
      }
    },
    [fileTypeAccepted, onChange]
  );

  async function handleRemoveFile() {
    if (fileState.isDeleteing || !fileState.objectUrl) return;

    try {
      setFileState((prev) => ({
        ...prev,
        isDeleteing: true
      }));

      const response = await fetch("/api/s3/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Key: fileState.key
        })
      });

      if (!response.ok) {
        toast.error("Failed to remove file from storage ");

        setFileState((prev) => ({
          ...prev,
          isDeleteing: true,
          error: true
        }));
        return;
      }

      if (fileState.objectUrl && !fileState.objectUrl.startsWith("http")) {
        URL.revokeObjectURL(fileState.objectUrl);
      }

      onChange?.("");

      setFileState(() => ({
        id: null,
        file: null,
        uploadingState: false,
        progress: 0,
        isDeleteing: false,
        error: false,
        fileType: fileTypeAccepted
      }));

      toast.success("Filed Remvoed succesfully");
    } catch {
      toast.error("Error removing file. please try again");
      setFileState((prev) => ({
        ...prev,
        isDeleteing: false,
        error: true
      }));
    }
  }

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
    accept:
      fileTypeAccepted === "video" ? { "video/*": [] } : { "image/*": [] },
    maxFiles: 1,
    multiple: false,
    maxSize:
      fileTypeAccepted === "image" ? 5 * 1024 * 1024 : 5000 * 1024 * 1024,
    onDropRejected: rejectedFiles,
    disabled: fileState.uploadingState || !!fileState.objectUrl
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
        {renderContent()}
      </CardContent>
    </Card>
  );
};

export default Uploader;
