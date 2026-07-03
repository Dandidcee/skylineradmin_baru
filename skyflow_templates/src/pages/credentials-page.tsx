import { useState, useEffect, useMemo } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, Plus, Key, Globe, User, Eye, EyeOff, Copy, CheckCircle2, Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";
import { getCredentials, createCredential, updateCredential, deleteCredential, type Credential } from "@/services/credential-service";
import { getClients } from "@/services/client-service";
import { getProjects, type Project } from "@/services/project-service";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";

export function CredentialsPage() {
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showPassword, setShowPassword] = useState<Record<string, boolean>>({});

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form State
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [notes, setNotes] = useState("");
  const [clientId, setClientId] = useState("");
  const [projectId, setProjectId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [credRes, clientRes, projRes] = await Promise.all([
        getCredentials(),
        getClients(),
        getProjects()
      ]);
      setCredentials(credRes);
      setClients(clientRes);
      setProjects(projRes);
    } catch (error) {
      toast.error("Gagal memuat data kredensial");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredCredentials = useMemo(() => {
    return credentials.filter(c => {
      const q = search.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        (c.url || "").toLowerCase().includes(q) ||
        (c.username || "").toLowerCase().includes(q) ||
        (c.client?.name || "").toLowerCase().includes(q) ||
        (c.project?.name || "").toLowerCase().includes(q)
      );
    });
  }, [credentials, search]);

  const handleCopy = (text?: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success("Tersalin ke clipboard!");
  };

  const togglePassword = (id: string) => {
    setShowPassword(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const openModal = (cred?: Credential) => {
    if (cred) {
      setEditingId(cred.id);
      setName(cred.name);
      setUrl(cred.url || "");
      setUsername(cred.username || "");
      setPassword(cred.password || "");
      setNotes(cred.notes || "");
      setClientId(cred.clientId || "");
      setProjectId(cred.projectId || "");
    } else {
      setEditingId(null);
      setName("");
      setUrl("");
      setUsername("");
      setPassword("");
      setNotes("");
      setClientId("");
      setProjectId("");
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Nama kredensial wajib diisi");
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        name,
        url,
        username,
        password,
        notes,
        clientId: clientId || null,
        projectId: projectId || null,
      };
      
      if (editingId) {
        await updateCredential(editingId, payload);
        toast.success("Berhasil memperbarui kredensial");
      } else {
        await createCredential(payload);
        toast.success("Berhasil menambahkan kredensial");
      }
      setIsModalOpen(false);
      loadData();
    } catch (error) {
      toast.error("Gagal menyimpan data");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Yakin ingin menghapus kredensial ini?")) {
      try {
        await deleteCredential(id);
        toast.success("Berhasil menghapus kredensial");
        loadData();
      } catch (error) {
        toast.error("Gagal menghapus data");
      }
    }
  };

  return (
    <AppLayout title="Akses & Kredensial">
      <div className="flex flex-col gap-6 w-full">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold font-heading">Kredensial & Akses</h1>
            <p className="text-text/60">Kelola informasi login, alamat domain, dan akses klien/proyek.</p>
          </div>
          <Button onClick={() => openModal()} className="shrink-0">
            <Plus className="h-4 w-4 mr-2" />
            Tambah Kredensial
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Cari nama, klien, proyek, atau domain..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 w-full rounded-md border border-input bg-transparent pl-9 pr-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        {loading ? (
          <p className="text-center text-muted-foreground py-8">Memuat data...</p>
        ) : filteredCredentials.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">Tidak ada data kredensial ditemukan.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCredentials.map(cred => (
              <Card key={cred.id} className="relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Key className="h-4 w-4 text-blue-500" />
                        {cred.name}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {(cred.client?.name || cred.project?.name) ? (
                          <span className="font-medium text-slate-700">
                            {cred.client?.name} {cred.project?.name && ` - ${cred.project.name}`}
                          </span>
                        ) : "Kredensial Umum"}
                      </CardDescription>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500" onClick={() => openModal(cred)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-500" onClick={() => handleDelete(cred.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-3 text-sm">
                  {cred.url && (
                    <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-md border border-slate-100">
                      <Globe className="h-4 w-4 text-slate-400 shrink-0" />
                      <span className="flex-1 truncate font-medium text-slate-700">{cred.url}</span>
                      <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => handleCopy(cred.url)}>
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                  {cred.username && (
                    <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-md border border-slate-100">
                      <User className="h-4 w-4 text-slate-400 shrink-0" />
                      <span className="flex-1 truncate text-slate-700">{cred.username}</span>
                      <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => handleCopy(cred.username)}>
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                  {cred.password && (
                    <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-md border border-slate-100">
                      <Key className="h-4 w-4 text-slate-400 shrink-0" />
                      <span className="flex-1 truncate font-mono text-slate-700">
                        {showPassword[cred.id] ? cred.password : '••••••••••••'}
                      </span>
                      <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => togglePassword(cred.id)}>
                        {showPassword[cred.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                      </Button>
                      <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => handleCopy(cred.password)}>
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                  {cred.notes && (
                    <div className="mt-2 text-xs text-slate-500 whitespace-pre-wrap bg-yellow-50 p-2 rounded-md border border-yellow-100">
                      {cred.notes}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-lg overflow-y-auto max-h-[90vh]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>{editingId ? "Ubah Kredensial" : "Tambah Kredensial"}</DialogTitle>
              <DialogDescription>
                Simpan informasi akses penting untuk klien atau proyek.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label className="text-sm font-semibold">Nama Kredensial *</label>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="h-10 w-full rounded-md border border-input px-3 text-sm focus:outline-none focus:border-primary"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <label className="text-sm font-semibold text-slate-600">Kaitkan dengan Klien (Opsional)</label>
                  <select
                    value={clientId}
                    onChange={e => setClientId(e.target.value)}
                    className="h-10 w-full rounded-md border border-input px-3 text-sm focus:outline-none focus:border-primary"
                  >
                    <option value="">-- Pilih Klien --</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-semibold text-slate-600">Kaitkan dengan Proyek (Opsional)</label>
                  <select
                    value={projectId}
                    onChange={e => setProjectId(e.target.value)}
                    className="h-10 w-full rounded-md border border-input px-3 text-sm focus:outline-none focus:border-primary"
                  >
                    <option value="">-- Pilih Proyek --</option>
                    {projects.map(p => {
                      if (p.status === "cancel" || p.status === "canceled_by_skyflow") return null;
                      return (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      );
                    })}
                  </select>
                </div>
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-semibold">Alamat Domain / URL Login</label>
                <input
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  className="h-10 w-full rounded-md border border-input px-3 text-sm focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <label className="text-sm font-semibold">Username / Email</label>
                  <input
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    className="h-10 w-full rounded-md border border-input px-3 text-sm focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-semibold">Password / PIN</label>
                  <input
                    type="text"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="h-10 w-full rounded-md border border-input px-3 text-sm focus:outline-none focus:border-primary font-mono"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-semibold">Catatan Khusus</label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="h-20 w-full rounded-md border border-input px-3 py-2 text-sm focus:outline-none focus:border-primary resize-none"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Batal</Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Menyimpan..." : "Simpan Kredensial"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
