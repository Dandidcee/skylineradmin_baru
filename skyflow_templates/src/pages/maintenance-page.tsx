import { useState, useEffect, useMemo } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { getProjects, type Project } from "@/services/project-service";
import { createMaintenanceCost, deleteMaintenanceCost, type MaintenanceCost } from "@/services/maintenance-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash, Server, Wrench, FileText, CalendarDays } from "lucide-react";
import { toastManager } from "@/components/ui/toast";

const formatDate = (dateString: string) => {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(new Date(dateString));
};

export function MaintenancePage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  
  const [newName, setNewName] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [newType, setNewType] = useState("Server");
  const [newNotes, setNewNotes] = useState("");
  const [newDueDate, setNewDueDate] = useState(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const projs = await getProjects();
    setProjects(projs);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const clients = useMemo(() => {
    const map = new Map();
    projects.forEach(p => {
      if (p.client && !map.has(p.clientId)) {
        map.set(p.clientId, p.client);
      }
    });
    return Array.from(map.values());
  }, [projects]);

  const clientProjects = useMemo(() => {
    if (!selectedClientId) return [];
    return projects.filter(p => p.clientId === selectedClientId);
  }, [projects, selectedClientId]);

  const selectedProject = useMemo(() => {
    return projects.find(p => p.id === selectedProjectId) || null;
  }, [projects, selectedProjectId]);

  const maintenanceCosts = selectedProject?.maintenanceCosts || [];
  
  const totalCost = useMemo(() => {
    return maintenanceCosts.reduce((sum, item) => sum + Number(item.amount), 0);
  }, [maintenanceCosts]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject) return;
    setIsSubmitting(true);
    try {
      await createMaintenanceCost({
        name: newName,
        amount: Number(newAmount.replace(/\D/g, '')),
        type: newType,
        notes: newNotes,
        nextDueDate: new Date(newDueDate).toISOString(),
        projectId: selectedProject.id,
      });
      setNewName("");
      setNewAmount("");
      setNewNotes("");
      await loadData();
      toastManager.success({ title: "Berhasil", description: "Biaya ditambahkan." });
    } catch (error) {
      toastManager.error({ title: "Gagal", description: "Gagal menambahkan biaya." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMaintenanceCost(id);
      await loadData();
      toastManager.success({ title: "Berhasil", description: "Biaya dihapus." });
    } catch (error) {
      toastManager.error({ title: "Gagal", description: "Gagal menghapus biaya." });
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Server': return <Server className="w-4 h-4 text-blue-500" />;
      case 'Maintenance': return <Wrench className="w-4 h-4 text-amber-500" />;
      default: return <FileText className="w-4 h-4 text-purple-500" />;
    }
  };

  const formatRupiah = (val: number | string) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(Number(val));
  };

  return (
    <AppLayout title="Manajemen Maintenance">
      <div className="flex flex-col gap-6 w-full">
        <div>
          <h1 className="text-2xl font-bold font-heading">Maintenance & Biaya Rutin</h1>
          <p className="text-text/60">Kelola catatan biaya server, maintenance, dan kustom per proyek.</p>
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
                  setSelectedProjectId("");
                }}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary transition-colors text-slate-900"
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
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary transition-colors disabled:opacity-50 text-slate-900"
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
                  <CardTitle>Rincian Biaya: {selectedProject.name}</CardTitle>
                  <p className="text-sm text-text/60 mt-1">Status: {selectedProject.status}</p>
                </div>
                <div className="text-right flex flex-col items-end">
                  <span className="text-sm font-semibold text-text/70">Total Tagihan</span>
                  <span className="text-2xl font-bold text-primary">{formatRupiah(totalCost)}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0 flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x">
              <div className="flex-1 p-4 sm:p-6">
                <h3 className="text-sm font-bold mb-4">Daftar Biaya Rutin & Kustom</h3>
                {maintenanceCosts.length === 0 ? (
                  <div className="text-sm text-center py-8 text-muted-foreground border border-dashed rounded-lg bg-muted/5">
                    Belum ada biaya tercatat untuk proyek ini.
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {maintenanceCosts.map((cost: MaintenanceCost) => (
                      <div key={cost.id} className="flex items-start gap-4 p-4 border rounded-lg hover:border-primary/50 transition-colors bg-card shadow-sm">
                        <div className="mt-1 p-2 bg-muted/50 rounded-md">
                          {getTypeIcon(cost.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <h4 className="text-sm font-semibold text-text">{cost.name}</h4>
                            <span className="text-sm font-bold text-primary whitespace-nowrap">{formatRupiah(cost.amount)}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-sm bg-muted/50 text-text/60 tracking-wider">
                              {cost.type}
                            </span>
                            {cost.nextDueDate && (
                              <span className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-sm bg-primary/10 text-primary whitespace-nowrap">
                                <CalendarDays className="w-3 h-3" />
                                Jatuh Tempo: {formatDate(cost.nextDueDate)}
                              </span>
                            )}
                            {cost.notes && (
                              <p className="text-xs text-text/60 truncate max-w-[200px]" title={cost.notes}>{cost.notes}</p>
                            )}
                          </div>
                        </div>
                        <button onClick={() => handleDelete(cost.id)} className="shrink-0 text-red-500/50 hover:text-red-500 p-1.5 rounded-md transition-colors hover:bg-red-50" title="Hapus">
                          <Trash className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="w-full md:w-80 p-4 sm:p-6 bg-muted/5 flex flex-col">
                <h3 className="text-sm font-bold mb-4">Tambah Biaya Baru</h3>
                <form onSubmit={handleAdd} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-text/70">Kategori</label>
                    <select 
                      className="w-full text-sm p-2 border border-input rounded-md outline-none focus:border-primary bg-background text-slate-900"
                      value={newType}
                      onChange={(e) => setNewType(e.target.value)}
                    >
                      <option value="Server">Server / Hosting</option>
                      <option value="Maintenance">Maintenance System</option>
                      <option value="Kustom">Biaya Kustom / Lainnya</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-text/70">Nama Tagihan</label>
                    <input 
                      required
                      placeholder="Contoh: VPS DigitalOcean" 
                      className="w-full text-sm p-2 border border-input rounded-md outline-none focus:border-primary bg-background"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-text/70">Nominal Biaya (Rp)</label>
                    <input 
                      required
                      type="text"
                      placeholder="Contoh: 150.000" 
                      className="w-full text-sm p-2 border border-input rounded-md outline-none focus:border-primary bg-background font-medium"
                      value={newAmount ? new Intl.NumberFormat('id-ID').format(Number(newAmount)) : ""}
                      onChange={(e) => setNewAmount(e.target.value.replace(/\D/g, ''))}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-text/70">Jatuh Tempo Pertama</label>
                    <input 
                      required
                      type="date"
                      className="w-full text-sm p-2 border border-input rounded-md outline-none focus:border-primary bg-background"
                      value={newDueDate}
                      onChange={(e) => setNewDueDate(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-text/70">Catatan Detail (Opsional)</label>
                    <textarea 
                      placeholder="Tuliskan keterangan..." 
                      className="w-full text-sm p-2 border border-input rounded-md resize-none h-20 outline-none focus:border-primary bg-background"
                      value={newNotes}
                      onChange={(e) => setNewNotes(e.target.value)}
                    />
                  </div>
                  <Button type="submit" disabled={isSubmitting} className="w-full mt-2">
                    {isSubmitting ? "Menyimpan..." : "Tambahkan"}
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </AppLayout>
  );
}
