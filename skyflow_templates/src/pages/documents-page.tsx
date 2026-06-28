import { useState, useMemo } from "react";
import {
  Download,
  FileText,
  ListFilter,
  MoreVertical,
  Pencil,
  Trash2,
  FolderArchive,
  LayoutGrid,
  List,
  ChevronLeft,
  Share2,
  CheckCircle2
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { AppLayout } from "@/components/layout/app-layout";
import { StatusBadge } from "@/components/documents/status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDocuments } from "@/store/document-store";
import type { DocumentStatus } from "@/services/types";

type StatusFilter = DocumentStatus | "all";

const STATUS_LABEL: Record<StatusFilter, string> = {
  all: "Semua Status",
  ready: "Siap",
  processing: "Diproses",
  draft: "Draf",
  failed: "Gagal",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function DocumentsPage() {
  const { documents, loading, error } = useDocuments();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [viewMode, setViewMode] = useState<"folder" | "list">("folder");
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);

  const groupedDocuments = useMemo(() => {
    const groups: Record<string, { clientName: string; documents: any[] }> = {};
    documents.forEach((doc) => {
      const clientId = doc.clientId || "lainnya";
      const clientName = doc.client?.name || "Lainnya (Tanpa Klien)";
      if (!groups[clientId]) {
        groups[clientId] = { clientName, documents: [] };
      }
      groups[clientId].documents.push(doc);
    });
    return groups;
  }, [documents]);

  const handleDownload = (doc: any) => {
    if (!doc.fileUrl) return;
    try {
      if (doc.fileUrl.startsWith('data:text/html')) {
        const win = window.open('', '_blank');
        if (win) {
          const base64Data = doc.fileUrl.split(',')[1];
          // use decodeURIComponent(escape(atob())) to handle unicode characters properly
          win.document.write(decodeURIComponent(escape(atob(base64Data))));
          win.document.close();
        }
      } else {
        window.open(doc.fileUrl, '_blank');
      }
    } catch (e) {
      console.error("Failed to open document:", e);
    }
  };

  const handleShare = (doc: any) => {
    const shareUrl = `${window.location.origin}/shared-document/${doc.id}`;
    navigator.clipboard.writeText(shareUrl)
      .then(() => toast.success("Tautan publik berhasil disalin ke clipboard!"))
      .catch(() => toast.error("Gagal menyalin tautan"));
  };

  const displayedDocuments = useMemo(() => {
    let docs = documents;
    if (viewMode === "folder" && selectedFolder) {
      docs = groupedDocuments[selectedFolder]?.documents || [];
    }
    if (statusFilter !== "all") {
      docs = docs.filter((d) => d.status === statusFilter);
    }
    return docs;
  }, [documents, viewMode, selectedFolder, statusFilter, groupedDocuments]);

  return (
    <AppLayout title="Dokumen">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p className="text-sm text-text/60">
            {viewMode === "folder" && !selectedFolder 
              ? `${Object.keys(groupedDocuments).length} folder klien` 
              : `${displayedDocuments.length} dokumen`
            }
          </p>
          <div className="flex items-center gap-2">
            <div className="flex bg-muted p-1 rounded-md border border-border">
              <Button 
                variant={viewMode === "folder" ? "secondary" : "ghost"} 
                size="sm" 
                className={`h-8 px-2.5 ${viewMode === "folder" ? "bg-background text-primary shadow-sm" : ""}`}
                onClick={() => { setViewMode("folder"); setSelectedFolder(null); }}
                title="Tampilan Folder"
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button 
                variant={viewMode === "list" ? "secondary" : "ghost"} 
                size="sm" 
                className={`h-8 px-2.5 ${viewMode === "list" ? "bg-background text-primary shadow-sm" : ""}`}
                onClick={() => { setViewMode("list"); setSelectedFolder(null); }}
                title="Tampilan List"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-10">
                  <ListFilter className="h-4 w-4 mr-2" />
                  {STATUS_LABEL[statusFilter]}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Filter Status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup
                  value={statusFilter}
                  onValueChange={(v) => setStatusFilter(v as StatusFilter)}
                >
                  {(Object.keys(STATUS_LABEL) as StatusFilter[]).map((key) => (
                    <DropdownMenuRadioItem key={key} value={key}>
                      {STATUS_LABEL[key]}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {loading && (
          <p className="py-6 text-base text-text/60">Memuat dokumen...</p>
        )}
        {error && (
          <p className="py-6 text-base text-red-500">{error}</p>
        )}

        {/* FOLDER VIEW - GRID */}
        {!loading && !error && viewMode === "folder" && !selectedFolder && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-2">
            {Object.entries(groupedDocuments).map(([id, group], i) => (
              <motion.div
                key={id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2, delay: i * 0.03 }}
              >
                <Card 
                  className="cursor-pointer hover:border-primary/50 hover:shadow-md transition-all p-5 flex flex-col items-center justify-center text-center gap-3 border border-border h-full"
                  onClick={() => setSelectedFolder(id)}
                >
                  <div className="h-14 w-14 rounded-2xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-500 mb-1">
                    <FolderArchive className="h-7 w-7" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-text line-clamp-1" title={group.clientName}>{group.clientName}</h3>
                    <p className="text-xs text-text/60 mt-1 font-medium bg-muted py-0.5 px-2 rounded-full inline-block">{group.documents.length} Dokumen</p>
                  </div>
                </Card>
              </motion.div>
            ))}
            {Object.keys(groupedDocuments).length === 0 && (
              <p className="col-span-full py-8 text-center text-text/50">Belum ada folder dokumen.</p>
            )}
          </div>
        )}

        {/* LIST VIEW OR FOLDER CONTENTS */}
        {!loading && !error && (viewMode === "list" || (viewMode === "folder" && selectedFolder)) && (
          <div className="flex flex-col gap-4">
            
            {viewMode === "folder" && selectedFolder && (
              <div className="flex items-center gap-3 mb-2 bg-muted/30 p-2 rounded-lg border border-border">
                <Button variant="ghost" size="sm" onClick={() => setSelectedFolder(null)} className="h-8">
                  <ChevronLeft className="h-4 w-4 mr-1" /> Kembali
                </Button>
                <div className="h-4 w-[1px] bg-border"></div>
                <div className="flex items-center gap-2 text-text font-semibold">
                  <FolderArchive className="h-4 w-4 text-blue-500" />
                  {groupedDocuments[selectedFolder]?.clientName}
                </div>
              </div>
            )}

            <Card className="overflow-hidden">
              {/* Header tabel — desktop saja */}
              <div className="hidden grid-cols-12 gap-4 border-b bg-muted/50 px-4 py-3 text-sm font-medium text-text/70 md:grid">
                <span className="col-span-4">Judul</span>
                <span className="col-span-2">Client</span>
                <span className="col-span-2">Template</span>
                <span className="col-span-2">Status</span>
                <span className="col-span-1">Dibuat</span>
                <span className="col-span-1 text-right">Aksi</span>
              </div>

              {displayedDocuments.map((doc, i) => (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, ease: "easeOut", delay: i * 0.03 }}
                  className="flex flex-col gap-3 border-b px-4 py-3 last:border-b-0 hover:bg-muted/50 md:grid md:grid-cols-12 md:items-center md:gap-4 transition-colors"
                >
                  {/* Judul + icon */}
                  <div className="flex items-center gap-3 md:col-span-4 relative">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-900/50 text-blue-600">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-text">{doc.title}</span>
                      {doc.clientSignature && (
                        <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" /> Ditandatangani
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Client */}
                  <span className="text-sm text-text/80 md:col-span-2 line-clamp-1">
                    <span className="text-text/50 md:hidden">Klien: </span>
                    {doc.client?.name || "-"}
                  </span>

                  {/* Template */}
                  <span className="text-sm text-text/80 md:col-span-2">
                    <span className="text-text/50 md:hidden">Template: </span>
                    {doc.template}
                  </span>

                  {/* Status */}
                  <span className="md:col-span-2">
                    <StatusBadge status={doc.status} />
                  </span>

                  {/* Tanggal & Creator */}
                  <span className="text-sm text-text/60 md:col-span-1 flex flex-col justify-center">
                    <span>
                      <span className="text-text/50 md:hidden">Dibuat: </span>
                      {formatDate(doc.createdAt)}
                    </span>
                    {doc.creator && (
                      <span className="text-[10px] text-text/40 font-medium truncate" title={`Oleh: ${doc.creator.name}`}>
                        Oleh: {doc.creator.name}
                      </span>
                    )}
                  </span>

                  {/* Aksi */}
                  <div className="flex justify-end gap-1 md:col-span-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Unduh"
                      disabled={doc.status !== "ready" || !doc.fileUrl}
                      className="h-8 w-8 text-text/50 hover:text-text"
                      onClick={() => handleDownload(doc)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" aria-label="Menu" className="h-8 w-8 text-text/50 hover:text-text">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Pencil className="h-4 w-4 mr-2" />
                          Ubah
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleShare(doc)}>
                          <Share2 className="h-4 w-4 mr-2" />
                          Bagikan Tautan Publik
                        </DropdownMenuItem>
                        <DropdownMenuItem disabled={doc.status !== "ready" || !doc.fileUrl} onClick={() => handleDownload(doc)}>
                          <Download className="h-4 w-4 mr-2" />
                          Unduh
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-50">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Hapus
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </motion.div>
              ))}

              {displayedDocuments.length === 0 && (
                <p className="px-4 py-8 text-center text-sm text-text/50">
                  Tidak ada dokumen.
                </p>
              )}
            </Card>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
