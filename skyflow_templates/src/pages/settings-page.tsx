import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Shield, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { fetchApi } from "@/services/api";
import { toastManager } from "@/components/ui/toast";
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
import { AppLayout } from "@/components/layout/app-layout";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  permissions: string;
  createdAt: string;
};

const AVAILABLE_PERMISSIONS = [
  { id: "DASHBOARD", label: "Dashboard" },
  { id: "DOKUMEN", label: "Dokumen" },
  { id: "TEMPLATE", label: "Template" },
  { id: "CLIENTS", label: "List Client" },
  { id: "PAYMENT", label: "Payment" },
  { id: "KALENDER", label: "Kalender" },
  { id: "AKTIVITAS", label: "Aktivitas" },
];

export function SettingsPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "ADMIN",
    permissions: [] as string[],
  });

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const data = await fetchApi("/users");
      setUsers(data);
    } catch (err: any) {
      toastManager.error({ title: "Gagal memuat data", description: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleOpenModal = (user?: User) => {
    if (user) {
      setEditingId(user.id);
      let parsedPerms = [];
      try { parsedPerms = JSON.parse(user.permissions); } catch (e) {}
      setFormData({
        name: user.name,
        email: user.email,
        password: "", // empty for edit
        role: user.role,
        permissions: parsedPerms,
      });
    } else {
      setEditingId(null);
      setFormData({
        name: "",
        email: "",
        password: "",
        role: "ADMIN",
        permissions: [],
      });
    }
    setIsModalOpen(true);
  };

  const togglePermission = (permId: string) => {
    setFormData(prev => {
      const perms = prev.permissions.includes(permId)
        ? prev.permissions.filter(p => p !== permId)
        : [...prev.permissions, permId];
      return { ...prev, permissions: perms };
    });
  };

  const toggleAllPermissions = () => {
    setFormData(prev => {
      if (prev.permissions.length === AVAILABLE_PERMISSIONS.length) {
        return { ...prev, permissions: [] };
      }
      return { ...prev, permissions: AVAILABLE_PERMISSIONS.map(p => p.id) };
    });
  };

  const handleSave = async () => {
    try {
      if (editingId) {
        const payload: any = { ...formData };
        if (!payload.password) delete payload.password;
        await fetchApi(`/users/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        toastManager.success({ title: "Berhasil", description: "Data pegawai diperbarui" });
      } else {
        if (!formData.password) {
          toastManager.error({ title: "Error", description: "Password wajib diisi untuk pegawai baru" });
          return;
        }
        await fetchApi("/users", {
          method: "POST",
          body: JSON.stringify(formData),
        });
        toastManager.success({ title: "Berhasil", description: "Pegawai baru ditambahkan" });
      }
      setIsModalOpen(false);
      loadUsers();
    } catch (err: any) {
      toastManager.error({ title: "Gagal menyimpan", description: err.message });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetchApi(`/users/${id}`, { method: "DELETE" });
      toastManager.success({ title: "Berhasil", description: "Pegawai dihapus" });
      loadUsers();
    } catch (err: any) {
      toastManager.error({ title: "Gagal menghapus", description: err.message });
    }
  };

  return (
    <AppLayout title="Manajemen Tim">
      <div className="flex-1 space-y-6 p-4 pt-6 md:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-text">Manajemen Tim</h2>
            <p className="text-sm sm:text-base text-text/60 mt-1 sm:mt-2">Kelola akun dan hak akses tim Anda di panel SkyFlow.</p>
          </div>
          <Button onClick={() => handleOpenModal()} className="gap-2 w-full sm:w-auto">
            <Plus className="h-4 w-4" /> Tambah Pegawai
          </Button>
        </div>

        <Card className="border border-border bg-card p-0 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-text/80">
              <thead className="bg-muted/30 text-text/60">
                <tr>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 font-medium whitespace-nowrap">Nama Lengkap</th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 font-medium whitespace-nowrap">Email / Akun</th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 font-medium whitespace-nowrap">Role</th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4 font-medium text-right whitespace-nowrap">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-text/50">
                      Memuat data...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-text/50">
                      Belum ada data pegawai.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-4 sm:px-6 py-3 sm:py-4 font-medium text-text whitespace-nowrap">
                        {u.name}
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">{u.email}</td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                        {u.role === 'OWNER' ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30 px-2.5 py-0.5 text-xs font-semibold text-primary">
                            <Shield className="h-3 w-3" /> Owner
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-text/80">
                            Admin
                          </span>
                        )}
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 px-2"
                            onClick={() => handleOpenModal(u)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          
                          {u.role !== 'OWNER' && (
                            <AlertDialog>
                              <AlertDialogTrigger render={
                                <Button variant="destructive" size="sm" className="h-8 px-2">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              } />
                              <AlertDialogPopup>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Hapus Akun?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Tindakan ini tidak bisa dibatalkan. Akun pegawai ini akan dihapus secara permanen.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogClose render={<Button variant="ghost" />}>Batal</AlertDialogClose>
                                  <AlertDialogClose render={<Button variant="destructive" onClick={() => handleDelete(u.id)} />}>
                                    Ya, Hapus
                                  </AlertDialogClose>
                                </AlertDialogFooter>
                              </AlertDialogPopup>
                            </AlertDialog>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="w-[95vw] sm:max-w-[500px] max-h-[90dvh] overflow-hidden p-0 gap-0 flex flex-col">
            <DialogHeader className="border-b p-4 sm:p-6 pb-4 shrink-0">
              <DialogTitle>{editingId ? "Edit Pegawai" : "Tambah Pegawai Baru"}</DialogTitle>
              <p className="text-sm text-text/60 mt-1">
                {editingId ? "Ubah detail akun pegawai dan hak aksesnya." : "Buat akun pegawai baru dan atur hak aksesnya."}
              </p>
            </DialogHeader>
            
            <div className="p-4 sm:p-6 flex flex-col gap-4 flex-1 overflow-y-auto">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-text/80">Nama Lengkap</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none focus:border-primary transition-colors"
                  placeholder="Masukkan nama..."
                />
              </div>
              
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-text/80">Email Login</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none focus:border-primary transition-colors"
                  placeholder="admin@skyflow.id"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-text/80">
                  Password {editingId && <span className="text-text/40 font-normal">(Kosongkan jika tidak ingin diubah)</span>}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none focus:border-primary transition-colors"
                  placeholder="********"
                />
              </div>

              <div className="pt-4 border-t border-border/50">
                <div className="flex items-center justify-between mb-4">
                  <label className="text-sm font-semibold text-text">Hak Akses Menu</label>
                  <button
                    onClick={toggleAllPermissions}
                    className="text-xs font-medium text-primary hover:text-primary/80"
                  >
                    {formData.permissions.length === AVAILABLE_PERMISSIONS.length ? "Hapus Semua" : "Pilih Semua"}
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {AVAILABLE_PERMISSIONS.map(perm => {
                    const isChecked = formData.permissions.includes(perm.id);
                    return (
                      <div
                        key={perm.id}
                        onClick={() => togglePermission(perm.id)}
                        className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${
                          isChecked ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/50"
                        }`}
                      >
                        <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded ${
                          isChecked ? "bg-primary text-primary-foreground" : "border border-border bg-background"
                        }`}>
                          {isChecked && <Check className="h-3.5 w-3.5" />}
                        </div>
                        <span className={`text-sm ${isChecked ? "font-medium text-text" : "text-text/60"}`}>
                          {perm.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="border-t p-4 sm:px-6 bg-muted/10 flex justify-end gap-2 shrink-0">
              <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Batal</Button>
              <Button onClick={handleSave}>Simpan Data</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
