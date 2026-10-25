/**
 * cPanel Document Hub Storage Client
 * Integrates Document Hub with the user's cPanel storage on sweetumolu.in
 */

export interface CPanelUploadResult {
  success: boolean;
  originalName: string;
  storedName: string;
  url: string;
  sizeBytes: number;
  mimeType: string;
  storedAt: string;
}

export class CPanelStorageAdapter {
  private endpoint: string;
  private secret: string;

  constructor() {
    this.endpoint = (process.env.CPANEL_STORAGE_ENDPOINT || "").trim();
    this.secret = (process.env.CPANEL_STORAGE_SECRET || "").trim();
  }

  public isConfigured(): boolean {
    return Boolean(this.endpoint && this.endpoint.startsWith("http"));
  }

  /**
   * Uploads a document buffer to sweetumolu.in/xswtools/uploads/
   */
  public async uploadBuffer(options: {
    buffer: Buffer;
    fileName: string;
    mimeType?: string;
    folder?: string;
  }): Promise<CPanelUploadResult> {
    if (!this.isConfigured()) {
      throw new Error("cPanel storage is not configured. Set CPANEL_STORAGE_ENDPOINT in .env.");
    }

    const formData = new FormData();
    const blob = new Blob([new Uint8Array(options.buffer)], {
      type: options.mimeType || "application/octet-stream",
    });

    formData.append("file", blob, options.fileName);
    if (options.folder) {
      formData.append("folder", options.folder);
    }

    const headers: Record<string, string> = {};
    if (this.secret) {
      headers["Authorization"] = `Bearer ${this.secret}`;
    }

    const res = await fetch(this.endpoint, {
      method: "POST",
      headers,
      body: formData,
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => "Upload failed");
      throw new Error(`cPanel upload error (${res.status}): ${errorText}`);
    }

    const data = await res.json();
    if (!data.success || !data.url) {
      throw new Error(data.error || "cPanel storage responded without a valid file URL.");
    }

    return data as CPanelUploadResult;
  }

  /**
   * Deletes a file from cPanel storage
   */
  public async deleteFile(storedName: string): Promise<boolean> {
    if (!this.isConfigured() || !storedName) return false;

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (this.secret) {
        headers["Authorization"] = `Bearer ${this.secret}`;
      }

      const res = await fetch(this.endpoint, {
        method: "DELETE",
        headers,
        body: JSON.stringify({ storedName }),
      });

      return res.ok;
    } catch (err) {
      console.warn("[cPanel delete warning]:", err);
      return false;
    }
  }

  /**
   * Health check to check live free space on cPanel
   */
  public async getStorageStatus(): Promise<any> {
    if (!this.isConfigured()) return null;

    try {
      const headers: Record<string, string> = {};
      if (this.secret) {
        headers["Authorization"] = `Bearer ${this.secret}`;
      }

      const res = await fetch(this.endpoint, { method: "GET", headers });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }
}
