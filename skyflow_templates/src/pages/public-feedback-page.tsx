import { useState } from "react";
import { feedbackService } from "@/services/feedback-service";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, ArrowRight, ArrowLeft, MessageSquare, Star, Sun, Moon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/store/theme-store";

export function PublicFeedbackPage() {
  const { theme, setTheme } = useTheme();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [step, setStep] = useState(1);

  // Form State
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [type, setType] = useState("");
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState<number | null>(null);

  const validateStep = () => {
    let isValid = true;
    if (step === 1) {
      if (!name || !phone) {
        toast.error("Nama dan No HP wajib diisi!");
        isValid = false;
      }
    } else if (step === 2) {
      if (!type) {
        toast.error("Mohon pilih jenis laporan Anda!");
        isValid = false;
      } else if (type === "Testimoni" && !rating) {
        toast.error("Mohon berikan rating (bintang) untuk testimoni Anda!");
        isValid = false;
      } else if (!message) {
        toast.error("Pesan tidak boleh kosong!");
        isValid = false;
      }
    }
    setShowErrors(!isValid);
    return isValid;
  };

  const nextStep = () => { if (validateStep()) setStep(s => s + 1); };
  const prevStep = () => setStep(s => s - 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep()) return;

    setIsSubmitting(true);
    try {
      await feedbackService.submitFeedback({
        name,
        phone: phone || null,
        type,
        message,
        rating: type === "Testimoni" ? rating : null,
      });
      setIsSuccess(true);
    } catch (error: any) {
      toast.error(error.message || "Terjadi kesalahan saat mengirim formulir.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row relative">
      {/* Theme Toggle Button */}
      <button
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        className="absolute top-4 right-4 z-50 p-2 rounded-full bg-white/10 hover:bg-white/20 text-text transition-colors border border-border/50 shadow-sm backdrop-blur-md"
        aria-label="Toggle theme"
      >
        {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>

      {/* Left Panel - Branding */}
      <div className="hidden md:flex w-1/3 lg:w-5/12 relative overflow-hidden bg-primary flex-col justify-between p-12 text-white shadow-2xl z-10">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <img src="/LogoMain.png" alt="Skyflow Logo" className="w-64 max-w-full h-auto object-contain brightness-0 invert" />
          </div>
          
          <h1 className="text-5xl lg:text-6xl font-bold leading-tight mb-6 text-white drop-shadow-sm">
            Suara Anda, <br/>
            <span className="text-white/80">
              Prioritas Kami.
            </span>
          </h1>
          <p className="text-lg text-white/70 max-w-sm leading-relaxed">
            Berikan testimoni, keluhan, atau pengaduan untuk membantu kami memberikan pelayanan yang lebih baik.
          </p>
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-white/50 text-sm">
            <span>&copy; {new Date().getFullYear()} Skyflow.id</span>
          </div>
        </div>

        {/* Abstract Background Elements (Optimized for performance) */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1)_0%,transparent_70%)] rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.1)_0%,transparent_70%)] rounded-full translate-y-1/2 -translate-x-1/2" />
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex flex-col relative bg-background overflow-y-auto">
        <div className="flex-1 flex flex-col justify-center p-6 sm:p-12 lg:p-20">
        
        {/* Mobile Header (Hidden on md+) */}
        <div className="md:hidden flex items-center justify-between mb-8">
          <img src="/LogoMain.png" alt="Skyflow Logo" className="h-8 w-auto object-contain" />
          <div className="text-sm font-semibold text-text/50">Langkah {step} dari 2</div>
        </div>

        {/* Mobile Progress Bar */}
        <div className="md:hidden w-full h-2 bg-muted rounded-full mb-10 overflow-hidden">
          <motion.div 
            className="h-full bg-primary"
            initial={{ width: `${((step - 1) / 2) * 100}%` }}
            animate={{ width: `${(step / 2) * 100}%` }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />
        </div>

        <div className="w-full max-w-2xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              
              {/* STEP 1 */}
              {step === 1 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-text mb-1">Informasi Dasar</h2>
                    <p className="text-sm text-text/60">Beri tahu kami siapa Anda.</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[15px] font-semibold text-text/80">Nama Lengkap <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        value={name} onChange={(e) => { setName(e.target.value); if(showErrors) setShowErrors(false); }}
                        className={`w-full rounded-md border bg-transparent px-3 py-2 text-[15px] outline-none transition-colors placeholder:text-muted-foreground ${showErrors && !name ? 'border-red-500 focus:border-red-500' : 'border-border focus:border-primary'}`}
                        placeholder="Dandi Cahyaman"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[15px] font-semibold text-text/80">Nomor WhatsApp <span className="text-red-500">*</span></label>
                      <input
                        type="tel"
                        value={phone} onChange={(e) => { setPhone(e.target.value); if(showErrors) setShowErrors(false); }}
                        className={`w-full rounded-md border bg-transparent px-3 py-2 text-[15px] outline-none transition-colors placeholder:text-muted-foreground ${showErrors && !phone ? 'border-red-500 focus:border-red-500' : 'border-border focus:border-primary'}`}
                        placeholder="08123456789"
                      />
                    </div>
                  </div>

                  <Button onClick={nextStep} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-[15px] font-semibold mt-8">
                    Selanjutnya <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              )}

              {/* STEP 2 */}
              {step === 2 && !isSuccess && (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-text mb-1">Pesan Anda</h2>
                    <p className="text-sm text-text/60">Sampaikan apa yang ada di pikiran Anda kepada kami.</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[15px] font-semibold text-text/80">Jenis Pesan <span className="text-red-500">*</span></label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2">
                        {['Testimoni', 'Keluhan', 'Pengaduan'].map((t) => (
                          <div 
                            key={t}
                            onClick={() => { setType(t); if(showErrors) setShowErrors(false); }}
                            className={`border rounded-lg p-3 cursor-pointer text-center transition-all ${
                              type === t ? 'border-primary bg-primary/10 text-primary font-medium' : 'border-border hover:border-primary/50 text-text/80'
                            } ${showErrors && !type ? 'border-red-500' : ''}`}
                          >
                            {t}
                          </div>
                        ))}
                      </div>
                    </div>

                    {type === "Testimoni" && (
                      <div className="space-y-2 mt-4">
                        <label className="text-[15px] font-semibold text-text/80">Berapa bintang untuk kami? <span className="text-red-500">*</span></label>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => { setRating(star); if(showErrors) setShowErrors(false); }}
                              className={`p-1 transition-colors ${rating && rating >= star ? 'text-yellow-400' : 'text-muted-foreground hover:text-yellow-400/50'}`}
                            >
                              <Star className="w-8 h-8" fill={rating && rating >= star ? "currentColor" : "none"} />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="space-y-1.5 mt-4">
                      <label className="text-[15px] font-semibold text-text/80">Detail Pesan <span className="text-red-500">*</span></label>
                      <textarea
                        value={message}
                        onChange={(e) => { setMessage(e.target.value); if(showErrors) setShowErrors(false); }}
                        className={`w-full rounded-md border bg-transparent px-3 py-2 text-[15px] outline-none transition-colors min-h-[120px] resize-y placeholder:text-muted-foreground ${showErrors && !message ? 'border-red-500 focus:border-red-500' : 'border-border focus:border-primary'}`}
                        placeholder={
                          type === 'Testimoni' ? 'Ceritakan pengalaman positif Anda bersama kami...' :
                          type === 'Keluhan' ? 'Jelaskan masalah atau keluhan yang Anda alami...' :
                          type === 'Pengaduan' ? 'Laporkan hal yang tidak pantas atau pelanggaran di sini...' :
                          'Tulis pesan Anda di sini...'
                        }
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 mt-8">
                    <Button type="button" onClick={prevStep} onPointerDown={(e) => { e.preventDefault(); prevStep(); }} variant="outline" className="flex-1 py-6 border-border text-text hover:bg-muted">
                      <ArrowLeft className="w-4 h-4 mr-2" /> Kembali
                    </Button>
                    <Button type="submit" disabled={isSubmitting} className="flex-[2] bg-primary hover:bg-primary/90 text-primary-foreground py-6 font-semibold">
                      {isSubmitting ? (
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Mengirim...</>
                      ) : (
                        <><MessageSquare className="w-4 h-4 mr-2" /> Kirim Pesan</>
                      )}
                    </Button>
                  </div>
                </form>
              )}

              {/* SUCCESS */}
              {isSuccess && (
                <div className="flex flex-col items-center justify-center text-center py-12 space-y-6">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-2">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  </div>
                  <h2 className="text-3xl font-bold text-text">Terima Kasih!</h2>
                  <p className="text-text/70 max-w-sm mx-auto">
                    Pesan Anda telah berhasil kami terima. Apresiasi dan masukan Anda sangat berarti bagi pengembangan layanan kami.
                  </p>
                  
                  <div className="pt-8 w-full">
                    <Button onClick={() => window.location.reload()} variant="outline" className="w-full py-6 border-border text-text">
                      Kirim Pesan Baru
                    </Button>
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>

        {/* Desktop Progress Indicators (Hidden on mobile) */}
        {!isSuccess && (
          <div className="hidden md:flex absolute bottom-12 right-12 gap-2">
            <div className={`h-2 rounded-full transition-all duration-300 ${step === 1 ? 'w-8 bg-primary' : 'w-2 bg-muted'}`} />
            <div className={`h-2 rounded-full transition-all duration-300 ${step === 2 ? 'w-8 bg-primary' : 'w-2 bg-muted'}`} />
          </div>
        )}

        </div>
      </div>
    </div>
  );
}
