import { useState } from "react";
import { useClientTable } from "@/store/client-store";
import { createClient, updateClient, deleteClient } from "@/services/client-service";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2, Plus } from "lucide-react";
import { toastManager } from "@/components/ui/toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogClose,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogPopup,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function ClientTable() {
  const { data, loading, refresh } = useClientTable();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    address: "",
    phone: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openAddDialog = () => {
    setEditingId(null);
    setFormData({
      name: "", company: "", address: "", phone: ""
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (row: any) => {
    setEditingId(row.id);
    setFormData({
      name: row.cells.name || "",
      company: row.cells.company || "",
      address: row.cells.address || "",
      phone: row.cells.phone || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteClient(id);
      await refresh();
      toastManager.success({ title: "Berhasil", description: "Data client telah dihapus." });
    } catch (error) {
      console.error("Gagal menghapus", error);
      toastManager.error({ title: "Gagal", description: "Gagal menghapus client." });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingId) {
        await updateClient(editingId, formData);
        toastManager.success({ title: "Berhasil", description: "Data client berhasil diperbarui." });
      } else {
        await createClient(formData);
        toastManager.success({ title: "Berhasil", description: "Client baru berhasil ditambahkan." });
      }
      setIsDialogOpen(false);
      await refresh();
    } catch (error) {
      console.error(error);
      toastManager.error({ title: "Gagal", description: "Gagal menyimpan data client." });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-text/50">Memuat tabel...</div>;

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold font-heading">Daftar Client</h2>
        <Button onClick={openAddDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Tambah Client
        </Button>
      </div>

      <div className="rounded-md border bg-card overflow-hidden overflow-x-auto w-full">
        <table className="w-full text-sm text-left whitespace-nowrap">
          <thead className="bg-muted/50 text-text/70 border-b">
            <tr>
              <th className="px-4 py-3 font-medium">Nama Client</th>
              <th className="px-4 py-3 font-medium">Perusahaan</th>
              <th className="px-4 py-3 font-medium">Alamat</th>
              <th className="px-4 py-3 font-medium">No HP</th>
              <th className="px-4 py-3 font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {data.rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-text/50">Belum ada data client</td>
              </tr>
            ) : (
              data.rows.map((row) => (
                <tr key={row.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 font-medium">{row.cells.name || "-"}</td>
                  <td className="px-4 py-3">{row.cells.company || "-"}</td>
                  <td className="px-4 py-3 max-w-xs truncate" title={row.cells.address || ""}>{row.cells.address || "-"}</td>
                  <td className="px-4 py-3">{row.cells.phone || "-"}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEditDialog(row)} className="p-1.5 text-blue-500 hover:bg-blue-500/10 rounded-md transition-colors">
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <AlertDialog>
                        <AlertDialogTrigger render={
                          <button className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-md transition-colors">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        } />
                        <AlertDialogPopup>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Hapus client ini?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tindakan ini tidak bisa dibatalkan. Data client akan dihapus secara permanen dari sistem.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogClose render={<Button variant="ghost" />}>Batal</AlertDialogClose>
                            <AlertDialogClose render={<Button variant="destructive" onClick={() => handleDelete(row.id)} />}>
                              Hapus Client
                            </AlertDialogClose>
                          </AlertDialogFooter>
                        </AlertDialogPopup>
                      </AlertDialog>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="w-[95vw] sm:max-w-[600px] max-h-[90dvh] p-0 gap-0 flex flex-col overflow-hidden">
          <DialogHeader className="border-b p-4 sm:p-6 pb-4 shrink-0">
            <DialogTitle>{editingId ? "Edit Client" : "Tambah Client Baru"}</DialogTitle>
            <p className="text-sm text-text/60 mt-1">
              {editingId ? "Ubah detail informasi klien di bawah ini." : "Masukkan informasi detail klien baru ke dalam sistem."}
            </p>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
            <div className="p-4 sm:p-6 flex flex-col gap-4 flex-1 overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-text/80">Nama Client</label>
                  <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none focus:border-primary transition-colors" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-text/80">Perusahaan</label>
                  <input type="text" value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none focus:border-primary transition-colors" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-text/80">Alamat</label>
                  <input type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none focus:border-primary transition-colors" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-text/80">No HP</label>
                  <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none focus:border-primary transition-colors" />
                </div>
              </div>
            </div>

            <div className="border-t p-4 sm:px-6 bg-muted/10 flex justify-end gap-2 shrink-0">
              <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Menyimpan..." : (editingId ? "Simpan Perubahan" : "Tambah Client")}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
