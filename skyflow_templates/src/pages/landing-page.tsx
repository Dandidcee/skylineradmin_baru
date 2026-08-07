import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Bot, Zap, ShieldCheck, Workflow, BarChart3, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-primary/30">
      <Helmet>
        <title>Skyflow | Jasa Automasi N8N & Integrasi Sistem Bisnis</title>
        <meta name="description" content="Tingkatkan efisiensi bisnis Anda hingga 80% dengan jasa automasi N8N dari Skyflow. Solusi integrasi sistem otomatis tanpa batas untuk perusahaan Anda." />
        <meta name="keywords" content="Jasa Automasi, N8N, Skyflow, Admin Skyflow, Automasi Bisnis, Integrasi API, Workflow Automation" />
      </Helmet>

      {/* Navbar */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? "bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/10 py-3" : "bg-transparent py-5"}`}>
        <div className="container mx-auto px-6 md:px-12 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src="/LogoMain.png" alt="Skyflow Logo" className="h-8 md:h-10 w-auto object-contain brightness-0 invert" />
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/70">
            <a href="#fitur" className="hover:text-white transition-colors">Fitur</a>
            <a href="#cara-kerja" className="hover:text-white transition-colors">Cara Kerja</a>
            <Link to="/form" className="hover:text-white transition-colors">Form Survey</Link>
          </div>
          <Link to="/form">
            <Button className="bg-white text-black hover:bg-white/90 rounded-full px-6 font-semibold shadow-[0_0_20px_rgba(255,255,255,0.3)]">
              Mulai Sekarang
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden flex flex-col items-center text-center px-4">
        {/* Abstract Backgrounds */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.15)_0%,transparent_60%)] rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.1)_0%,transparent_60%)] rounded-full blur-3xl pointer-events-none" />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="z-10 max-w-4xl mx-auto flex flex-col items-center"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-blue-400 mb-6 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            N8N Automation Services by Skyflow
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
            Revolusi Bisnis Anda dengan <br className="hidden md:block" />
            <span className="text-blue-500">Automasi Tanpa Batas.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-white/60 max-w-2xl mb-10 leading-relaxed">
            Tinggalkan pekerjaan manual yang membosankan. Kami merancang alur kerja otomatis menggunakan N8N untuk menghemat waktu, menekan biaya, dan menghilangkan *human error*.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/form">
              <Button size="lg" className="h-14 px-8 text-base bg-blue-600 hover:bg-blue-700 text-white rounded-full font-semibold shadow-[0_0_30px_rgba(37,99,235,0.4)] transition-all hover:scale-105 w-full sm:w-auto">
                Konsultasi Gratis <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <a href="#fitur">
              <Button size="lg" variant="outline" className="h-14 px-8 text-base bg-transparent border-white/20 text-white hover:bg-white/5 rounded-full font-semibold w-full sm:w-auto">
                Pelajari Lebih Lanjut
              </Button>
            </a>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="fitur" className="py-24 relative border-t border-white/5 bg-white/[0.02]">
        <div className="container mx-auto px-6 md:px-12">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Mengapa Memilih Automasi N8N?</h2>
            <p className="text-white/60 text-lg">Solusi *workflow automation* yang fleksibel, aman, dan dapat diintegrasikan dengan ratusan aplikasi bisnis Anda.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Zap, title: "Efisiensi Super Cepat", desc: "Selesaikan tugas dalam hitungan detik yang sebelumnya memakan waktu berjam-jam." },
              { icon: ShieldCheck, title: "Nol Human Error", desc: "Automasi memastikan setiap proses berjalan akurat secara konsisten setiap saat." },
              { icon: Workflow, title: "Integrasi 500+ Aplikasi", desc: "Hubungkan CRM, Email, Database, hingga WhatsApp API dalam satu alur kerja." },
            ].map((f, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors backdrop-blur-sm group"
              >
                <div className="w-14 h-14 rounded-xl bg-blue-500/10 flex items-center justify-center mb-6 text-blue-400 group-hover:scale-110 group-hover:bg-blue-500/20 transition-all">
                  <f.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                <p className="text-white/60 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="cara-kerja" className="py-24 relative">
        <div className="container mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row items-center gap-16">
            <div className="flex-1 space-y-8">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Bagaimana Cara Kerjanya?</h2>
                <p className="text-white/60 text-lg">Kami menempuh pendekatan yang terstruktur untuk memastikan automasi berjalan sempurna.</p>
              </div>
              
              <div className="space-y-6">
                {[
                  { step: "01", title: "Analisis Kebutuhan", desc: "Kami mengidentifikasi proses bisnis Anda yang berulang dan memakan waktu." },
                  { step: "02", title: "Desain Workflow (N8N)", desc: "Merancang logika automasi menggunakan N8N untuk menghubungkan aplikasi Anda." },
                  { step: "03", title: "Testing & Deployment", desc: "Menguji skenario secara menyeluruh sebelum diaktifkan secara live." },
                ].map((s, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="shrink-0 w-12 h-12 rounded-full border border-white/20 flex items-center justify-center text-lg font-bold text-blue-400 bg-white/5">
                      {s.step}
                    </div>
                    <div>
                      <h4 className="text-xl font-bold mb-1">{s.title}</h4>
                      <p className="text-white/60">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex-1 w-full max-w-lg">
              <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-white/5 p-6 backdrop-blur-md shadow-2xl">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500" />
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                
                {/* Mock Workflow UI */}
                <div className="flex flex-col items-center gap-4 py-8">
                  <div className="w-full h-16 rounded-lg bg-white/10 flex items-center px-4 border border-white/5">
                    <Bot className="text-white/50 mr-3 w-6 h-6" /> <span className="text-sm font-mono text-white/80">Webhook Triggered</span>
                  </div>
                  <div className="w-1 h-8 bg-blue-500/50" />
                  <div className="w-full h-16 rounded-lg bg-blue-500/20 flex items-center px-4 border border-blue-500/30">
                    <BarChart3 className="text-blue-400 mr-3 w-6 h-6" /> <span className="text-sm font-mono text-blue-200">Process Data (N8N)</span>
                  </div>
                  <div className="w-1 h-8 bg-blue-500/50" />
                  <div className="w-full h-16 rounded-lg bg-white/10 flex items-center px-4 border border-white/5">
                    <Clock className="text-white/50 mr-3 w-6 h-6" /> <span className="text-sm font-mono text-white/80">Save to Database & Alert</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#050505] pt-16 pb-8">
        <div className="container mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col items-center md:items-start gap-2">
            <img src="/LogoMain.png" alt="Skyflow Logo" className="h-8 w-auto object-contain brightness-0 invert" />
            <p className="text-white/50 text-sm mt-2 text-center md:text-left max-w-xs">
              Menghadirkan solusi automasi cerdas untuk efisiensi bisnis tanpa batas.
            </p>
          </div>
          
          <div className="flex items-center gap-6 text-sm font-medium text-white/60">
            <Link to="/form" className="hover:text-white transition-colors">Form Ketertarikan</Link>
            <Link to="/feedback" className="hover:text-white transition-colors">Feedback & Pengaduan</Link>
          </div>
        </div>
        
        <div className="container mx-auto px-6 md:px-12 mt-12 pt-8 border-t border-white/5 text-center text-white/40 text-sm">
          &copy; {new Date().getFullYear()} Skyflow.id - Hak Cipta Dilindungi.
        </div>
      </footer>
    </div>
  );
}
