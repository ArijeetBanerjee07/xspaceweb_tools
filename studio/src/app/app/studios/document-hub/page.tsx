"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UpgradeCheckoutModal } from "@/components/studio/UpgradeCheckoutModal";
import {
  LuFolder,
  LuFolderPlus,
  LuFile,
  LuFileText,
  LuFileSpreadsheet,
  LuPresentation,
  LuImage,
  LuSearch,
  LuUpload,
  LuTrash2,
  LuEye,
  LuDownload,
  LuTag,
  LuHistory,
  LuPlus,
  LuCheck,
  LuCircleAlert,
  LuCrown,
  LuSparkles,
  LuClock,
  LuExternalLink,
  LuLayoutGrid,
  LuList,
  LuX,
  LuHardDrive,
  LuShieldCheck,
  LuArrowRight,
  LuRefreshCw,
} from "react-icons/lu";

interface DocumentFile {
  id: string;
  name: string;
  sizeBytes: number;
  mimeType: string;
  secureUrl?: string;
  publicId?: string;
  previewUrl?: string;
  previewText?: string;
  folderId?: string | null;
  folderName?: string | null;
  tags?: string[];
  status?: string;
  createdAt: string;
  expiresAt?: string;
  retentionPolicy?: string;
}

interface DocumentFolder {
  id: string;
  name: string;
  color?: string;
  createdAt: string;
}

interface DocumentActivity {
  id: string;
  type: string;
  description: string;
  createdAt: string;
}

interface DocumentHubData {
  files: DocumentFile[];
  folders: DocumentFolder[];
  activities: DocumentActivity[];
  quota: {
    fileCount: number;
    maxFiles: number;
    folderCount: number;
    maxFolders: number;
    planId: string;
    isPro: boolean;
  };
}

export default function DocumentHubPage() {
  const router = useRouter();
  const [data, setData] = useState<DocumentHubData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFolderId, setSelectedFolderId] = useState<string>("all");
  const [selectedTag, setSelectedTag] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activeTab, setActiveTab] = useState<"documents" | "history">("documents");

  // Modals & Drawers
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
  const [isNewFolderOpen, setIsNewFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderColor, setNewFolderColor] = useState("cyan");
  const [previewFile, setPreviewFile] = useState<DocumentFile | null>(null);
  const [editTagFile, setEditTagFile] = useState<DocumentFile | null>(null);
  const [tagInput, setTagInput] = useState("");

  // Uploading State
  const [isUploading, setIsUploading] = useState(false);
  const [uploadFolderId, setUploadFolderId] = useState<string>("");
  const [uploadTags, setUploadTags] = useState<string>("");
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const localBlobUrls = useRef<Record<string, string>>({});

  // Search Bar Dropdown & Focus State
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Load Document Hub Data
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/document-hub");
      if (!res.ok) {
        throw new Error("Failed to load documents");
      }
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err?.message || "Failed to load document hub");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Format Helpers
  const formatBytes = (bytes: number) => {
    if (!bytes || bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    } catch {
      return iso;
    }
  };

  const getFileIcon = (mimeType: string, name: string) => {
    const ext = name.split(".").pop()?.toLowerCase();
    if (mimeType.includes("pdf") || ext === "pdf") {
      return <LuFileText className="w-5 h-5 text-red-500" />;
    }
    if (
      mimeType.includes("word") ||
      mimeType.includes("document") ||
      ext === "docx" ||
      ext === "doc"
    ) {
      return <LuFileText className="w-5 h-5 text-blue-500" />;
    }
    if (
      mimeType.includes("sheet") ||
      mimeType.includes("excel") ||
      mimeType.includes("csv") ||
      ext === "xlsx" ||
      ext === "csv"
    ) {
      return <LuFileSpreadsheet className="w-5 h-5 text-emerald-500" />;
    }
    if (
      mimeType.includes("presentation") ||
      mimeType.includes("powerpoint") ||
      ext === "pptx" ||
      ext === "ppt"
    ) {
      return <LuPresentation className="w-5 h-5 text-amber-500" />;
    }
    if (mimeType.startsWith("image/") || ["png", "jpg", "jpeg", "webp", "svg"].includes(ext || "")) {
      return <LuImage className="w-5 h-5 text-purple-500" />;
    }
    return <LuFile className="w-5 h-5 text-cyan-600" />;
  };

  // Quota computations
  const quota = data?.quota || {
    fileCount: 0,
    maxFiles: 5,
    folderCount: 0,
    maxFolders: 3,
    planId: "free",
    isPro: false,
  };

  const isFileQuotaReached = quota.fileCount >= quota.maxFiles;
  const isFolderQuotaReached = quota.folderCount >= quota.maxFolders;

  // Tag extraction
  const allTags = useMemo(() => {
    if (!data?.files) return [];
    const set = new Set<string>();
    data.files.forEach((f) => {
      (f.tags || []).forEach((t) => {
        if (t.trim()) set.add(t.trim());
      });
    });
    return Array.from(set);
  }, [data?.files]);

  // Filtered files
  const filteredFiles = useMemo(() => {
    if (!data?.files) return [];
    return data.files.filter((file) => {
      // 1. Folder filter
      if (selectedFolderId === "unorganized" && file.folderId) return false;
      if (selectedFolderId !== "all" && selectedFolderId !== "unorganized" && file.folderId !== selectedFolderId) {
        return false;
      }
      // 2. Tag filter
      if (selectedTag !== "all") {
        if (!file.tags || !file.tags.includes(selectedTag)) return false;
      }
      // 3. Full-text & metadata search query (free for all users)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = file.name.toLowerCase().includes(q);
        const matchesFolder = (file.folderName || "").toLowerCase().includes(q);
        const matchesTags = (file.tags || []).some((t) => t.toLowerCase().includes(q));
        const matchesMime = file.mimeType.toLowerCase().includes(q);
        if (!matchesName && !matchesFolder && !matchesTags && !matchesMime) return false;
      }
      return true;
    });
  }, [data?.files, selectedFolderId, selectedTag, searchQuery]);

  // Recent files (latest 4 files for instant resume)
  const recentFiles = useMemo(() => {
    if (!data?.files) return [];
    return [...data.files]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 4);
  }, [data?.files]);

  // Real-time search across all documents for the dropdown suggestions
  const searchResults = useMemo(() => {
    if (!data?.files || !searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return data.files.filter((file) => {
      const matchesName = file.name.toLowerCase().includes(q);
      const matchesFolder = (file.folderName || "").toLowerCase().includes(q);
      const matchesTags = (file.tags || []).some((t) => t.toLowerCase().includes(q));
      const matchesMime = file.mimeType.toLowerCase().includes(q);
      const matchesText = (file.previewText || "").toLowerCase().includes(q);
      return matchesName || matchesFolder || matchesTags || matchesMime || matchesText;
    });
  }, [data?.files, searchQuery]);

  const handleSelectSearchResult = (file: DocumentFile) => {
    if (file.folderId) {
      setSelectedFolderId(file.folderId);
    } else {
      setSelectedFolderId("all");
    }
    setIsSearchFocused(false);
    router.push(`/app/studios/document-hub/preview/${file.id}`);
  };

  // Upload Handler
  const handleUploadFiles = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;

    if (isFileQuotaReached) {
      setIsUpgradeOpen(true);
      return;
    }

    try {
      setIsUploading(true);
      const fileToUpload = files[0]; // upload first file

      const formData = new FormData();
      formData.append("file", fileToUpload);
      if (uploadFolderId) {
        formData.append("folderId", uploadFolderId);
        const selectedFld = data?.folders.find((f) => f.id === uploadFolderId);
        if (selectedFld) formData.append("folderName", selectedFld.name);
      }
      if (uploadTags.trim()) {
        formData.append("tags", uploadTags.trim());
      }

      const res = await fetch("/api/document-hub", {
        method: "POST",
        body: formData,
      });

      const resData = await res.json();
      if (!res.ok) {
        if (res.status === 403) {
          setIsUpgradeOpen(true);
        }
        throw new Error(resData.error || "Upload failed");
      }

      if (resData?.id) {
        try {
          localBlobUrls.current[resData.id] = URL.createObjectURL(fileToUpload);
        } catch {}
      }

      setUploadTags("");
      await loadData();
    } catch (err: any) {
      alert(err?.message || "Failed to upload file");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Create Folder Handler
  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    if (isFolderQuotaReached) {
      setIsNewFolderOpen(false);
      setIsUpgradeOpen(true);
      return;
    }

    try {
      const res = await fetch("/api/document-hub", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create-folder",
          name: newFolderName.trim(),
          color: newFolderColor,
        }),
      });

      const resData = await res.json();
      if (!res.ok) {
        if (res.status === 403) {
          setIsNewFolderOpen(false);
          setIsUpgradeOpen(true);
        }
        throw new Error(resData.error || "Failed to create folder");
      }

      setNewFolderName("");
      setIsNewFolderOpen(false);
      await loadData();
    } catch (err: any) {
      alert(err?.message || "Failed to create folder");
    }
  };

  // Delete File Handler
  const handleDeleteFile = async (fileId: string, fileName: string) => {
    if (!confirm(`Are you sure you want to delete "${fileName}"?`)) return;
    try {
      const res = await fetch(`/api/document-hub?fileId=${fileId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Delete failed");
      await loadData();
    } catch (err: any) {
      alert(err?.message || "Failed to delete file");
    }
  };

  // Delete Folder Handler
  const handleDeleteFolder = async (folderId: string, folderName: string) => {
    if (!confirm(`Delete folder "${folderName}"? (Files will remain in Hub as unorganized)`)) return;
    try {
      const res = await fetch(`/api/document-hub?folderId=${folderId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete folder");
      if (selectedFolderId === folderId) setSelectedFolderId("all");
      await loadData();
    } catch (err: any) {
      alert(err?.message || "Failed to delete folder");
    }
  };

  // Update Tags Handler
  const handleSaveTags = async () => {
    if (!editTagFile) return;
    try {
      const parsedTags = tagInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const res = await fetch("/api/document-hub", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileId: editTagFile.id,
          tags: parsedTags,
        }),
      });

      if (!res.ok) throw new Error("Failed to update tags");
      setEditTagFile(null);
      await loadData();
    } catch (err: any) {
      alert(err?.message || "Failed to update tags");
    }
  };

  // Move Folder Handler
  const handleMoveFolder = async (fileId: string, targetFolderId: string) => {
    try {
      const folder = data?.folders.find((f) => f.id === targetFolderId);
      const res = await fetch("/api/document-hub", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileId,
          folderId: targetFolderId === "none" ? null : targetFolderId,
          folderName: targetFolderId === "none" ? null : folder?.name || null,
        }),
      });

      if (!res.ok) throw new Error("Failed to move file");
      await loadData();
    } catch (err: any) {
      alert(err?.message || "Failed to move folder");
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between text-xs font-medium text-slate-500">
        <div className="flex items-center gap-2">
          <Link href="/app" className="hover:text-cyan-600 transition">
            Home
          </Link>
          <span>&rsaquo;</span>
          <span className="text-slate-800 font-semibold">Document Hub</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-cyan-50 text-cyan-700 border border-cyan-200">
            <LuHardDrive className="w-3 h-3 text-cyan-600" />
            Cloudinary Storage Active
          </span>
        </div>
      </div>

      {/* Hero Header & Quota Bar */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-cyan-900 via-sky-900 to-slate-900 text-white p-6 sm:p-8 shadow-xl border border-cyan-800/40">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-cyan-500/20 via-sky-500/10 to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              Document Storage & Organization
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Document <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-sky-200">Hub</span>
            </h1>
            <p className="text-sm text-cyan-100/80 leading-relaxed">
              Store documents with retention controls, organize into folders by client or project, and search across indexed text and metadata.
            </p>
          </div>

          {/* Quotas & Retention Controls Card */}
          <div className="bg-slate-950/60 backdrop-blur-md border border-cyan-500/30 rounded-2xl p-4 sm:p-5 w-full md:w-80 shrink-0 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <LuShieldCheck className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-200">
                  {quota.isPro ? "Pro Tier" : "Free Plan"}
                </span>
              </div>
              <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                {quota.isPro ? "Permanent Retention" : "30-day retention"}
              </span>
            </div>

            {/* Storage Quota Progress */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300">File Storage Quota</span>
                <span className="font-bold text-white">
                  {quota.fileCount} / {quota.maxFiles} files
                </span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isFileQuotaReached ? "bg-red-500" : "bg-gradient-to-r from-cyan-500 to-sky-400"
                  }`}
                  style={{ width: `${Math.min(100, (quota.fileCount / quota.maxFiles) * 100)}%` }}
                />
              </div>
              {isFileQuotaReached && (
                <div className="flex items-center gap-1 text-[11px] text-red-300 font-medium">
                  <LuCircleAlert className="w-3.5 h-3.5 shrink-0" />
                  <span>Free quota reached (5/5). Upgrade for unlimited storage.</span>
                </div>
              )}
            </div>

            {/* Folder Quota Progress */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300">Folders Quota</span>
                <span className="font-bold text-white">
                  {quota.folderCount} / {quota.maxFolders} folders
                </span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isFolderQuotaReached ? "bg-amber-500" : "bg-cyan-400"
                  }`}
                  style={{ width: `${Math.min(100, (quota.folderCount / quota.maxFolders) * 100)}%` }}
                />
              </div>
            </div>

            {/* Upgrade CTA */}
            {!quota.isPro && (
              <button
                type="button"
                onClick={() => setIsUpgradeOpen(true)}
                className="w-full py-2 px-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl text-xs font-bold shadow-lg transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <LuCrown className="w-3.5 h-3.5 text-amber-300" />
                <span>Unlock Unlimited Documents & Retention</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Recent Documents & Saved Projects Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LuClock className="w-4 h-4 text-cyan-600" />
            <h2 className="font-bold text-slate-900 text-sm">Recent Documents & Saved Projects</h2>
            <span className="text-xs text-slate-400 font-medium">(Quickly return to ongoing work)</span>
          </div>
          {data?.files && data.files.length > 0 && (
            <span className="text-xs text-slate-500 font-medium">
              Showing latest {recentFiles.length} of {data.files.length}
            </span>
          )}
        </div>

        {recentFiles.length === 0 ? (
          <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-6 text-center text-xs text-slate-400 space-y-2">
            <LuFile className="w-6 h-6 text-slate-300 mx-auto" />
            <p>No recent documents yet. Upload a file below to start ongoing work.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {recentFiles.map((f) => (
              <div
                key={`recent_${f.id}`}
                className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs hover:shadow-md hover:border-cyan-300 transition flex flex-col justify-between group"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="w-9 h-9 rounded-xl bg-cyan-50 border border-cyan-100 flex items-center justify-center">
                      {getFileIcon(f.mimeType, f.name)}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {f.folderName || "Unorganized"}
                    </span>
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-xs truncate" title={f.name}>
                      {f.name}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                      <span>{formatBytes(f.sizeBytes)}</span>
                      <span>&bull;</span>
                      <span>{formatDate(f.createdAt)}</span>
                    </div>
                  </div>
                  {/* Tags */}
                  {f.tags && f.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {f.tags.slice(0, 2).map((t) => (
                        <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-50 text-cyan-700 font-medium">
                          #{t}
                        </span>
                      ))}
                      {f.tags.length > 2 && (
                        <span className="text-[10px] text-slate-400">+{f.tags.length - 2}</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Quick 1-Click Action Toolbar */}
                <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <Link
                    href={`/app/studios/document-hub/preview/${f.id}`}
                    className="text-cyan-600 hover:text-cyan-800 font-medium flex items-center gap-1 cursor-pointer"
                  >
                    <LuEye className="w-3.5 h-3.5" />
                    <span>Preview</span>
                  </Link>
                  <div className="flex items-center gap-2">
                    {f.secureUrl && (
                      <a
                        href={f.secureUrl}
                        target="_blank"
                        rel="noreferrer"
                        download={f.name}
                        className="p-1 text-slate-400 hover:text-slate-700 transition"
                        title="Download"
                      >
                        <LuDownload className="w-3.5 h-3.5" />
                      </a>
                    )}
                    <Link
                      href="/app/studios/pdf"
                      className="p-1 text-slate-400 hover:text-cyan-600 transition"
                      title="Send to Studio"
                    >
                      <LuExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Main 3-Column Working Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Sub-Sidebar: Folders & Retention Controls (Col 1-4) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Folders Management Card */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <LuFolder className="w-4 h-4 text-cyan-600" />
                <span className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                  Folders ({data?.folders?.length || 0}/3 Free)
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (isFolderQuotaReached) {
                    setIsUpgradeOpen(true);
                  } else {
                    setIsNewFolderOpen(true);
                  }
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-cyan-50 hover:bg-cyan-100 text-cyan-700 rounded-lg text-xs font-semibold transition cursor-pointer"
              >
                <LuPlus className="w-3.5 h-3.5" />
                <span>New</span>
              </button>
            </div>

            {/* Folder Filters */}
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => setSelectedFolderId("all")}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition cursor-pointer ${
                  selectedFolderId === "all"
                    ? "bg-cyan-600 text-white font-semibold shadow-xs"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-2">
                  <LuHardDrive className="w-3.5 h-3.5 shrink-0" />
                  <span>All Documents</span>
                </div>
                <span
                  className={`text-[11px] px-1.5 py-0.5 rounded-full ${
                    selectedFolderId === "all" ? "bg-cyan-700 text-white" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {data?.files?.length || 0}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedFolderId("unorganized")}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition cursor-pointer ${
                  selectedFolderId === "unorganized"
                    ? "bg-cyan-600 text-white font-semibold shadow-xs"
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-2">
                  <LuFile className="w-3.5 h-3.5 shrink-0" />
                  <span>Unorganized</span>
                </div>
                <span
                  className={`text-[11px] px-1.5 py-0.5 rounded-full ${
                    selectedFolderId === "unorganized" ? "bg-cyan-700 text-white" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {data?.files?.filter((f) => !f.folderId).length || 0}
                </span>
              </button>

              {data?.folders?.map((folder) => {
                const count = data?.files?.filter((f) => f.folderId === folder.id).length || 0;
                const isActive = selectedFolderId === folder.id;
                return (
                  <div
                    key={folder.id}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition group cursor-pointer ${
                      isActive ? "bg-cyan-600 text-white font-semibold shadow-xs" : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedFolderId(folder.id)}
                      className="flex items-center gap-2 flex-1 text-left min-w-0"
                    >
                      <LuFolder className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-white" : "text-cyan-600"}`} />
                      <span className="truncate">{folder.name}</span>
                    </button>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span
                        className={`text-[11px] px-1.5 py-0.5 rounded-full ${
                          isActive ? "bg-cyan-700 text-white" : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {count}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteFolder(folder.id, folder.name);
                        }}
                        className={`p-1 rounded opacity-0 group-hover:opacity-100 transition ${
                          isActive ? "hover:bg-cyan-700 text-white" : "hover:bg-red-50 text-slate-400 hover:text-red-500"
                        }`}
                        title="Delete folder"
                      >
                        <LuTrash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Folder Limit Info */}
            <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Organize by client, product or job</span>
              <span className="font-semibold text-slate-600">{quota.folderCount}/3</span>
            </div>
          </div>

          {/* Retention Policy Controls Card */}
          <div className="bg-gradient-to-br from-slate-50 to-cyan-50/50 border border-cyan-100 rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <LuShieldCheck className="w-4 h-4 text-cyan-600" />
              <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Retention Controls</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Files on Free tier automatically maintain a <strong>30-day retention guarantee</strong>. Pro and Enterprise tiers unlock permanent archival retention.
            </p>
            <div className="space-y-1.5 text-xs text-slate-700">
              <div className="flex items-center gap-2">
                <LuCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Automatic Cloudinary backup</span>
              </div>
              <div className="flex items-center gap-2">
                <LuCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Full-text and metadata index</span>
              </div>
              <div className="flex items-center gap-2">
                <LuCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>One-click send to Studio tools</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Main Working Area (Col 5-12) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Tabs: Documents vs Activity History */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab("documents")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  activeTab === "documents"
                    ? "bg-cyan-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <LuFileText className="w-3.5 h-3.5" />
                <span>Documents ({filteredFiles.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("history")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  activeTab === "history"
                    ? "bg-cyan-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <LuHistory className="w-3.5 h-3.5" />
                <span>History ({data?.activities?.length || 0})</span>
              </button>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-lg border text-xs transition cursor-pointer ${
                  viewMode === "grid"
                    ? "bg-cyan-50 border-cyan-200 text-cyan-700"
                    : "border-slate-200 text-slate-400 hover:text-slate-700"
                }`}
                title="Grid View"
              >
                <LuLayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-lg border text-xs transition cursor-pointer ${
                  viewMode === "list"
                    ? "bg-cyan-50 border-cyan-200 text-cyan-700"
                    : "border-slate-200 text-slate-400 hover:text-slate-700"
                }`}
                title="List View"
              >
                <LuList className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {activeTab === "documents" ? (
            <>
              {/* Search & Tag Filter Bar (Free for all users) */}
              <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs space-y-3">
                {/* Search Input with Live Dropdown Underneath */}
                <div className="relative" ref={searchContainerRef}>
                  <LuSearch className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search documents by name, indexed text, metadata, or tags..."
                    value={searchQuery}
                    onFocus={() => setIsSearchFocused(true)}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setIsSearchFocused(true);
                    }}
                    className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:bg-white transition"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery("");
                        setIsSearchFocused(false);
                      }}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <LuX className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {/* Underneath Live Suggestions Dropdown */}
                  {isSearchFocused && searchQuery.trim().length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-white border border-slate-200/95 rounded-2xl shadow-2xl p-2 max-h-80 overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
                      <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-100 mb-1 text-[11px] font-semibold text-slate-500">
                        <span>Matching Documents ({searchResults.length})</span>
                        <span className="text-[10px] text-slate-400">Click to overview</span>
                      </div>

                      {searchResults.length === 0 ? (
                        <div className="py-6 px-4 text-center text-xs text-slate-400 space-y-1">
                          <LuFile className="w-5 h-5 mx-auto text-slate-300" />
                          <p>No documents found matching &ldquo;{searchQuery}&rdquo;</p>
                        </div>
                      ) : (
                        <div className="space-y-0.5">
                          {searchResults.map((file) => (
                            <div
                              key={`search_drop_${file.id}`}
                              onMouseDown={(e) => {
                                e.preventDefault();
                                handleSelectSearchResult(file);
                              }}
                              className="flex items-center justify-between p-2.5 rounded-xl hover:bg-cyan-50/80 transition cursor-pointer group border border-transparent hover:border-cyan-200/60"
                            >
                              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                <span className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                                  {getFileIcon(file.mimeType, file.name)}
                                </span>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-xs text-slate-900 truncate group-hover:text-cyan-900">
                                      {file.name}
                                    </span>
                                    {file.folderName ? (
                                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-700 border border-cyan-100 shrink-0">
                                        <LuFolder className="w-3 h-3 text-cyan-600" />
                                        {file.folderName}
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 shrink-0">
                                        Unorganized
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                                    <span>{formatBytes(file.sizeBytes)}</span>
                                    <span>&bull;</span>
                                    <span>{formatDate(file.createdAt)}</span>
                                    {file.tags && file.tags.length > 0 && (
                                      <>
                                        <span>&bull;</span>
                                        <span className="truncate text-cyan-600">
                                          {file.tags.map((t) => `#${t}`).join(" ")}
                                        </span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5 pl-2 shrink-0">
                                <span className="px-2.5 py-1 rounded-lg bg-cyan-600 text-white text-[11px] font-semibold shadow-xs flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                                  <LuEye className="w-3.5 h-3.5" />
                                  <span>Overview</span>
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Tag Filters */}
                {allTags.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap text-xs pt-1">
                    <span className="text-slate-400 text-[11px] font-semibold flex items-center gap-1">
                      <LuTag className="w-3 h-3" /> Tags:
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedTag("all")}
                      className={`px-2 py-0.5 rounded-lg text-[11px] font-medium transition cursor-pointer ${
                        selectedTag === "all"
                          ? "bg-cyan-600 text-white font-bold"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      All Tags
                    </button>
                    {allTags.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => setSelectedTag(tag)}
                        className={`px-2 py-0.5 rounded-lg text-[11px] font-medium transition cursor-pointer ${
                          selectedTag === tag
                            ? "bg-cyan-600 text-white font-bold"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        #{tag}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Upload Dropzone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragActive(true);
                }}
                onDragLeave={() => setDragActive(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragActive(false);
                  if (e.dataTransfer.files) handleUploadFiles(e.dataTransfer.files);
                }}
                className={`border-2 border-dashed rounded-2xl p-6 text-center transition ${
                  dragActive
                    ? "border-cyan-500 bg-cyan-50/50"
                    : "border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300"
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => {
                    if (e.target.files) handleUploadFiles(e.target.files);
                  }}
                  className="hidden"
                  accept=".pdf,.docx,.doc,.xlsx,.xls,.pptx,.ppt,.txt,.csv,image/*"
                />

                <div className="max-w-md mx-auto space-y-3">
                  <button
                    type="button"
                    disabled={isUploading}
                    onClick={() => fileInputRef.current?.click()}
                    aria-label="Upload document"
                    className="w-12 h-12 rounded-2xl bg-cyan-100 hover:bg-cyan-200 text-cyan-600 flex items-center justify-center mx-auto shadow-sm cursor-pointer transition active:scale-95 disabled:opacity-50 group"
                  >
                    {isUploading ? (
                      <LuRefreshCw className="w-5 h-5 animate-spin text-cyan-600" />
                    ) : (
                      <LuUpload className="w-5 h-5 text-cyan-600 group-hover:-translate-y-0.5 transition-transform" />
                    )}
                  </button>

                  <div>
                    <button
                      type="button"
                      disabled={isUploading}
                      onClick={() => fileInputRef.current?.click()}
                      className="font-bold text-slate-800 text-sm hover:text-cyan-600 transition cursor-pointer"
                    >
                      {isUploading ? "Uploading Document to Storage..." : "Upload Document"}
                    </button>
                    <p className="text-xs text-slate-400 mt-1">
                      Drag and drop files here, or{" "}
                      <button
                        type="button"
                        disabled={isUploading}
                        onClick={() => fileInputRef.current?.click()}
                        className="text-cyan-600 hover:text-cyan-700 font-semibold underline cursor-pointer"
                      >
                        browse from computer
                      </button>
                    </p>
                  </div>

                  {/* Destination Folder & Tags options during upload */}
                  <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs">
                    <select
                      value={uploadFolderId}
                      onChange={(e) => setUploadFolderId(e.target.value)}
                      className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-slate-700 text-xs focus:outline-none focus:border-cyan-500"
                    >
                      <option value="">Folder: Unorganized</option>
                      {data?.folders?.map((f) => (
                        <option key={f.id} value={f.id}>
                          Folder: {f.name}
                        </option>
                      ))}
                    </select>

                    <input
                      type="text"
                      placeholder="Add tags (e.g. client, invoice)"
                      value={uploadTags}
                      onChange={(e) => setUploadTags(e.target.value)}
                      className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-slate-700 text-xs placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div className="text-[11px] text-slate-400">
                    PDF, Word, Excel, PowerPoint, Text, Images &bull; Max 5 files on Free tier
                  </div>
                </div>
              </div>

              {/* Documents List / Grid */}
              {filteredFiles.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3">
                  <LuFile className="w-10 h-10 text-slate-300 mx-auto" />
                  <div className="font-bold text-slate-800 text-sm">No documents found</div>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    {searchQuery || selectedFolderId !== "all" || selectedTag !== "all"
                      ? "No files match your search criteria. Clear filters to see all documents."
                      : "Upload your first file above to start organizing documents in your Hub."}
                  </p>
                  {(searchQuery || selectedFolderId !== "all" || selectedTag !== "all") && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery("");
                        setSelectedFolderId("all");
                        setSelectedTag("all");
                      }}
                      className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition cursor-pointer"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              ) : viewMode === "grid" ? (
                /* Grid View */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredFiles.map((file) => (
                    <div
                      key={file.id}
                      className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs hover:shadow-md hover:border-cyan-300 transition flex flex-col justify-between space-y-3 group"
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-start justify-between">
                          <span className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                            {getFileIcon(file.mimeType, file.name)}
                          </span>

                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-700 border border-cyan-100">
                            {file.folderName || "Unorganized"}
                          </span>
                        </div>

                        <div>
                          <div className="font-bold text-slate-900 text-xs truncate" title={file.name}>
                            {file.name}
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1.5">
                            <span>{formatBytes(file.sizeBytes)}</span>
                            <span>&bull;</span>
                            <span>{formatDate(file.createdAt)}</span>
                          </div>
                        </div>

                        {/* Retention Badge */}
                        <div className="flex items-center gap-1 text-[11px] text-slate-500">
                          <LuShieldCheck className="w-3 h-3 text-cyan-600" />
                          <span>{file.retentionPolicy === "permanent" ? "Permanent" : "30d retention"}</span>
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap items-center gap-1 pt-1">
                          {(file.tags || []).map((t) => (
                            <span
                              key={t}
                              className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium"
                            >
                              #{t}
                            </span>
                          ))}
                          <button
                            type="button"
                            onClick={() => {
                              setEditTagFile(file);
                              setTagInput((file.tags || []).join(", "));
                            }}
                            className="text-[10px] text-cyan-600 hover:text-cyan-800 font-medium px-1.5 py-0.5 rounded hover:bg-cyan-50 transition cursor-pointer"
                          >
                            + Tags
                          </button>
                        </div>
                      </div>

                      {/* Card Action Footer */}
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1">
                          <Link
                            href={`/app/studios/document-hub/preview/${file.id}`}
                            className="px-2 py-1 rounded-lg text-slate-600 hover:text-cyan-600 hover:bg-cyan-50 font-medium transition flex items-center gap-1 cursor-pointer"
                            title="Preview"
                          >
                            <LuEye className="w-3.5 h-3.5" />
                            <span>Preview</span>
                          </Link>

                          {file.secureUrl && (
                            <a
                              href={file.secureUrl}
                              target="_blank"
                              rel="noreferrer"
                              download={file.name}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition"
                              title="Download"
                            >
                              <LuDownload className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>

                        <div className="flex items-center gap-1">
                          {/* Folder Move selector */}
                          <select
                            value={file.folderId || "none"}
                            onChange={(e) => handleMoveFolder(file.id, e.target.value)}
                            className="text-[10px] bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-slate-600 focus:outline-none"
                            title="Move Folder"
                          >
                            <option value="none">No Folder</option>
                            {data?.folders?.map((fld) => (
                              <option key={fld.id} value={fld.id}>
                                {fld.name}
                              </option>
                            ))}
                          </select>

                          <button
                            type="button"
                            onClick={() => handleDeleteFile(file.id, file.name)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                            title="Delete"
                          >
                            <LuTrash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* List / Table View */
                <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-semibold text-slate-500">
                        <tr>
                          <th className="px-4 py-3">Document</th>
                          <th className="px-3 py-3">Folder</th>
                          <th className="px-3 py-3">Tags</th>
                          <th className="px-3 py-3">Size</th>
                          <th className="px-3 py-3">Uploaded</th>
                          <th className="px-3 py-3">Retention</th>
                          <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {filteredFiles.map((file) => (
                          <tr key={file.id} className="hover:bg-slate-50/80 transition">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2.5 max-w-[220px]">
                                <span className="shrink-0">{getFileIcon(file.mimeType, file.name)}</span>
                                <span className="truncate font-semibold text-slate-900" title={file.name}>
                                  {file.name}
                                </span>
                              </div>
                            </td>
                            <td className="px-3 py-3">
                              <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                                {file.folderName || "Unorganized"}
                              </span>
                            </td>
                            <td className="px-3 py-3">
                              <div className="flex flex-wrap gap-1 max-w-[160px]">
                                {(file.tags || []).slice(0, 2).map((t) => (
                                  <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-50 text-cyan-700">
                                    #{t}
                                  </span>
                                ))}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditTagFile(file);
                                    setTagInput((file.tags || []).join(", "));
                                  }}
                                  className="text-[10px] text-cyan-600 hover:text-cyan-800"
                                >
                                  +
                                </button>
                              </div>
                            </td>
                            <td className="px-3 py-3 text-slate-500">{formatBytes(file.sizeBytes)}</td>
                            <td className="px-3 py-3 text-slate-500">{formatDate(file.createdAt)}</td>
                            <td className="px-3 py-3">
                              <span className="text-[10px] px-2 py-0.5 rounded font-medium bg-emerald-50 text-emerald-700">
                                {file.retentionPolicy === "permanent" ? "Permanent" : "30-day"}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <Link
                                  href={`/app/studios/document-hub/preview/${file.id}`}
                                  className="p-1 text-slate-500 hover:text-cyan-600 transition"
                                  title="Preview"
                                >
                                  <LuEye className="w-3.5 h-3.5" />
                                </Link>
                                {file.secureUrl && (
                                  <a
                                    href={file.secureUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    download={file.name}
                                    className="p-1 text-slate-500 hover:text-slate-800 transition"
                                    title="Download"
                                  >
                                    <LuDownload className="w-3.5 h-3.5" />
                                  </a>
                                )}
                                <button
                                  type="button"
                                  onClick={() => handleDeleteFile(file.id, file.name)}
                                  className="p-1 text-slate-400 hover:text-red-600 transition"
                                  title="Delete"
                                >
                                  <LuTrash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* History / Activity Log (No rollback, strictly activity history as requested) */
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <LuHistory className="w-4 h-4 text-cyan-600" />
                  <h3 className="font-bold text-slate-900 text-sm">Document Activity History</h3>
                </div>
                <span className="text-xs text-slate-400">
                  {data?.activities?.length || 0} events recorded
                </span>
              </div>

              {(!data?.activities || data.activities.length === 0) ? (
                <div className="py-12 text-center text-xs text-slate-400 space-y-2">
                  <LuClock className="w-6 h-6 text-slate-300 mx-auto" />
                  <p>No activity recorded yet. Upload a document or create a folder to view history.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {data.activities.map((act) => (
                    <div
                      key={act.id}
                      className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs"
                    >
                      <span className="p-2 rounded-lg bg-cyan-100 text-cyan-700 shrink-0 mt-0.5">
                        <LuClock className="w-3.5 h-3.5" />
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-slate-900">{act.description}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                          <span className="font-mono text-[10px] text-cyan-700 uppercase">{act.type}</span>
                          <span>&bull;</span>
                          <span>{formatDate(act.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* New Folder Modal */}
      {isNewFolderOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-sm w-full p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <LuFolderPlus className="w-4 h-4 text-cyan-600" />
                <h3 className="font-bold text-slate-900 text-sm">Create New Folder</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsNewFolderOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <LuX className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateFolder} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Folder Name</label>
                <input
                  type="text"
                  placeholder="e.g. Acme Client Docs, Project Alpha, Invoices"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                  autoFocus
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Color Theme</label>
                <div className="flex items-center gap-2">
                  {[
                    { id: "cyan", bg: "bg-cyan-500" },
                    { id: "blue", bg: "bg-blue-500" },
                    { id: "emerald", bg: "bg-emerald-500" },
                    { id: "amber", bg: "bg-amber-500" },
                    { id: "purple", bg: "bg-purple-500" },
                  ].map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setNewFolderColor(c.id)}
                      className={`w-6 h-6 rounded-full ${c.bg} transition ${
                        newFolderColor === c.id ? "ring-2 ring-offset-2 ring-cyan-600 scale-110" : "opacity-80"
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="text-[11px] text-slate-400">
                Quota: {quota.folderCount} / {quota.maxFolders} used on Free tier.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewFolderOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-semibold shadow-xs transition"
                >
                  Create Folder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Tags Modal */}
      {editTagFile && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-sm w-full p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <LuTag className="w-4 h-4 text-cyan-600" />
                <h3 className="font-bold text-slate-900 text-sm">Edit Tags</h3>
              </div>
              <button
                type="button"
                onClick={() => setEditTagFile(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <LuX className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="text-xs text-slate-600 truncate font-semibold">
                {editTagFile.name}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="e.g. client-a, invoice, urgent, q3-report"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-cyan-500"
                  autoFocus
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditTagFile(null)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveTags}
                  className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-semibold shadow-xs"
                >
                  Save Tags
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Document In-App Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="shrink-0">{getFileIcon(previewFile.mimeType, previewFile.name)}</span>
                <div className="min-w-0">
                  <h3 className="font-bold text-slate-900 text-sm truncate">{previewFile.name}</h3>
                  <div className="text-[11px] text-slate-400">
                    {formatBytes(previewFile.sizeBytes)} &bull; {previewFile.mimeType}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPreviewFile(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <LuX className="w-5 h-5" />
              </button>
            </div>

            {/* Preview Viewport */}
            {(() => {
              const activeUrl =
                (localBlobUrls.current && localBlobUrls.current[previewFile.id]) ||
                previewFile.previewUrl ||
                previewFile.secureUrl ||
                "";
              const isImage =
                previewFile.mimeType.startsWith("image/") ||
                /\.(jpe?g|png|webp|gif|svg)$/i.test(previewFile.name);
              const isPdf =
                previewFile.mimeType.includes("pdf") ||
                previewFile.name.toLowerCase().endsWith(".pdf");
              const isText =
                previewFile.mimeType.includes("text") ||
                previewFile.mimeType.includes("csv") ||
                previewFile.mimeType.includes("json") ||
                /\.(txt|csv|json|md|log)$/i.test(previewFile.name);

              return (
                <div className="flex-1 overflow-auto rounded-xl bg-slate-50 border border-slate-200 p-3 sm:p-4 flex items-center justify-center min-h-[300px]">
                  {isImage && activeUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={activeUrl}
                      alt={previewFile.name}
                      className="max-h-[55vh] max-w-full object-contain rounded-lg shadow-sm"
                      loading="eager"
                    />
                  ) : isPdf && activeUrl ? (
                    <object
                      data={activeUrl}
                      type="application/pdf"
                      className="w-full h-[55vh] rounded-lg shadow-sm border border-slate-200"
                    >
                      <iframe
                        src={activeUrl}
                        title={previewFile.name}
                        className="w-full h-full border-0 rounded-lg"
                      />
                    </object>
                  ) : isText && (previewFile.previewText || activeUrl) ? (
                    <div className="w-full h-[55vh] overflow-auto bg-slate-900 text-slate-100 p-4 rounded-xl font-mono text-xs whitespace-pre-wrap leading-relaxed shadow-inner">
                      {previewFile.previewText ||
                        (activeUrl.startsWith("data:")
                          ? decodeURIComponent(activeUrl.split(",")[1] || "")
                          : "Preview text content...")}
                    </div>
                  ) : (
                    <div className="text-center space-y-3 py-8">
                      <div className="w-12 h-12 rounded-2xl bg-cyan-100 text-cyan-600 flex items-center justify-center mx-auto">
                        {getFileIcon(previewFile.mimeType, previewFile.name)}
                      </div>
                      <div>
                        <div className="font-bold text-slate-800 text-sm">{previewFile.name}</div>
                        <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                          Document indexed and stored securely with instant cloud access.
                        </p>
                      </div>
                      {activeUrl && (
                        <a
                          href={activeUrl}
                          target="_blank"
                          rel="noreferrer"
                          download={previewFile.name}
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-semibold shadow-xs transition"
                        >
                          <LuDownload className="w-3.5 h-3.5" />
                          <span>Download File</span>
                        </a>
                      )}
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Modal Footer with Send to Studio buttons */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-500">Send to Studio:</span>
                <Link
                  href="/app/studios/pdf"
                  className="px-2.5 py-1 rounded-lg bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 font-semibold transition"
                >
                  PDF Studio
                </Link>
                <Link
                  href="/app/studios/ai-document"
                  className="px-2.5 py-1 rounded-lg bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-100 font-semibold transition"
                >
                  AI Studio
                </Link>
                <Link
                  href="/app/studios/office"
                  className="px-2.5 py-1 rounded-lg bg-teal-50 text-teal-700 border border-teal-200 hover:bg-teal-100 font-semibold transition"
                >
                  Office Studio
                </Link>
              </div>

              <button
                type="button"
                onClick={() => setPreviewFile(null)}
                className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upgrade Checkout Modal */}
      <UpgradeCheckoutModal
        isOpen={isUpgradeOpen}
        onClose={() => setIsUpgradeOpen(false)}
      />
    </div>
  );
}
