import { useEffect, useState } from "react";
import { FileText, FolderArchive, Layers, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { AppLayout } from "@/components/layout/app-layout";
import { StatCard } from "@/components/dashboard/stat-card";
import { StatusBadge } from "@/components/documents/status-badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useDocuments } from "@/store/document-store";
import { getDashboardStats } from "@/services/document-service";
import type { DashboardStats } from "@/services/types";

export function DashboardPage() {
  const { documents, loading } = useDocuments();
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    void getDashboardStats().then(setStats);
  }, []);

  const recent = documents.slice(0, 4);

  return (
    <AppLayout title="Dashboard">
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            label="Total Dokumen"
            value={stats ? String(stats.totalDocuments) : "—"}
            icon={FileText}
            index={0}
          />
          <StatCard
            label="Dibuat Bulan Ini"
            value={stats ? String(stats.generatedThisMonth) : "—"}
            icon={Sparkles}
            index={1}
          />
          <StatCard
            label="Template"
            value={stats ? String(stats.templates) : "—"}
            icon={Layers}
            index={2}
          />
          <StatCard
            label="Penyimpanan"
            value={stats ? `${stats.storageUsedMb} MB` : "—"}
            icon={FolderArchive}
            index={3}
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Dokumen Terbaru</CardTitle>
            <CardDescription>
              Empat dokumen yang baru saja dibuat
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {loading ? (
              <p className="py-4 text-base text-text/60">Memuat...</p>
            ) : (
              recent.map((doc, i) => (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, ease: "easeOut", delay: i * 0.04 }}
                  className="flex items-center justify-between rounded-md border px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted text-text/70">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-base">{doc.title}</span>
                      <span className="text-sm text-text/50">
                        {doc.template}
                      </span>
                    </div>
                  </div>
                  <StatusBadge status={doc.status} />
                </motion.div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
