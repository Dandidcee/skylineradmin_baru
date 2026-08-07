import { useState, useEffect, useMemo } from "react";
import { feedbackService, type Feedback } from "@/services/feedback-service";
import { AppLayout } from "@/components/layout/app-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/dashboard/stat-card";
import { toast } from "sonner";
import { Eye, Trash2, CheckCircle, XCircle, MessageSquareQuote, Star, MessageSquare } from "lucide-react";
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
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);

  // Filters
  const [filterStatus, setFilterStatus] = useState<"all" | "approved" | "pending">("all");
  const [filterRating, setFilterRating] = useState<string>("all");

  const fetchFeedbacks = async () => {
    setIsLoading(true);
    try {
      const data = await feedbackService.getAllFeedbacks();
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

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await feedbackService.updateFeedbackStatus(id, !currentStatus);
      toast.success(currentStatus ? "Testimoni disembunyikan dari publik." : "Testimoni berhasil dipublish.");
      fetchFeedbacks();
    } catch (error: any) {
      toast.error(error.message || "Gagal mengubah status testimoni.");
    }
  };

  const stats = useMemo(() => ({
    total: feedbacks.length,
    approved: feedbacks.filter(f => f.isApproved).length,
    pending: feedbacks.filter(f => !f.isApproved).length,
    avgRating: feedbacks.length > 0 
      ? (feedbacks.reduce((acc, curr) => acc + curr.rating, 0) / feedbacks.length).toFixed(1) 
      : "0",
  }), [feedbacks]);

  const filtered = useMemo(() => {
    return feedbacks.filter(f => {
      if (filterStatus === "approved" && !f.isApproved) return false;
      if (filterStatus === "pending" && f.isApproved) return false;
      if (filterRating !== "all" && f.rating !== parseInt(filterRating)) return false;
      return true;
    });
  }, [feedbacks, filterStatus, filterRating]);

  return (
    <AppLayout title="Kelola Testimoni">
      <div className="flex-1 space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-text">Testimoni & Ulasan</h2>
            <p className="text-sm sm:text-base text-text/60 mt-1">Kelola testimoni dari klien atau member untuk ditampilkan di halaman publik.</p>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Total Testimoni" value={String(stats.total)} icon={MessageSquareQuote} index={0} />
          <StatCard label="Menunggu Persetujuan" value={String(stats.pending)} icon={MessageSquare} index={1} />
          <StatCard label="Dipublish" value={String(stats.approved)} icon={CheckCircle} index={2} />
          <StatCard label="Rata-rata Rating" value={stats.avgRating} icon={Star} index={3} />
        </div>

        {/* Filters */}
        <Card className="p-4 border border-border bg-card shadow-sm space-y-4">
          <div className="flex flex-wrap gap-3 items-center">
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value as any)}
              className="rounded-md border border-border bg-card text-text text-sm px-3 py-1.5 outline-none focus:border-primary transition-colors"
            >
              <option value="all">Semua Status</option>
              <option value="approved">Dipublish</option>
              <option value="pending">Menunggu Persetujuan</option>
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
                  <th className="px-4 py-3 font-medium whitespace-nowrap">Nama & Peran</th>
                  <th className="px-4 py-3 font-medium whitespace-nowrap">Rating</th>
                  <th className="px-4 py-3 font-medium whitespace-nowrap min-w-[200px]">Ulasan</th>
                  <th className="px-4 py-3 font-medium whitespace-nowrap">Status Publik</th>
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
                        {item.role && <div className="text-xs text-text/50 font-normal">{item.role}</div>}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map(star => (
                            <Star key={star} className={`w-3 h-3 ${star <= item.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`} />
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-text/70">
                        <div className="line-clamp-2 italic">"{item.message}"</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {item.isApproved ? (
                          <span className="inline-flex items-center rounded-full bg-green-500/10 px-2.5 py-0.5 text-xs font-semibold text-green-500">
                            Dipublish
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-600">
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            title={item.isApproved ? "Sembunyikan dari Publik" : "Publish ke Publik"}
                            className={`h-8 w-8 p-0 ${item.isApproved ? 'text-amber-500 hover:text-amber-600 hover:bg-amber-500/10' : 'text-green-500 hover:text-green-600 hover:bg-green-500/10'}`} 
                            onClick={() => handleToggleStatus(item.id, item.isApproved)}
                          >
                            {item.isApproved ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                          </Button>
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
                                <AlertDialogTitle>Hapus Testimoni?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Testimoni dari <b>{item.name}</b> akan dihapus permanen. Aksi ini tidak dapat dibatalkan.
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
            <DialogTitle>Detail Testimoni</DialogTitle>
          </DialogHeader>
          {selectedFeedback && (
            <div className="space-y-6 mt-2">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg text-text">{selectedFeedback.name}</h3>
                  {selectedFeedback.role && <p className="text-sm text-text/60">{selectedFeedback.role}</p>}
                </div>
                <div className="flex gap-1 bg-amber-50 px-2 py-1 rounded-full">
                  {[1, 2, 3, 4, 5].map(star => (
                    <Star key={star} className={`w-4 h-4 ${star <= selectedFeedback.rating ? "fill-amber-400 text-amber-400" : "text-black/10"}`} />
                  ))}
                </div>
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
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-text/70">Status:</span>
                  {selectedFeedback.isApproved ? (
                    <span className="inline-flex items-center rounded-full bg-green-500/10 px-2.5 py-0.5 text-xs font-semibold text-green-500">
                      Dipublish
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-600">
                      Menunggu Persetujuan
                    </span>
                  )}
                </div>
              </div>

              <div className="flex gap-2 w-full pt-2">
                <Button 
                  variant="outline" 
                  className="w-full flex-1"
                  onClick={() => handleToggleStatus(selectedFeedback.id, selectedFeedback.isApproved)}
                >
                  {selectedFeedback.isApproved ? "Sembunyikan dari Publik" : "Publish Testimoni"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
