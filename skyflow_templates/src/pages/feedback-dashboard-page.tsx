import { useState, useEffect } from "react";
import { feedbackService } from "@/services/feedback-service";
import type { CustomerFeedback } from "@/services/feedback-service";
import { AppLayout } from "@/components/layout/app-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Trash2, Phone, Star, MessageSquare } from "lucide-react";
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

export function FeedbackDashboardPage() {
  const [feedbacks, setFeedbacks] = useState<CustomerFeedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await feedbackService.getFeedbacks();
      setFeedbacks(data);
    } catch (error) {
      toast.error("Gagal memuat data pelanggan.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await feedbackService.deleteFeedback(id);
      toast.success("Berhasil dihapus!");
      setFeedbacks(prev => prev.filter(f => f.id !== id));
    } catch (error) {
      toast.error("Gagal menghapus data.");
    }
  };

  const getBadgeColor = (type: string) => {
    if (type === "Testimoni") return "bg-green-500/20 text-green-500 border-green-500/30";
    if (type === "Keluhan") return "bg-orange-500/20 text-orange-500 border-orange-500/30";
    return "bg-red-500/20 text-red-500 border-red-500/30"; // Pengaduan
  };

  return (
    <AppLayout title="Form Pelanggan">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <p className="text-sm text-text/60">Kelola testimoni, keluhan, dan pengaduan pelanggan.</p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : feedbacks.length === 0 ? (
          <div className="text-center py-20 bg-white/5 border border-white/10 rounded-xl">
            <MessageSquare className="h-12 w-12 text-white/20 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white/80">Belum Ada Pesan</h3>
            <p className="text-sm text-white/50 mt-1">Pesan dari pelanggan akan muncul di sini.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {feedbacks.map(f => (
              <Card key={f.id} className="relative overflow-hidden flex flex-col h-full group bg-card border-border hover:border-primary/50 transition-colors">
                <div className="p-5 flex flex-col h-full relative z-10">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-lg text-text">{f.name}</h3>
                      <div className="flex items-center text-xs text-text/50 mt-1">
                        <span className="bg-muted px-2 py-0.5 rounded-full">
                          {new Date(f.createdAt).toLocaleDateString("id-ID", {
                            day: 'numeric', month: 'short', year: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                    <span className={`text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-md border ${getBadgeColor(f.type)}`}>
                      {f.type}
                    </span>
                  </div>

                  {f.phone && (
                    <div className="flex items-center gap-2 text-sm text-text/70 mb-4 bg-muted/50 p-2 rounded-md border border-border">
                      <Phone className="h-4 w-4 shrink-0 text-text/50" />
                      <span className="font-medium">{f.phone}</span>
                    </div>
                  )}

                  {f.type === "Testimoni" && f.rating && (
                    <div className="flex gap-1 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`h-4 w-4 ${i < f.rating! ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`} />
                      ))}
                    </div>
                  )}

                  <div className="text-sm text-text/80 bg-white/5 p-3 rounded-md border border-white/10 flex-1 relative overflow-hidden">
                    <p className="whitespace-pre-wrap">{f.message}</p>
                  </div>

                  <div className="flex justify-end mt-4 pt-4 border-t border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-400 hover:bg-red-500/10">
                          <Trash2 className="h-4 w-4 mr-2" /> Hapus
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Hapus Pesan?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tindakan ini tidak dapat dibatalkan. Pesan ini akan dihapus secara permanen.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Batal</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(f.id)} className="bg-red-500 hover:bg-red-600 text-white">
                            Hapus
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
