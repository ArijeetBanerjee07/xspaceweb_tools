import { v2 as cloudinary } from "cloudinary";
import crypto from "crypto";
import { fileTypeFromBuffer } from "file-type";
import { getEnv } from "@/lib/env";

export interface SignedUploadParams {
  timestamp: number;
  signature: string;
  apiKey: string;
  cloudName: string;
  folder: string;
  publicId: string;
  resourceType: "image" | "raw";
  type: "authenticated";
  allowed_formats?: string[];
}

export interface ResourceDetails {
  publicId: string;
  bytes: number;
  format: string;
  resourceType: "image" | "raw";
  secureUrl: string;
  sha256?: string;
}

export interface VirusScanner {
  scan(buffer: Buffer): Promise<{ isClean: boolean; virusName?: string }>;
}

export class NoOpVirusScanner implements VirusScanner {
  async scan(_buffer: Buffer): Promise<{ isClean: boolean; virusName?: string }> {
    // TODO: implement real ClamAV or cloud antivirus scanner before production
    return { isClean: true };
  }
}

export interface StorageAdapter {
  createUploadSignature(options: {
    workspaceId: string;
    fileId: string;
    resourceType: "image" | "raw";
    allowedFormats?: string[];
  }): SignedUploadParams;

  getResource(publicId: string, resourceType: "image" | "raw"): Promise<ResourceDetails>;

  getDownloadUrl(options: {
    publicId: string;
    format?: string;
    resourceType: "image" | "raw";
    expiresInSeconds?: number;
  }): string;

  uploadBuffer(options: {
    buffer: Buffer;
    folder: string;
    publicId: string;
    resourceType: "image" | "raw";
    format?: string;
  }): Promise<ResourceDetails>;

  deleteResource(publicId: string, resourceType: "image" | "raw"): Promise<boolean>;

  fetchBuffer(publicId: string, resourceType: "image" | "raw", format?: string): Promise<Buffer>;
}

export function getResourceType(mimeType: string, filename?: string): "image" | "raw" {
  const lowerMime = mimeType.toLowerCase();
  const lowerName = (filename || "").toLowerCase();

  if (
    lowerMime === "application/pdf" ||
    lowerMime.startsWith("image/") ||
    lowerName.endsWith(".pdf") ||
    /\.(png|jpe?g|gif|webp|svg|bmp|tiff)$/i.test(lowerName)
  ) {
    return "image";
  }
  return "raw";
}

export class CloudinaryStorageAdapter implements StorageAdapter {
  private configured = false;

  private ensureConfigured() {
    if (this.configured) return;
    const env = getEnv();
    cloudinary.config({
      cloud_name: env.CLOUDINARY_CLOUD_NAME,
      api_key: env.CLOUDINARY_API_KEY,
      api_secret: env.CLOUDINARY_API_SECRET,
      secure: true,
    });
    this.configured = true;
  }

  createUploadSignature(options: {
    workspaceId: string;
    fileId: string;
    resourceType: "image" | "raw";
    allowedFormats?: string[];
  }): SignedUploadParams {
    this.ensureConfigured();
    const env = getEnv();
    const timestamp = Math.floor(Date.now() / 1000);
    const folder = `${env.CLOUDINARY_FOLDER}/${options.workspaceId}/uploads`;
    const publicId = options.fileId;

    const paramsToSign: Record<string, string | number> = {
      folder,
      public_id: publicId,
      timestamp,
      type: "authenticated",
    };

    if (options.allowedFormats && options.allowedFormats.length > 0) {
      paramsToSign.allowed_formats = options.allowedFormats.join(",");
    }

    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      env.CLOUDINARY_API_SECRET
    );

    return {
      timestamp,
      signature,
      apiKey: env.CLOUDINARY_API_KEY,
      cloudName: env.CLOUDINARY_CLOUD_NAME,
      folder,
      publicId,
      resourceType: options.resourceType,
      type: "authenticated",
      allowed_formats: options.allowedFormats,
    };
  }

  getDownloadUrl(options: {
    publicId: string;
    format?: string;
    resourceType: "image" | "raw";
    expiresInSeconds?: number;
  }): string {
    this.ensureConfigured();
    const expiresIn = options.expiresInSeconds ?? 300; // 5 minutes default
    const expiresAt = Math.floor(Date.now() / 1000) + expiresIn;

    return cloudinary.utils.private_download_url(
      options.publicId,
      options.format || "",
      {
        resource_type: options.resourceType,
        type: "authenticated",
        expires_at: expiresAt,
      }
    );
  }

  async getResource(
    publicId: string,
    resourceType: "image" | "raw"
  ): Promise<ResourceDetails> {
    this.ensureConfigured();
    const res = await cloudinary.api.resource(publicId, {
      resource_type: resourceType,
      type: "authenticated",
    });

    return {
      publicId: res.public_id,
      bytes: res.bytes,
      format: res.format || "",
      resourceType,
      secureUrl: res.secure_url,
      sha256: (res as unknown as { etag?: string }).etag,
    };
  }

  async fetchBuffer(
    publicId: string,
    resourceType: "image" | "raw",
    format?: string
  ): Promise<Buffer> {
    const downloadUrl = this.getDownloadUrl({
      publicId,
      format,
      resourceType,
      expiresInSeconds: 300,
    });
    const response = await fetch(downloadUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch file from storage: ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  async uploadBuffer(options: {
    buffer: Buffer;
    folder: string;
    publicId: string;
    resourceType: "image" | "raw";
    format?: string;
  }): Promise<ResourceDetails> {
    this.ensureConfigured();
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: options.folder,
          public_id: options.publicId,
          resource_type: options.resourceType,
          type: "authenticated",
          format: options.format,
          overwrite: true,
        },
        (error, result) => {
          if (error || !result) {
            return reject(error || new Error("Cloudinary upload failed"));
          }
          resolve({
            publicId: result.public_id,
            bytes: result.bytes,
            format: result.format || "",
            resourceType: options.resourceType,
            secureUrl: result.secure_url,
            sha256: (result as unknown as { etag?: string }).etag,
          });
        }
      );
      uploadStream.end(options.buffer);
    });
  }

  async deleteResource(
    publicId: string,
    resourceType: "image" | "raw"
  ): Promise<boolean> {
    this.ensureConfigured();
    try {
      const res = await cloudinary.uploader.destroy(publicId, {
        resource_type: resourceType,
        type: "authenticated",
        invalidate: true,
      });
      return res.result === "ok" || res.result === "not found";
    } catch {
      return false;
    }
  }
}

// Default singleton instance
export const storage: StorageAdapter = new CloudinaryStorageAdapter();
export const virusScanner: VirusScanner = new NoOpVirusScanner();
