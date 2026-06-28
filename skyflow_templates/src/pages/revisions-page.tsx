import { useState, useEffect, useMemo } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { getProjects, updateProject, type Project } from "@/services/project-service";
import { createRevision, updateRevision, deleteRevision, type Revision } from "@/services/revision-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckSquare, Square, Trash, Edit2, Check, X } from "lucide-react";
import { toastManager } from "@/components/ui/toast";

export function RevisionsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isEditingQuota, setIsEditingQuota] = useState(false);
  const [newQuota, setNewQuota] = useState<number>(0);

  const loadData = async () => {
    setLoading(true);
    const projs = await getProjects();
    setProjects(projs);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Derive unique clients from projects
  const clients = useMemo(() => {
    const map = new Map();
    projects.forEach(p => {
      if (p.client && !map.has(p.clientId)) {
        map.set(p.clientId, p.client);
      }
    });
    return Array.from(map.values());
  }, [projects]);

  // Filter projects by selected client
  const clientProjects = useMemo(() => {
    if (!selectedClientId) return [];
    return projects.filter(p => p.clientId === selectedClientId);
  }, [projects, selectedClientId]);

  const selectedProject = useMemo(() => {
    return projects.find(p => p.id === selectedProjectId) || null;
  }, [projects, selectedProjectId]);

  const revisions = selectedProject?.revisions || [];
  const maxRevisions = selectedProject?.maxRevisions || 0;
  const revisionsCount = revisions.length;
  const canAdd = revisionsCount < maxRevisions;

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canAdd || !selectedProject) return;
    setIsSubmitting(true);
    try {
      await createRevision({
        title: newTitle,
        description: newDesc,
        projectId: selectedProject.id,
      });
      setNewTitle("");
      setNewDesc("");
      await loadData();
      toastManager.success({ title: "Berhasil", description: "Revisi ditambahkan." });
    } catch (error) {
      toastManager.error({ title: "Gagal", description: "Gagal menambah revisi." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggle = async (revision: Revision) => {
    try {
      await updateRevision(revision.id, { isDone: !revision.isDone });
      await loadData();
    } catch (error) {
      toastManager.error({ title: "Gagal", description: "Gagal update status revisi." });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteRevision(id);
      await loadData();
      toastManager.success({ title: "Berhasil", description: "Revisi dihapus." });
    } catch (error) {
      toastManager.error({ title: "Gagal", description: "Gagal menghapus revisi." });
    }
  };

  const handleSaveQuota = async () => {
    if (!selectedProject) return;
    try {
      await updateProject(selectedProject.id, { maxRevisions: newQuota });
      await loadData();
      setIsEditingQuota(false);
      toastManager.success({ title: "Berhasil", description: "Kuota revisi diperbarui." });
    } catch (error) {
      toastManager.error({ title: "Gagal", description: "Gagal mengupdate kuota revisi." });
    }
  };

  return (
    <AppLayout title="Manajemen Revisi">
      <div className="flex flex-col gap-6 w-full">
        <div>
          <h1 className="text-2xl font-bold font-heading">Revisi Proyek</h1>
          <p className="text-text/60">Kelola permintaan revisi klien dari berbagai proyek.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">1. Pilih Klien</CardTitle>
            </CardHeader>
            <CardContent>
              <select
                value={selectedClientId}
                onChange={(e) => {
                  setSelectedClientId(e.target.value);
                  setSelectedProjectId(""); // reset project when client changes
                }}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary transition-colors text-text"
              >
                <option value="">-- Pilih Klien --</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">2. Pilih Proyek</CardTitle>
            </CardHeader>
            <CardContent>
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                disabled={!selectedClientId}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary transition-colors disabled:opacity-50 text-text"
              >
                <option value="">-- Pilih Proyek --</option>
                {clientProjects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </CardContent>
          </Card>
        </div>

        {loading && !selectedProject ? (
           <div className="text-center py-8 text-text/50">Memuat data...</div>
        ) : selectedProject ? (
          <Card className="mt-2 border-primary/20 shadow-md">
            <CardHeader className="border-b bg-muted/10 pb-4">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Revisi: {selectedProject.name}</CardTitle>
                  <p className="text-sm text-text/60 mt-1">Status Proyek: {selectedProject.status}</p>
                </div>
                <div className="text-right flex flex-col items-end">
                  <span className="text-sm font-semibold text-text/70">Kuota Revisi</span>
                  {isEditingQuota ? (
                    <div className="flex items-center gap-2 mt-1">
                      <input 
                        type="number" 
                        min="0"
                        value={newQuota} 
                        onChange={(e) => setNewQuota(Number(e.target.value))} 
                        className="w-16 p-1 text-center border rounded-md"
                      />
                      <button onClick={handleSaveQuota} className="p-1.5 bg-primary/10 text-primary rounded-md hover:bg-primary/20 transition-colors"><Check className="w-4 h-4" /></button>
                      <button onClick={() => setIsEditingQuota(false)} className="p-1.5 bg-red-500/10 text-red-500 rounded-md hover:bg-red-500/20 transition-colors"><X className="w-4 h-4" /></button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-2xl font-bold text-primary">{revisionsCount} / {maxRevisions}</span>
                      <button 
                        onClick={() => { setIsEditingQuota(true); setNewQuota(maxRevisions); }} 
                        className="p-1.5 text-text/50 hover:text-primary hover:bg-primary/10 rounded-md transition-colors"
                        title="Ubah Kuota"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0 flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x">
              <div className="flex-1 p-4 sm:p-6">
                <h3 className="text-sm font-bold mb-4">Daftar Revisi</h3>
                {revisions.length === 0 ? (
                  <div className="text-sm text-center py-8 text-muted-foreground border border-dashed rounded-lg bg-muted/5">
                    Belum ada revisi yang dicatat untuk proyek ini.
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {revisions.map((rev: Revision) => (
                      <div key={rev.id} className="flex items-start gap-3 p-3 border rounded-lg hover:border-primary/50 transition-colors bg-card">
                        <button onClick={() => handleToggle(rev)} className="mt-0.5 shrink-0 text-primary transition-transform active:scale-95">
                          {rev.isDone ? <CheckSquare className="h-5 w-5" /> : <Square className="h-5 w-5 opacity-50 hover:opacity-100" />}
                        </button>
                        <div className="flex-1 min-w-0">
                          <h4 className={`text-sm font-semibold ${rev.isDone ? 'line-through text-text/50' : 'text-text'}`}>{rev.title}</h4>
                          {rev.description && <p className={`text-xs mt-1 ${rev.isDone ? 'text-text/40' : 'text-text/70'}`}>{rev.description}</p>}
                        </div>
                        <button onClick={() => handleDelete(rev.id)} className="shrink-0 text-red-500/50 hover:text-red-500 p-1 rounded-md transition-colors hover:bg-red-50">
                          <Trash className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="w-full md:w-80 p-4 sm:p-6 bg-muted/5 flex flex-col">
                <h3 className="text-sm font-bold mb-4">Tambah Revisi Baru</h3>
                {canAdd ? (
                  <form onSubmit={handleAdd} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-text/70">Judul Revisi</label>
                      <input 
                        required
                        placeholder="Contoh: Ubah warna tema" 
                        className="w-full text-sm p-2 border border-input rounded-md outline-none focus:border-primary bg-background"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-text/70">Catatan Detail (Opsional)</label>
                      <textarea 
                        placeholder="Tuliskan instruksi detail..." 
                        className="w-full text-sm p-2 border border-input rounded-md resize-none h-24 outline-none focus:border-primary bg-background"
                        value={newDesc}
                        onChange={(e) => setNewDesc(e.target.value)}
                      />
                    </div>
                    <Button type="submit" disabled={isSubmitting} className="w-full mt-2">
                      {isSubmitting ? "Menyimpan..." : "Simpan Revisi"}
                    </Button>
                  </form>
                ) : (
                  <div className="text-sm text-amber-800 bg-amber-100 p-4 rounded-lg border border-amber-200 leading-relaxed shadow-sm">
                    <strong>Batas Maksimal Tercapai!</strong><br className="mb-1" />
                    Proyek ini telah menggunakan semua kuota revisinya ({maxRevisions} kali). Anda tidak dapat menambahkan revisi baru.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </AppLayout>
  );
}
