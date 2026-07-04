import { useState, useEffect } from "react";
import { formService } from "@/services/form-service";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, ArrowRight, ArrowLeft, Phone, ChevronDown, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Popover, PopoverTrigger } from "@/components/ui/popover";
import {
  AlertDialog,
  AlertDialogPopup,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import * as React from "react";

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
)

const TelegramIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.892-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
  </svg>
)

const toTitleCase = (str: string) => {
  return str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

const LocalPopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = "center", sideOffset = 4, ...props }, ref) => (
  <PopoverPrimitive.Content
    ref={ref}
    align={align}
    sideOffset={sideOffset}
    className={className}
    {...props}
  />
));
LocalPopoverContent.displayName = "LocalPopoverContent";

const SearchableSelect = ({ 
  value, onChange, options, placeholder, disabled, error, hideSearch 
}: { 
  value: string; onChange: (id: string, name: string) => void; options: {id: string, name: string}[]; placeholder: string; disabled?: boolean; error?: boolean; hideSearch?: boolean;
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const selected = options.find(o => o.id === value);
  const filtered = options.filter(o => o.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={`w-full flex items-center justify-between rounded-md border bg-transparent px-3 py-2 text-[15px] outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${error ? 'border-red-500 focus:border-red-500' : 'border-border focus:border-primary'}`}
        >
          <span className={selected ? 'text-text' : 'text-muted-foreground line-clamp-1 text-left'}>{selected ? toTitleCase(selected.name) : placeholder}</span>
          <ChevronDown className="w-4 h-4 opacity-50 shrink-0" />
        </button>
      </PopoverTrigger>
      <LocalPopoverContent 
        className="z-50 p-0 w-[var(--radix-popover-trigger-width)] rounded-md border bg-card text-text shadow-lg outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95" 
        align="start"
        sideOffset={4}
      >
        <div className="flex flex-col">
          {!hideSearch && (
            <div className="flex items-center px-3 border-b border-border">
              <Search className="w-4 h-4 text-muted-foreground mr-2 shrink-0" />
              <input 
                type="text" className="w-full bg-transparent outline-none text-[15px] py-2" 
                placeholder="Cari..." value={search} onChange={e => setSearch(e.target.value)} 
              />
            </div>
          )}
          <div className="max-h-60 overflow-y-auto p-1">
            {filtered.length === 0 && <div className="p-3 text-sm text-center text-muted-foreground">Tidak ditemukan.</div>}
            {filtered.map(opt => (
              <div 
                key={opt.id} 
                className={`px-3 py-2 text-[15px] cursor-pointer rounded-sm hover:bg-muted ${opt.id === value ? 'bg-primary/10 text-primary font-medium' : 'text-text'}`}
                onClick={() => { onChange(opt.id, opt.name); setOpen(false); setSearch(""); }}
              >
                {toTitleCase(opt.name)}
              </div>
            ))}
          </div>
        </div>
      </LocalPopoverContent>
    </Popover>
  );
};

export function PublicFormPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [step, setStep] = useState(1);

  // Form State
  const [name, setName] = useState("");
  const [provinceId, setProvinceId] = useState("");
  const [provinceName, setProvinceName] = useState("");
  const [cityId, setCityId] = useState("");
  const [cityName, setCityName] = useState("");
  const [districtId, setDistrictId] = useState("");
  const [districtName, setDistrictName] = useState("");
  const [fullAddress, setFullAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [needsClass, setNeedsClass] = useState("");
  const [interestLevel, setInterestLevel] = useState("");
  const [joinCommunity, setJoinCommunity] = useState<string>("");
  const [communityChannel, setCommunityChannel] = useState("");
  const [gender, setGender] = useState("");
  const [age, setAge] = useState("");

  // Location Data State
  const [provinces, setProvinces] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);

  useEffect(() => {
    fetch("https://www.emsifa.com/api-wilayah-indonesia/api/provinces.json")
      .then((res) => res.json())
      .then((data) => setProvinces(data))
      .catch(() => {});
  }, []);

  const handleProvinceChange = (selectedId: string, selectedName: string) => {
    setProvinceId(selectedId);
    setProvinceName(selectedName);
    setCityId(""); setCityName("");
    setDistrictId(""); setDistrictName("");
    setDistricts([]);

    if (showErrors) setShowErrors(false);

    if (selectedId) {
      fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/regencies/${selectedId}.json`)
        .then((res) => res.json())
        .then((data) => setCities(data));
    } else setCities([]);
  };

  const handleCityChange = (selectedId: string, selectedName: string) => {
    setCityId(selectedId);
    setCityName(selectedName);
    setDistrictId(""); setDistrictName("");

    if (showErrors) setShowErrors(false);

    if (selectedId) {
      fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/districts/${selectedId}.json`)
        .then((res) => res.json())
        .then((data) => setDistricts(data));
    } else setDistricts([]);
  };

  const handleDistrictChange = (selectedId: string, selectedName: string) => {
    setDistrictId(selectedId);
    setDistrictName(selectedName);
    if (showErrors) setShowErrors(false);
  };

  const validateStep = () => {
    let isValid = true;
    if (step === 1) {
      if (!name || !phone) {
        toast.error("Nama dan No HP wajib diisi!");
        isValid = false;
      }
    } else if (step === 2) {
      if (!provinceId || !cityId || !districtId || !fullAddress) {
        toast.error("Mohon lengkapi seluruh data alamat!");
        isValid = false;
      }
    } else if (step === 3) {
      if (!needsClass || !joinCommunity) {
        toast.error("Mohon pilih preferensi Anda!");
        isValid = false;
      } else if ((needsClass === "Ya" || needsClass === "Tidak, ebook saja") && !interestLevel) {
        toast.error("Mohon pilih tingkat ketertarikan Anda!");
        isValid = false;
      } else if (joinCommunity === "Ya" && !communityChannel) {
        toast.error("Mohon pilih channel komunitas!");
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
      await formService.submitForm({
        name, province: provinceName, city: cityName, district: districtName,
        fullAddress, phone, needsClass, 
        interestLevel: interestLevel || undefined,
        joinCommunity: joinCommunity === "Ya",
        communityChannel: communityChannel || undefined,
        gender: gender || undefined,
        age: age ? parseInt(age) : undefined,
      });
      setIsSuccess(true);
    } catch (error: any) {
      toast.error(error.message || "Terjadi kesalahan saat mengirim data.");
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      
      {/* Left Panel - Branding (Hidden on small screens, shown on md+) */}
      <div className="hidden md:flex w-1/3 lg:w-5/12 relative overflow-hidden bg-primary flex-col justify-between p-12 text-white shadow-2xl z-10">
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <img src="/LogoMain.png" alt="Skyflow Logo" className="w-64 max-w-full h-auto object-contain brightness-0 invert" />
          </div>
          
          <h1 className="text-5xl lg:text-6xl font-bold leading-tight mb-6 text-white drop-shadow-sm">
            Tertarik dengan <br/>
            <span className="text-white/80">
              Automisasi?
            </span>
          </h1>
          <p className="text-lg text-white/70 max-w-sm leading-relaxed">
            Isi survey dan mulai hasilkan uang bersama kami.
          </p>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex flex-col relative bg-background overflow-y-auto">
        <div className="flex-1 flex flex-col justify-center p-6 sm:p-12 lg:p-20">
        
        {/* Mobile Header (Hidden on md+) */}
        <div className="md:hidden flex items-center justify-between mb-8">
          <img src="/LogoMain.png" alt="Skyflow Logo" className="h-8 w-auto object-contain" />
          <div className="text-sm font-semibold text-text/50">Langkah {step} dari 3</div>
        </div>

        {/* Mobile Progress Bar (Hidden on md+) */}
        <div className="md:hidden w-full h-2 bg-muted rounded-full mb-10 overflow-hidden">
          <motion.div 
            className="h-full bg-primary"
            initial={{ width: `${((step - 1) / 3) * 100}%` }}
            animate={{ width: `${(step / 3) * 100}%` }}
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
                    <p className="text-sm text-text/60">Mari mulai dengan mengenal Anda lebih dekat.</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[15px] font-semibold text-text/80">Nama Lengkap <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        value={name} onChange={(e) => { setName(e.target.value); if(showErrors) setShowErrors(false); }}
                        className={`w-full rounded-md border bg-transparent px-3 py-2 text-[15px] outline-none transition-colors placeholder:text-muted-foreground ${showErrors && !name ? 'border-red-500 focus:border-red-500' : 'border-border focus:border-primary'}`}
                        placeholder="John Doe"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[15px] font-semibold text-text/80">No HP / WhatsApp <span className="text-red-500">*</span></label>
                      <div className={`flex items-center rounded-md border transition-colors bg-transparent px-3 py-2 ${showErrors && !phone ? 'border-red-500 focus-within:border-red-500' : 'border-border focus-within:border-primary'}`}>
                        <Phone className="w-4 h-4 text-text/40 mr-2" />
                        <input
                          type="tel"
                          value={phone} onChange={(e) => { setPhone(e.target.value); if(showErrors) setShowErrors(false); }}
                          className="w-full bg-transparent text-[15px] outline-none placeholder:text-muted-foreground"
                          placeholder="081234567890"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[15px] font-semibold text-text/80">Gender <span className="text-text/40 font-normal">(Opsional)</span></label>
                        <SearchableSelect
                          value={gender}
                          onChange={(id) => setGender(id)}
                          options={[{id: "Laki-laki", name: "Laki-laki"}, {id: "Perempuan", name: "Perempuan"}]}
                          placeholder="Pilih"
                          hideSearch
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[15px] font-semibold text-text/80">Usia <span className="text-text/40 font-normal">(Opsional)</span></label>
                        <input
                          type="number"
                          value={age}
                          min={15}
                          max={100}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === "") { setAge(""); return; }
                            const num = parseInt(val);
                            if (!isNaN(num)) {
                              if (num > 100) setAge("100");
                              else if (num < 0) setAge("");
                              else setAge(String(num));
                            }
                          }}
                          onBlur={(e) => {
                            const num = parseInt(e.target.value);
                            if (!isNaN(num) && num < 15) setAge("15");
                          }}
                          className={`w-full rounded-md border bg-transparent px-3 py-2 text-[15px] outline-none focus:border-primary transition-colors placeholder:text-muted-foreground ${age && (parseInt(age) < 15 || parseInt(age) > 100) ? 'border-red-400' : 'border-border'}`}
                          placeholder="25"
                        />
                        {age && parseInt(age) < 15 && (
                          <p className="text-xs text-red-400">Usia minimal 15 tahun</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2 */}
              {step === 2 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-text mb-1">Lokasi & Alamat</h2>
                    <p className="text-sm text-text/60">Dimana tempat anda tinggal?</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[15px] font-semibold text-text/80">Provinsi <span className="text-red-500">*</span></label>
                      <SearchableSelect 
                        value={provinceId} 
                        onChange={handleProvinceChange}
                        options={provinces}
                        placeholder="Pilih Provinsi"
                        error={showErrors && !provinceId}
                      />
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-[15px] font-semibold text-text/80">Kota / Kab <span className="text-red-500">*</span></label>
                        <SearchableSelect 
                          value={cityId} 
                          onChange={handleCityChange}
                          options={cities}
                          placeholder="Pilih Kota"
                          disabled={!provinceId}
                          error={showErrors && !cityId}
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[15px] font-semibold text-text/80">Kecamatan <span className="text-red-500">*</span></label>
                        <SearchableSelect 
                          value={districtId} 
                          onChange={handleDistrictChange}
                          options={districts}
                          placeholder="Pilih Kecamatan"
                          disabled={!cityId}
                          error={showErrors && !districtId}
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[15px] font-semibold text-text/80">Alamat Lengkap <span className="text-red-500">*</span></label>
                      <textarea
                        value={fullAddress} onChange={(e) => { setFullAddress(e.target.value); if(showErrors) setShowErrors(false); }}
                        rows={3}
                        className={`w-full rounded-md border bg-transparent px-3 py-2 text-[15px] outline-none transition-colors placeholder:text-muted-foreground resize-none ${showErrors && !fullAddress ? 'border-red-500 focus:border-red-500' : 'border-border focus:border-primary'}`}
                        placeholder="Nama jalan, gedung, RT/RW, Patokan..."
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3 */}
              {step === 3 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-text mb-1">Minat & Preferensi</h2>
                    <p className="text-sm text-text/60">Seberapa jauh ketertarikan Anda terhadap otomasi?</p>
                  </div>
                  
                  <div className="space-y-6">
                    
                    {/* Needs Class */}
                    <div className="space-y-3">
                      <label className="text-[15px] font-semibold text-text/80">Apakah Anda butuh bimbingan kelas atau materi tentang Otomasi? <span className="text-red-500">*</span></label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {[
                          { id: "Ya", label: "Ya, butuh kelas Otomasi" },
                          { id: "Tidak", label: "Tidak perlu sama sekali" },
                          { id: "Tidak, ebook saja", label: "Tidak, hanya Ebook Panduan" },
                          { id: "Tidak tertarik", label: "Tidak Tertarik" }
                        ].map((opt) => (
                          <div
                            key={opt.id}
                            onClick={() => { setNeedsClass(opt.id); setInterestLevel(""); if(showErrors) setShowErrors(false); }}
                            className={`cursor-pointer rounded-md border p-3 transition-all flex items-start gap-3 ${
                              needsClass === opt.id 
                                ? "border-primary bg-primary/5" 
                                : showErrors && !needsClass ? "border-red-500 bg-red-50 hover:border-red-600" : "border-border bg-transparent hover:border-border/80"
                            }`}
                          >
                            <div className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors ${needsClass === opt.id ? 'border-primary' : 'border-border'}`}>
                              {needsClass === opt.id && <motion.div layoutId="needsClass" className="w-2 h-2 rounded-full bg-primary" />}
                            </div>
                            <span className={`text-[15px] font-medium ${needsClass === opt.id ? 'text-primary' : 'text-text'}`}>{opt.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Interest Level */}
                    <AnimatePresence>
                      {(needsClass === "Ya" || needsClass === "Tidak, ebook saja") && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                          className="space-y-3 overflow-hidden"
                        >
                          <label className="text-[15px] font-semibold text-text/80">
                            Seberapa tertarik Anda untuk {needsClass === "Ya" ? "mengikuti Kelas Otomasi" : "membeli Ebook Panduan Otomasi"}? <span className="text-red-500">*</span>
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {["Sangat tertarik", "Minat", "Biasa saja", "Tidak tertarik"].map((opt) => (
                              <div
                                key={opt} onClick={() => { setInterestLevel(opt); if(showErrors) setShowErrors(false); }}
                                className={`cursor-pointer rounded-md border px-4 py-3 transition-all text-[15px] font-medium ${
                                  interestLevel === opt 
                                    ? "border-primary bg-primary text-white" 
                                    : showErrors && !interestLevel ? "border-red-500 bg-red-50 text-red-700" : "border-border bg-transparent text-text hover:bg-muted"
                                }`}
                              >
                                {opt}
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Community */}
                    <div className="space-y-3">
                      <label className="text-[15px] font-semibold text-text/80">Apakah Anda ingin bergabung ke komunitas Diskusi Otomasi Bisnis? <span className="text-red-500">*</span></label>
                      <div className="flex gap-3">
                        {["Ya", "Tidak"].map((opt) => (
                          <div
                            key={opt} onClick={() => { setJoinCommunity(opt); setCommunityChannel(""); if(showErrors) setShowErrors(false); }}
                            className={`cursor-pointer rounded-md border px-4 py-3 flex-1 transition-all flex items-center justify-center gap-2 ${
                              joinCommunity === opt 
                                ? "border-primary bg-primary/5 text-primary" 
                                : showErrors && !joinCommunity ? "border-red-500 bg-red-50" : "border-border bg-transparent text-text hover:border-border/80"
                            }`}
                          >
                            <span className="text-sm font-medium">{opt}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <AnimatePresence>
                      {joinCommunity === "Ya" && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                          className="space-y-3 overflow-hidden pt-1"
                        >
                          <label className="text-[15px] font-semibold text-text/80">Platform Pilihan <span className="text-red-500">*</span></label>
                          <div className="flex gap-3">
                            {["WhatsApp", "Telegram"].map((opt) => (
                              <div
                                key={opt} onClick={() => { setCommunityChannel(opt); if(showErrors) setShowErrors(false); }}
                                className={`cursor-pointer rounded-md border px-4 py-3 flex-1 transition-all flex items-center justify-center gap-2 ${
                                  communityChannel === opt 
                                    ? "border-primary bg-primary/5 text-primary" 
                                    : showErrors && !communityChannel ? "border-red-500 bg-red-50" : "border-border bg-transparent text-text hover:border-border/80"
                                }`}
                              >
                                {opt === "WhatsApp" ? <WhatsAppIcon className="w-5 h-5 text-[#25D366]" /> : <TelegramIcon className="w-5 h-5 text-[#229ED9]" />}
                                <span className="text-[15px] font-medium">{opt}</span>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="mt-8 flex items-center justify-between pt-6 border-t border-border">
            {step > 1 ? (
              <Button onClick={prevStep} variant="ghost" size="sm" className="gap-1.5 text-text/70 hover:text-text">
                <ArrowLeft className="w-4 h-4" /> Kembali
              </Button>
            ) : <div/>}

            {step < 3 ? (
              <Button onClick={nextStep} size="sm" className="gap-1.5 px-6 rounded-md">
                Selanjutnya <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button 
                onClick={handleSubmit} 
                disabled={isSubmitting}
                size="sm"
                className="gap-1.5 px-6 rounded-md"
              >
                {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Mengirim...</> : "Kirim Formulir"}
              </Button>
            )}
          </div>
        </div>
      </div>
      
      {/* Footer Logo */}
      <div className="py-6 flex justify-center opacity-40 pointer-events-none mt-auto">
        <img src="/LogoMain.png" alt="Skyflow Logo" className="h-6 w-auto object-contain" />
      </div>

      <AlertDialog open={isSuccess} onOpenChange={(open) => {
        if (!open) {
          setIsSuccess(false);
          window.location.reload();
        }
      }}>
        <AlertDialogPopup>
          <AlertDialogHeader>
            <AlertDialogTitle>Luar Biasa!</AlertDialogTitle>
            <AlertDialogDescription>
              Terimakasih sudah mengisi survey, data anda sudah di catat di sistem.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => window.location.reload()}>
              Tutup
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogPopup>
      </AlertDialog>
    </div>
  </div>
  );
}
