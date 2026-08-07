import { useState, useEffect, useMemo } from "react";
import { feedbackService } from "@/services/feedback-service";
import type { CustomerFeedback } from "@/services/feedback-service";
import { AppLayout } from "@/components/layout/app-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/dashboard/stat-card";
import { toast } from "sonner";
import { Eye, Trash2, MessageSquareQuote, Star, MessageSquare } from "lucide-react";
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

export function FeedbackManagePage() {
  const [feedbacks, setFeedbacks] = useState<CustomerFeedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFeedback, setSelectedFeedback] = useState<CustomerFeedback | null>(null);

  // Filters
  const [filterType, setFilterType] = useState<string>("all");
  const [filterRating, setFilterRating] = useState<string>("all");

  const fetchFeedbacks = async () => {
    setIsLoading(true);
    try {
      const data = await feedbackService.getFeedbacks();
      setFeedbacks(data);
    } catch (error: any) {
      toast.error(error.message || "Gagal mengambil data testimoni.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await feedbackService.deleteFeedback(id);
      toast.success("Testimoni berhasil dihapus.");
      fetchFeedbacks();
    } catch (error: any) {
      toast.error(error.message || "Gagal menghapus testimoni.");
    }
  };

  const stats = useMemo(() => ({
    total: feedbacks.length,
    testimoni: feedbacks.filter(f => f.type === "Testimoni").length,
    keluhan: feedbacks.filter(f => f.type === "Keluhan").length,
    avgRating: feedbacks.length > 0 
      ? (feedbacks.reduce((acc, curr) => acc + (curr.rating || 0), 0) / feedbacks.filter(f => f.rating).length || 1).toFixed(1) 
      : "0",
  }), [feedbacks]);

  const filtered = useMemo(() => {
    return feedbacks.filter(f => {
      if (filterType !== "all" && f.type !== filterType) return false;
      if (filterRating !== "all" && f.rating !== parseInt(filterRating)) return false;
      return true;
    });
  }, [feedbacks, filterType, filterRating]);

  return (
    <AppLayout title="Kelola Testimoni">
      <div className="flex-1 space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-text">Testimoni & Keluhan</h2>
            <p className="text-sm sm:text-base text-text/60 mt-1">Kelola masukan dari pelanggan.</p>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Total Masukan" value={String(stats.total)} icon={MessageSquareQuote} index={0} />
          <StatCard label="Testimoni" value={String(stats.testimoni)} icon={Star} index={1} />
          <StatCard label="Keluhan" value={String(stats.keluhan)} icon={MessageSquare} index={2} />
          <StatCard label="Rata-rata Rating" value={stats.avgRating} icon={Star} index={3} />
        </div>

        {/* Filters */}
        <Card className="p-4 border border-border bg-card shadow-sm space-y-4">
          <div className="flex flex-wrap gap-3 items-center">
            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
              className="rounded-md border border-border bg-card text-text text-sm px-3 py-1.5 outline-none focus:border-primary transition-colors"
            >
              <option value="all">Semua Tipe</option>
              <option value="Testimoni">Testimoni</option>
              <option value="Keluhan">Keluhan</option>
            </select>

            <select
              value={filterRating}
              onChange={e => setFilterRating(e.target.value)}
              className="rounded-md border border-border bg-card text-text text-sm px-3 py-1.5 outline-none focus:border-primary transition-colors"
            >
              <option value="all">Semua Rating</option>
              <option value="5">Bintang 5</option>
              <option value="4">Bintang 4</option>
              <option value="3">Bintang 3</option>
              <option value="2">Bintang 2</option>
              <option value="1">Bintang 1</option>
            </select>

            <span className="text-xs text-text/40 ml-auto">
              Menampilkan {filtered.length} dari {feedbacks.length} data
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
                  <th className="px-4 py-3 font-medium whitespace-nowrap">Nama & No HP</th>
                  <th className="px-4 py-3 font-medium whitespace-nowrap">Tipe</th>
                  <th className="px-4 py-3 font-medium whitespace-nowrap">Rating</th>
                  <th className="px-4 py-3 font-medium whitespace-nowrap min-w-[200px]">Pesan</th>
                  <th className="px-4 py-3 font-medium text-right whitespace-nowrap">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-text/50">Memuat data...</td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-text/50">
                      {feedbacks.length === 0 ? "Belum ada testimoni." : "Tidak ada data yang cocok dengan filter."}
                    </td>
                  </tr>
                ) : (
                  filtered.map((item) => (
                    <tr key={item.id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap text-text/60 text-xs">
                        {new Date(item.createdAt).toLocaleDateString('id-ID')}
                      </td>
                      <td className="px-4 py-3 font-medium text-text">
                        <div>{item.name}</div>
                        {item.phone && <div className="text-xs text-text/50 font-normal">{item.phone}</div>}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-text/70">
                        {item.type}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex gap-0.5">
                          {item.rating ? [1, 2, 3, 4, 5].map(star => (
                            <Star key={star} className={`w-3 h-3 ${star <= item.rating! ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`} />
                          )) : "-"}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-text/70">
                        <div className="line-clamp-2 italic">"{item.message}"</div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setSelectedFeedback(item)}>
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
                                  Data dari <b>{item.name}</b> akan dihapus permanen. Aksi ini tidak dapat dibatalkan.
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
      <Dialog open={!!selectedFeedback} onOpenChange={(open) => !open && setSelectedFeedback(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Detail {selectedFeedback?.type}</DialogTitle>
          </DialogHeader>
          {selectedFeedback && (
            <div className="space-y-6 mt-2">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg text-text">{selectedFeedback.name}</h3>
                  {selectedFeedback.phone && <p className="text-sm text-text/60">{selectedFeedback.phone}</p>}
                </div>
                {selectedFeedback.rating && (
                  <div className="flex gap-1 bg-amber-50 px-2 py-1 rounded-full">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star key={star} className={`w-4 h-4 ${star <= selectedFeedback.rating! ? "fill-amber-400 text-amber-400" : "text-black/10"}`} />
                    ))}
                  </div>
                )}
              </div>
              
              <div className="p-4 bg-muted/30 rounded-xl relative">
                <MessageSquareQuote className="w-8 h-8 text-primary/20 absolute top-2 right-2" />
                <p className="text-text/80 italic relative z-10 leading-relaxed">
                  "{selectedFeedback.message}"
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div className="text-xs text-text/50">
                  Dikirim pada {new Date(selectedFeedback.createdAt).toLocaleString('id-ID')}
                </div>
                <div className="text-sm font-medium text-text/70">
                  Tipe: {selectedFeedback.type}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
