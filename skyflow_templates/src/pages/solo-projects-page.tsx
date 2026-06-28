import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { getSoloProjects, createSoloProject, updateSoloProject, deleteSoloProject, type SoloProject } from "@/services/solo-project-service";
import { Briefcase, Calendar, User, Plus, Wallet, AlertCircle, MoreVertical, Pencil, Trash2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogClose,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogPopup,
  AlertDialogTitle,
  AlertDialogTrigger as AlertDialogTriggerBtn,
} from "@/components/ui/alert-dialog";

export function SoloProjectsPage() {
  const [projects, setProjects] = useState<SoloProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<SoloProject | null>(null);
  
  const [formData, setFormData] = useState({
    bossName: "",
    projectName: "",
    paymentAmount: "",
    debtAmount: "",
    progress: "0"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadProjects = () => {
    setLoading(true);
    getSoloProjects()
      .then((data) => {
        setProjects(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Gagal memuat data project solo.");
        setLoading(false);
      });
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const formatDate = (iso?: string) => {
    if (!iso) return "-";
    return new Date(iso).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  };

  const formatCurrencyInput = (val: string) => {
    const numeric = val.replace(/\D/g, "");
    if (!numeric) return "";
    return parseInt(numeric, 10).toLocaleString("id-ID");
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        bossName: formData.bossName,
        projectName: formData.projectName,
        paymentAmount: parseFloat(formData.paymentAmount.toString().replace(/\D/g, "")) || 0,
        debtAmount: parseFloat(formData.debtAmount.toString().replace(/\D/g, "")) || 0,
        progress: parseInt(formData.progress) || 0
      };

      if (editingProject) {
        await updateSoloProject(editingProject.id, payload);
        toast.success("Project berhasil diperbarui.");
      } else {
        await createSoloProject(payload);
        toast.success("Project berhasil dibuat.");
      }
      setIsModalOpen(false);
      setEditingProject(null);
      setFormData({ bossName: "", projectName: "", paymentAmount: "", debtAmount: "", progress: "0" });
      loadProjects();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Gagal menyimpan project.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSetLunas = async (proj: SoloProject) => {
    try {
      await updateSoloProject(proj.id, { debtAmount: 0 });
      loadProjects();
      toast.success("Project berhasil ditandai lunas.");
    } catch (err: any) {
      toast.error(err.message || "Gagal menandai lunas.");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteSoloProject(id);
      loadProjects();
      toast.success("Project berhasil dihapus.");
    } catch (err: any) {
      toast.error(err.message || "Gagal menghapus project.");
    }
  };

  const openCreate = () => {
    setEditingProject(null);
    setFormData({ bossName: "", projectName: "", paymentAmount: "", debtAmount: "", progress: "0" });
    setIsModalOpen(true);
  };

  const openEdit = (proj: SoloProject) => {
    setEditingProject(proj);
    setFormData({
      bossName: proj.bossName,
      projectName: proj.projectName,
      paymentAmount: proj.paymentAmount !== undefined && proj.paymentAmount !== null ? parseInt(proj.paymentAmount.toString(), 10).toLocaleString("id-ID") : "",
      debtAmount: proj.debtAmount !== undefined && proj.debtAmount !== null ? parseInt(proj.debtAmount.toString(), 10).toLocaleString("id-ID") : "",
      progress: proj.progress.toString(),
    });
    setIsModalOpen(true);
  };

  const totalIncome = projects.reduce((acc, proj) => acc + (proj.paymentAmount - proj.debtAmount), 0);
  const totalDebt = projects.reduce((acc, proj) => acc + proj.debtAmount, 0);

  return (
    <AppLayout title="Project Solo">
      <div className="flex flex-col gap-4">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-sm text-text/60 font-medium">Total Project Solo</p>
                <p className="text-3xl font-bold text-primary mt-1">{projects.length}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Briefcase className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-sm text-text/60 font-medium">Pemasukan Diterima (Bersih)</p>
                <p className="text-2xl font-bold text-green-600 mt-1">Rp {totalIncome.toLocaleString('id-ID')}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center text-green-600">
                <Wallet className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-red-500/10 to-red-500/5 border-red-500/20">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-sm text-text/60 font-medium">Total Piutang Belum Dibayar</p>
                <p className="text-2xl font-bold text-red-500 mt-1">Rp {totalDebt.toLocaleString('id-ID')}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
                <AlertCircle className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end items-center mb-2">
          <Button onClick={openCreate} className="gap-2 shadow-sm hover:shadow-md transition-all">
            <Plus className="h-4 w-4" />
            Tambah Project
          </Button>
        </div>

        {loading && <p className="py-6 text-base text-text/60 text-center">Memuat project...</p>}
        {error && <p className="py-6 text-base text-red-500 text-center">{error}</p>}

        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((proj, i) => (
              <motion.div
                key={proj.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: i * 0.05 }}
              >
                <Card className="h-full flex flex-col hover:border-primary/50 transition-colors shadow-sm relative">
                  <div className="absolute top-3 right-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-text/50 hover:text-text rounded-full hover:bg-muted/50">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {proj.debtAmount > 0 && (
                          <AlertDialog>
                            <AlertDialogTriggerBtn render={
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-green-600 focus:text-green-600 focus:bg-green-50">
                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                Tandai Lunas
                              </DropdownMenuItem>
                            } />
                            <AlertDialogPopup>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Tandai Lunas?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tandai lunas piutang Rp {proj.debtAmount.toLocaleString('id-ID')} untuk project ini?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogClose render={<Button variant="ghost" />}>Batal</AlertDialogClose>
                                <AlertDialogClose render={<Button onClick={() => handleSetLunas(proj)} />}>
                                  Ya, Lunas
                                </AlertDialogClose>
                              </AlertDialogFooter>
                            </AlertDialogPopup>
                          </AlertDialog>
                        )}
                        <DropdownMenuItem onClick={() => openEdit(proj)}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Ubah Data
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <AlertDialog>
                          <AlertDialogTriggerBtn render={
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600 focus:text-red-600 focus:bg-red-50">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Hapus
                            </DropdownMenuItem>
                          } />
                          <AlertDialogPopup>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Hapus Project Solo?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Yakin ingin menghapus project ini? Tindakan ini tidak dapat dibatalkan.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogClose render={<Button variant="ghost" />}>Batal</AlertDialogClose>
                              <AlertDialogClose render={<Button variant="destructive" onClick={() => handleDelete(proj.id)} />}>
                                Ya, Hapus
                              </AlertDialogClose>
                            </AlertDialogFooter>
                          </AlertDialogPopup>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  
                  <CardHeader className="pb-3 border-b border-border/50 bg-muted/20 pr-12">
                    <div className="flex flex-col gap-2">
                      <CardTitle className="text-lg text-text flex items-center gap-2 leading-tight">
                        <Briefcase className="h-4 w-4 text-primary shrink-0" />
                        <span className="line-clamp-2">{proj.projectName}</span>
                      </CardTitle>
                      <div className="self-start text-xs px-2 py-1 bg-primary/10 text-primary rounded-full font-semibold border border-primary/20">
                        {proj.progress}% Selesai
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4 flex flex-col gap-3 flex-1">
                    <div className="flex items-center gap-2 text-sm text-text/80 mb-2">
                      <User className="h-4 w-4 text-text/50" />
                      <span className="font-medium text-text">{proj.bossName}</span>
                    </div>
                    
                    <div className="h-[1px] bg-border my-1"></div>
                    
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-text/60">Nilai Project:</span>
                      <span className="font-semibold text-text">Rp {proj.paymentAmount.toLocaleString('id-ID')}</span>
                    </div>
                    
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-text/60">Piutang / Belum Bayar:</span>
                      {proj.debtAmount > 0 ? (
                        <span className="font-semibold text-red-500">Rp {proj.debtAmount.toLocaleString('id-ID')}</span>
                      ) : (
                        <span className="font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full text-xs border border-green-200">LUNAS</span>
                      )}
                    </div>
                    
                    <div className="mt-auto pt-4">
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, Math.max(0, proj.progress))}%` }}
                        ></div>
                      </div>
                      <div className="text-[10px] text-text/40 text-right mt-2 flex items-center justify-end gap-1">
                        <Calendar className="h-3 w-3" />
                        Dibuat: {formatDate(proj.createdAt)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
            
            {projects.length === 0 && (
              <div className="col-span-full py-12 text-center border border-dashed border-border rounded-xl bg-muted/20">
                <Briefcase className="h-10 w-10 text-text/30 mx-auto mb-3" />
                <p className="text-text/60">Belum ada project solo yang ditambahkan.</p>
              </div>
            )}
          </div>
        )}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingProject ? "Ubah Project" : "Tambah Project Solo Baru"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Nama Klien / Boss</label>
              <input
                required
                type="text"
                className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-text/50 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Contoh: Pak Budi"
                value={formData.bossName}
                onChange={(e) => setFormData({ ...formData, bossName: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Nama Project</label>
              <input
                required
                type="text"
                className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-text/50 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Contoh: Pembuatan Website E-Commerce"
                value={formData.projectName}
                onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Total Nilai Project (Rp)</label>
                <input
                  required
                  type="text"
                  className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-text/50 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="5.000.000"
                  value={formData.paymentAmount}
                  onChange={(e) => setFormData({ ...formData, paymentAmount: formatCurrencyInput(e.target.value) })}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Piutang (Belum Dibayar)</label>
                <input
                  required
                  type="text"
                  className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-text/50 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="2.500.000"
                  value={formData.debtAmount}
                  onChange={(e) => setFormData({ ...formData, debtAmount: formatCurrencyInput(e.target.value) })}
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Progress (%)</label>
              <input
                required
                type="number"
                min="0"
                max="100"
                className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-text/50 focus:outline-none focus:ring-2 focus:ring-primary"
                value={formData.progress}
                onChange={(e) => setFormData({ ...formData, progress: e.target.value })}
              />
            </div>
            <DialogFooter className="mt-4">
              <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Batal</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Menyimpan..." : "Simpan Project"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
