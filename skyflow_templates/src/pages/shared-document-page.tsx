import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FileText, CheckCircle2, Eraser, PenTool } from "lucide-react";
import { toast } from "sonner";

export function SharedDocumentPage() {
  const { id } = useParams<{ id: string }>();
  const [doc, setDoc] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [htmlContent, setHtmlContent] = useState<string>("");

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  useEffect(() => {
    if (!id) return;
    
    // Fetch directly to avoid any auth token interceptors (if they exist)
    const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
    fetch(`${baseUrl}/public/documents/${id}`)
      .then(res => {
        if (!res.ok) throw new Error("Dokumen tidak ditemukan atau terjadi kesalahan");
        return res.json();
      })
      .then(data => {
        setDoc(data);
        if (data.fileUrl && data.fileUrl.startsWith("data:text/html")) {
          const base64Data = data.fileUrl.split(",")[1];
          try {
            const decoded = decodeURIComponent(escape(atob(base64Data)));
            setHtmlContent(decoded);
          } catch (e) {
            console.error("Gagal mendecode HTML", e);
          }
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  // Canvas Drawing Logic
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.beginPath();
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#000";
    
    const rect = canvas.getBoundingClientRect();
    let x, y;
    
    if ('touches' in e) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }
    
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasSignature(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let x, y;
    
    if ('touches' in e) {
      // Prevent scrolling while drawing
      if(e.cancelable) e.preventDefault();
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }
    
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const submitSignature = async () => {
    if (!canvasRef.current || !hasSignature) {
      toast.error("Silakan berikan tanda tangan Anda terlebih dahulu.");
      return;
    }

    setSubmitting(true);
    try {
      const signatureDataUrl = canvasRef.current.toDataURL("image/png");
      
      const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
      const res = await fetch(`${baseUrl}/public/documents/${id}/sign`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ signature: signatureDataUrl })
      });
      
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Gagal menyimpan tanda tangan");
      }
      
      const updatedDoc = await res.json();
      setDoc(updatedDoc);
      toast.success("Tanda tangan berhasil disimpan!");
      
    } catch (error: any) {
      console.error(error);
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-12 w-12 bg-slate-200 rounded-full"></div>
          <p className="text-slate-500 font-medium">Memuat dokumen...</p>
        </div>
      </div>
    );
  }

  if (error || !doc) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full shadow-lg border-0 ring-1 ring-slate-200">
          <CardContent className="pt-6 flex flex-col items-center text-center gap-4">
            <div className="h-16 w-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-2">
              <FileText className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Dokumen Tidak Ditemukan</h2>
            <p className="text-slate-500">{error || "Tautan dokumen tidak valid atau dokumen telah dihapus."}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-8 px-4 sm:px-6 flex flex-col items-center font-sans">
      <div className="max-w-4xl w-full flex flex-col gap-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
              <FileText className="h-6 w-6 text-blue-600" />
              {doc.title}
            </h1>
            <p className="text-slate-500 mt-1">
              Untuk: <span className="font-semibold text-slate-700">{doc.client?.name || "Klien"}</span>
              {doc.project && <span> &bull; Project: {doc.project.name}</span>}
            </p>
          </div>
          
          {doc.clientSignature ? (
            <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full flex items-center gap-2 font-medium text-sm border border-emerald-200">
              <CheckCircle2 className="h-4 w-4" />
              Sudah Ditandatangani
            </div>
          ) : (
            <div className="bg-amber-50 text-amber-700 px-4 py-2 rounded-full flex items-center gap-2 font-medium text-sm border border-amber-200">
              <PenTool className="h-4 w-4" />
              Menunggu Tanda Tangan
            </div>
          )}
        </div>

        {/* Document Viewer */}
        <Card className="shadow-sm border-slate-200 overflow-hidden">
          <CardHeader className="bg-slate-50/80 border-b border-slate-100 pb-4">
            <CardTitle className="text-lg">Pratinjau Dokumen</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {htmlContent ? (
              <div className="w-full h-[60vh] md:h-[70vh] bg-white overflow-auto relative">
                <iframe 
                  srcDoc={htmlContent} 
                  title="Document Preview"
                  className="w-full h-full border-0"
                  sandbox="allow-same-origin allow-scripts"
                />
              </div>
            ) : doc.fileUrl ? (
              <div className="w-full h-[60vh] flex items-center justify-center bg-slate-100">
                <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center gap-2">
                  <FileText className="h-5 w-5" /> Buka Lampiran Dokumen
                </a>
              </div>
            ) : (
              <div className="w-full h-40 flex items-center justify-center text-slate-400 bg-slate-50">
                Preview dokumen tidak tersedia.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Signature Area */}
        <Card className="shadow-sm border-slate-200 overflow-hidden mt-4 mb-12">
          <CardHeader className="bg-slate-50/80 border-b border-slate-100 pb-4">
            <CardTitle className="text-lg">Tanda Tangan Klien</CardTitle>
            <CardDescription>
              {doc.clientSignature 
                ? "Dokumen ini telah disetujui dan ditandatangani." 
                : "Silakan gambar tanda tangan Anda pada kotak di bawah ini untuk menyetujui dokumen ini."}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {doc.clientSignature ? (
              <div className="flex flex-col items-center py-6">
                <img 
                  src={doc.clientSignature} 
                  alt="Tanda Tangan Klien" 
                  className="max-h-40 border-b border-slate-300 pb-2 mb-4"
                />
                <p className="text-sm font-medium text-slate-600">Disetujui oleh {doc.client?.name}</p>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="relative border-2 border-dashed border-slate-300 rounded-xl bg-white w-full max-w-lg touch-none overflow-hidden hover:border-slate-400 transition-colors">
                  <canvas
                    ref={canvasRef}
                    width={500}
                    height={200}
                    className="w-full h-full cursor-crosshair touch-none"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                  />
                  {!hasSignature && (
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-slate-300">
                      <span className="text-lg font-medium flex items-center gap-2">
                        <PenTool className="h-5 w-5" /> Gambar Tanda Tangan Disini
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-3 w-full max-w-lg mt-6">
                  <Button 
                    variant="outline" 
                    className="flex-1" 
                    onClick={clearSignature}
                    disabled={!hasSignature || submitting}
                  >
                    <Eraser className="h-4 w-4 mr-2" /> Hapus Ulang
                  </Button>
                  <Button 
                    className="flex-1" 
                    onClick={submitSignature}
                    disabled={!hasSignature || submitting}
                  >
                    {submitting ? "Menyimpan..." : (
                      <>
                        <CheckCircle2 className="h-4 w-4 mr-2" /> Simpan Tanda Tangan
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
