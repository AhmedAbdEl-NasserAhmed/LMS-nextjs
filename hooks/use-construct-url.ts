import { env } from "@/lib/env";

export function useConstruct(key: string) {
  return `https://${env.NEXT_PUBLIC_S3_BUCKET_NAME_IMAGES}.fly.storage.tigris.dev/${key}`;
}
