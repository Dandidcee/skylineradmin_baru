import { useState, useEffect } from "react";
import { feedbackService } from "@/services/feedback-service";
import type { CustomerFeedback } from "@/services/feedback-service";
import { Star, MessageSquareQuote, Loader2, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function PublicTestimoniesPage() {
  const [feedbacks, setFeedbacks] = useState<CustomerFeedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const data = await feedbackService.getPublicFeedbacks();
        setFeedbacks(data);
      } catch (err: any) {
        setError(err.message || "Gagal memuat testimoni.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchFeedbacks();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header section */}
      <div className="bg-primary pt-12 pb-24 px-6 md:px-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-6 md:p-12 opacity-10">
          <MessageSquareQuote className="w-64 h-64 text-white" />
        </div>
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex items-center gap-4 mb-8">
            <Button asChild variant="secondary" size="sm" className="bg-white/10 text-white hover:bg-white/20 border-0">
              <Link to="/feedback">
                <ArrowLeft className="w-4 h-4 mr-2" /> Berikan Testimoni
              </Link>
            </Button>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-sm">
            Apa Kata Mereka?
          </h1>
          <p className="text-white/80 text-lg max-w-2xl">
            Cerita dan pengalaman langsung dari klien dan member kami yang telah menggunakan layanan otomatisasi.
          </p>
        </div>
      </div>

      {/* Content section */}
      <div className="max-w-6xl mx-auto px-6 md:px-12 -mt-12 relative z-20 pb-20">
        {isLoading ? (
          <div className="bg-card rounded-xl p-12 shadow-lg border border-border flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Memuat testimoni...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 rounded-xl p-12 shadow-lg border border-red-100 flex flex-col items-center justify-center text-center">
            <p className="text-red-600 font-medium">{error}</p>
          </div>
        ) : feedbacks.length === 0 ? (
          <div className="bg-card rounded-xl p-12 shadow-lg border border-border flex flex-col items-center justify-center text-center">
            <MessageSquareQuote className="w-12 h-12 text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-semibold text-text mb-2">Belum ada testimoni</h3>
            <p className="text-muted-foreground max-w-md">
              Jadilah yang pertama membagikan pengalaman Anda menggunakan layanan kami.
            </p>
            <Button asChild className="mt-6">
              <Link to="/feedback">Tulis Testimoni</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {feedbacks.map((feedback) => (
              <div 
                key={feedback.id} 
                className="bg-card rounded-xl p-6 shadow-md border border-border flex flex-col transition-all hover:shadow-lg hover:-translate-y-1"
              >
                <div className="flex gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= feedback.rating
                          ? "fill-amber-400 text-amber-400"
                          : "text-muted-foreground/30"
                      }`}
                    />
                  ))}
                </div>
                
                <p className="text-text/80 leading-relaxed mb-6 flex-1 italic">
                  "{feedback.message}"
                </p>
                
                <div className="flex items-center gap-3 pt-4 border-t border-border/50">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
                    {feedback.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-semibold text-text text-sm">{feedback.name}</h4>

                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Footer */}
      <div className="py-8 flex justify-center opacity-40 pointer-events-none border-t border-border">
        <img src="/LogoMain.png" alt="Skyflow Logo" className="h-6 w-auto object-contain" />
      </div>
    </div>
  );
}
