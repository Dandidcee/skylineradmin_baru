import { useState, useEffect, useMemo } from "react";
import { formService, type SurveyResponse } from "@/services/form-service";
import { AppLayout } from "@/components/layout/app-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/dashboard/stat-card";
import { toast } from "sonner";
import { Eye, Trash2, MapPin, Phone, User, CalendarDays, Users, BookOpen, GraduationCap, XCircle, MessageCircle, SlidersHorizontal, Settings2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const DEFAULT_WA_TEMPLATE = `Hallo kakak {nama} 👋

Saya admin Skyflow.id ingin menginformasikan bahwa {produk} yang kakak butuhkan sudah tersedia.

Silakan cek di link berikut:
[link akan ditambahkan]

Pesan ini dikirimkan berdasarkan minat yang kakak isi lewat survey di Skyflow.id 🙏`;

const WA_TEMPLATE_KEY = "skyflow_wa_template";

function buildWaLink(phone: string, template: string, item: SurveyResponse): string {
  const cleaned = phone.replace(/\D/g, "").replace(/^0/, "62");
  const produkMap: Record<string, string> = {
    "Ya": "kelas otomasi bisnis",
    "Tidak, ebook saja": "ebook panduan otomasi",
    "Tidak perlu sama sekali": "materi otomasi",
    "Tidak tertarik": "program kami",
  };
  const produk = produkMap[item.needsClass] || "program kami";
  const text = template
    .replace(/{nama}/g, item.name)
    .replace(/{kota}/g, item.city)
    .replace(/{provinsi}/g, item.province)
    .replace(/{nomor}/g, item.phone)
    .replace(/{kecamatan}/g, item.district)
    .replace(/{produk}/g, produk);
  return `https://wa.me/${cleaned}?text=${encodeURIComponent(text)}`;
}

const WaIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const NEEDS_CLASS_FILTERS = [
  { label: "Semua", value: "" },
  { label: "Minat Kelas", value: "Ya" },
  { label: "Minat Ebook", value: "Tidak, ebook saja" },
  { label: "Tidak Perlu", value: "Tidak perlu sama sekali" },
  { label: "Tidak Tertarik", value: "Tidak tertarik" },
];

const needsClassBadge = (val: string) => {
  const map: Record<string, { label: string; color: string }> = {
    "Ya": { label: "Minat Kelas", color: "bg-blue-500/10 text-blue-500" },
    "Tidak, ebook saja": { label: "Minat Ebook", color: "bg-purple-500/10 text-purple-500" },
    "Tidak perlu sama sekali": { label: "Tidak Perlu", color: "bg-yellow-500/10 text-yellow-600" },
    "Tidak tertarik": { label: "Tidak Tertarik", color: "bg-red-500/10 text-red-500" },
  };
  const m = map[val];
  if (!m) return <span className="text-text/30 text-xs">-</span>;
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${m.color}`}>{m.label}</span>;
};

export function FormResponsesPage() {
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedResponse, setSelectedResponse] = useState<SurveyResponse | null>(null);

  // Filters
  const [filterMinat, setFilterMinat] = useState("");
  const [filterGender, setFilterGender] = useState("");
  const [filterProvinsi, setFilterProvinsi] = useState("");

  // WA Template
  const [waTemplate, setWaTemplate] = useState(() =>
    localStorage.getItem(WA_TEMPLATE_KEY) || DEFAULT_WA_TEMPLATE
  );
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [tempTemplate, setTempTemplate] = useState(waTemplate);

  const fetchResponses = async () => {
    setIsLoading(true);
    try {
      const data = await formService.getAllForms();
      setResponses(data);
    } catch (error: any) {
      toast.error(error.message || "Gagal mengambil data form.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { const _t = setTimeout(() => { fetchResponses(); }, 0); return () => clearTimeout(_t); }, []);

  const handleDelete = async (id: string) => {
    try {
      await formService.deleteForm(id);
      toast.success("Data berhasil dihapus.");
      fetchResponses();
    } catch (error: any) {
      toast.error(error.message || "Gagal menghapus data.");
    }
  };

  const saveTemplate = () => {
    setWaTemplate(tempTemplate);
    localStorage.setItem(WA_TEMPLATE_KEY, tempTemplate);
    setIsTemplateModalOpen(false);
    toast.success("Template WhatsApp berhasil disimpan.");
  };

  const provinces = useMemo(() => {
    const set = new Set(responses.map(r => r.province).filter(Boolean));
    return Array.from(set).sort();
  }, [responses]);

  const stats = useMemo(() => ({
    total: responses.length,
    minatKelas: responses.filter(r => r.needsClass === "Ya").length,
    minatEbook: responses.filter(r => r.needsClass === "Tidak, ebook saja").length,
    tidakTertarik: responses.filter(r => r.needsClass === "Tidak tertarik" || r.needsClass === "Tidak perlu sama sekali").length,
    joinKomunitas: responses.filter(r => r.joinCommunity).length,
  }), [responses]);

  const needsClassCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    NEEDS_CLASS_FILTERS.forEach(f => {
      counts[f.value] = f.value === "" ? responses.length : responses.filter(r => r.needsClass === f.value).length;
    });
    return counts;
  }, [responses]);

  const filtered = useMemo(() => {
    return responses.filter(r => {
      if (filterMinat && r.needsClass !== filterMinat) return false;
      if (filterGender && r.gender !== filterGender) return false;
      if (filterProvinsi && r.province !== filterProvinsi) return false;
      return true;
    });
  }, [responses, filterMinat, filterGender, filterProvinsi]);

  return (
    <AppLayout title="Data Survey">
      <div className="flex-1 space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-text">Form Survey</h2>
            <p className="text-sm sm:text-base text-text/60 mt-1">Lihat dan kelola respon dari pengunjung.</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 shrink-0"
            onClick={() => { setTempTemplate(waTemplate); setIsTemplateModalOpen(true); }}
          >
            <Settings2 className="w-4 h-4" />
            Template WA
          </Button>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          <StatCard label="Total Responden" value={String(stats.total)} icon={Users} index={0} />
          <StatCard label="Minat Kelas" value={String(stats.minatKelas)} icon={GraduationCap} index={1} />
          <StatCard label="Minat Ebook" value={String(stats.minatEbook)} icon={BookOpen} index={2} />
          <StatCard label="Tidak Tertarik" value={String(stats.tidakTertarik)} icon={XCircle} index={3} />
          <StatCard label="Join Komunitas" value={String(stats.joinKomunitas)} icon={MessageCircle} index={4} />
        </div>

        {/* Filters */}
        <Card className="p-4 border border-border bg-card shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-text/70">
            <SlidersHorizontal className="w-4 h-4" />
            Filter Data
          </div>

          <div className="flex flex-wrap gap-2">
            {NEEDS_CLASS_FILTERS.map(f => (
              <button
                key={f.value}
                onClick={() => setFilterMinat(f.value)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold border transition-all ${
                  filterMinat === f.value
                    ? "bg-primary text-white border-primary"
                    : "bg-transparent text-text/70 border-border hover:border-primary/50"
                }`}
              >
                {f.label}
                <span className={`ml-1.5 px-1.5 py-0.5 rounded text-[10px] font-bold ${filterMinat === f.value ? "bg-white/20 text-white" : "bg-muted text-text/60"}`}>
                  {needsClassCounts[f.value]}
                </span>
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-3 items-center">
            <select
              value={filterGender}
              onChange={e => setFilterGender(e.target.value)}
              className="rounded-md border border-border bg-card text-text text-sm px-3 py-1.5 outline-none focus:border-primary transition-colors"
            >
              <option value="">Semua Gender</option>
              <option value="Laki-laki">Laki-laki</option>
              <option value="Perempuan">Perempuan</option>
            </select>

            <select
              value={filterProvinsi}
              onChange={e => setFilterProvinsi(e.target.value)}
              className="rounded-md border border-border bg-card text-text text-sm px-3 py-1.5 outline-none focus:border-primary transition-colors"
            >
              <option value="">Semua Provinsi</option>
              {provinces.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>

            {(filterMinat || filterGender || filterProvinsi) && (
              <button
                onClick={() => { setFilterMinat(""); setFilterGender(""); setFilterProvinsi(""); }}
                className="text-xs text-red-400 hover:text-red-500 underline"
              >
                Reset filter
              </button>
            )}

            <span className="text-xs text-text/40 ml-auto">
              Menampilkan {filtered.length} dari {responses.length} data
            </span>
          </div>
        </Card>

        {/* Table */}
        <Card className="border border-border bg-card p-0 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-text/80">
              <thead className="bg-muted/30 text-text/60">
                <tr>
                  <th className="px-4 py-3 font-medium whitespace-nowrap">Tanggal</th>
                  <th className="px-4 py-3 font-medium whitespace-nowrap">Nama</th>
                  <th className="px-4 py-3 font-medium whitespace-nowrap">Domisili</th>
                  <th className="px-4 py-3 font-medium whitespace-nowrap">No HP</th>
                  <th className="px-4 py-3 font-medium whitespace-nowrap">Minat</th>
                  <th className="px-4 py-3 font-medium whitespace-nowrap">Komunitas</th>
                  <th className="px-4 py-3 font-medium text-right whitespace-nowrap">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-text/50">Memuat data...</td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-text/50">
                      {responses.length === 0 ? "Belum ada respon survey." : "Tidak ada data yang cocok dengan filter."}
                    </td>
                  </tr>
                ) : (
                  filtered.map((item) => (
                    <tr key={item.id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap text-text/60 text-xs">
                        {new Date(item.createdAt).toLocaleDateString('id-ID')}
                      </td>
                      <td className="px-4 py-3 font-medium text-text whitespace-nowrap">{item.name}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-text/70">{item.city}, {item.province}</td>
                      <td className="px-4 py-3 whitespace-nowrap font-mono text-xs">{item.phone}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{needsClassBadge(item.needsClass)}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {item.joinCommunity ? (
                          <span className="inline-flex items-center rounded-full bg-green-500/10 px-2.5 py-0.5 text-xs font-semibold text-green-500">
                            Ya ({item.communityChannel})
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-red-500/10 px-2.5 py-0.5 text-xs font-semibold text-red-500">
                            Tidak
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <a
                            href={buildWaLink(item.phone, waTemplate, item)}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Kirim WhatsApp"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-green-500 hover:bg-green-500/10 transition-colors"
                          >
                            <WaIcon className="w-4 h-4" />
                          </a>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setSelectedResponse(item)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500 hover:text-red-400 hover:bg-red-500/10">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Hapus Data?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Data survey dari <b>{item.name}</b> akan dihapus permanen. Aksi ini tidak dapat dibatalkan.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(item.id)} className="bg-red-500 hover:bg-red-600">
                                  Hapus
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Detail Modal */}
      <Dialog open={!!selectedResponse} onOpenChange={(open) => !open && setSelectedResponse(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Detail Survey</DialogTitle>
          </DialogHeader>
          {selectedResponse && (
            <div className="space-y-5 mt-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="text-xs text-text/50 uppercase font-semibold">Nama Lengkap</div>
                  <div className="text-sm font-medium flex items-center gap-2">
                    <User className="w-4 h-4 text-primary" /> {selectedResponse.name}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-text/50 uppercase font-semibold">Kontak</div>
                  <div className="text-sm font-medium flex items-center gap-2">
                    <Phone className="w-4 h-4 text-green-500" /> {selectedResponse.phone}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-text/50 uppercase font-semibold">Gender</div>
                  <div className="text-sm">{selectedResponse.gender || "-"}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-text/50 uppercase font-semibold">Usia</div>
                  <div className="text-sm">{selectedResponse.age ? `${selectedResponse.age} Tahun` : "-"}</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-muted/30 flex items-start gap-2 text-sm">
                <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-text">{selectedResponse.district}, {selectedResponse.city}, {selectedResponse.province}</div>
                  <div className="text-text/70 mt-1 text-xs">{selectedResponse.fullAddress}</div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="border-l-2 border-primary pl-3">
                  <div className="text-xs text-text/50 uppercase font-semibold mb-1">Perlu Kelas?</div>
                  <div className="text-sm font-medium">{selectedResponse.needsClass}</div>
                </div>
                {selectedResponse.interestLevel && (
                  <div className="border-l-2 border-purple-500 pl-3">
                    <div className="text-xs text-text/50 uppercase font-semibold mb-1">Ketertarikan</div>
                    <div className="text-sm font-medium text-purple-400">{selectedResponse.interestLevel}</div>
                  </div>
                )}
                <div className="border-l-2 border-green-500 pl-3">
                  <div className="text-xs text-text/50 uppercase font-semibold mb-1">Join Komunitas</div>
                  <div className="text-sm font-medium">
                    {selectedResponse.joinCommunity ? `Ya, via ${selectedResponse.communityChannel}` : "Tidak"}
                  </div>
                </div>
              </div>

              <a
                href={buildWaLink(selectedResponse.phone, waTemplate, selectedResponse)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-green-500 hover:bg-green-600 text-white text-sm font-semibold transition-colors"
              >
                <WaIcon className="w-4 h-4" />
                Kirim WhatsApp ke {selectedResponse.name}
              </a>

              <div className="text-xs text-text/40 pt-2 border-t border-border flex items-center gap-2">
                <CalendarDays className="w-3 h-3" /> Disubmit pada {new Date(selectedResponse.createdAt).toLocaleString('id-ID')}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* WA Template Modal */}
      <Dialog open={isTemplateModalOpen} onOpenChange={setIsTemplateModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Template WhatsApp</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <p className="text-xs text-text/50">
              Gunakan variabel:{" "}
              {["{nama}", "{produk}", "{kota}", "{provinsi}", "{nomor}", "{kecamatan}"].map(v => (
                <code key={v} className="bg-muted px-1.5 py-0.5 rounded mr-1">{v}</code>
              ))}
              <span className="block mt-1 text-text/40">— <code className="bg-muted px-1 py-0.5 rounded">{"{produk}"}</code> otomatis diganti sesuai pilihan survey (kelas / ebook / dll)</span>
            </p>
            <textarea
              value={tempTemplate}
              onChange={e => setTempTemplate(e.target.value)}
              rows={10}
              className="w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-primary transition-colors resize-y font-mono"
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsTemplateModalOpen(false)}>Batal</Button>
              <Button size="sm" onClick={saveTemplate}>Simpan Template</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
