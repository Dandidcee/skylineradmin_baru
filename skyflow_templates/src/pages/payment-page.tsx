import { useMemo, useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { getProjects, type Project } from "@/services/project-service";
import { createFinance } from "@/services/finance-service";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Wallet, DollarSign, TrendingDown, Users, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const parseMoney = (str?: string) => {
  if (!str) return 0;
  const digits = str.replace(/\D/g, "");
  return digits ? parseInt(digits, 10) : 0;
};

const formatRupiah = (num: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(num);
};

export function PaymentPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getProjects();
      setProjects(data);
    } catch (err: any) {
      setError(err.message || "Gagal memuat data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const metrics = useMemo(() => {
    let totalProjectValue = 0;
    let totalPaid = 0;
    let totalMaintenanceValue = 0;
    let totalMaintenancePaid = 0;
    let totalDebt = 0;
    const unpaidClients: Array<{ name: string; project: string; debt: number; }> = [];

    projects.forEach((project) => {
      if (project.status === "cancel" || project.status === "canceled_by_skyflow") return;
      if (project.status === "Discuss") return;

      const projectValue = parseMoney(project.price);
      
      const projectFinances = project.finances || [];
      // HANYA hitung yang statusnya PAID (Uang masuk riil)
      const paidFinances = projectFinances.filter((f: any) => f.status === 'PAID');
      
      const isMaint = (t: string) => t === 'MAINTENANCE_PAYMENT' || t === 'RECURRING';
      const paidForProject = paidFinances.filter((f: any) => !isMaint(f.type)).reduce((acc: number, curr: any) => acc + (curr.amount || 0), 0);
      const paidMaintenance = paidFinances.filter((f: any) => isMaint(f.type)).reduce((acc: number, curr: any) => acc + (curr.amount || 0), 0);

      const maintenanceCosts = project.maintenanceCosts || [];
      const maintenanceValue = maintenanceCosts.reduce((acc: number, curr: any) => acc + (curr.amount || 0), 0);

      const projectRemaining = Math.max(0, projectValue - paidForProject);
      const maintenanceRemaining = Math.max(0, maintenanceValue - paidMaintenance);
      const actualRemaining = projectRemaining + maintenanceRemaining;

      totalProjectValue += projectValue;
      totalMaintenanceValue += maintenanceValue;
      totalPaid += paidForProject;
      totalMaintenancePaid += paidMaintenance;
      totalDebt += actualRemaining;

      if (actualRemaining > 0) {
        unpaidClients.push({
          name: project.client?.name || "Klien Tidak Diketahui",
          project: project.name,
          debt: actualRemaining,
        });
      }
    });

    return { totalProjectValue, totalMaintenanceValue, totalPaid, totalMaintenancePaid, totalDebt, unpaidClients };
  }, [projects]);

  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [paymentType, setPaymentType] = useState<"project" | "maintenance">("project");
  const [paymentAmount, setPaymentAmount] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const selectedProject = useMemo(() => {
    if (!selectedProjectId) return null;
    return projects.find((p) => p.id === selectedProjectId) || null;
  }, [projects, selectedProjectId]);

  const selectedProjectMetrics = useMemo(() => {
    if (!selectedProject) return { projectValue: 0, projectPaid: 0, maintValue: 0, maintPaid: 0 };
    
    const projectValue = parseMoney(selectedProject.price);
    const maintValue = (selectedProject.maintenanceCosts || []).reduce((acc: number, curr: any) => acc + (curr.amount || 0), 0);
    
    const paidFinances = (selectedProject.finances || []).filter((f: any) => f.status === 'PAID');
    const isMaint = (t: string) => t === 'MAINTENANCE_PAYMENT' || t === 'RECURRING';
    
    const projectPaid = paidFinances.filter((f: any) => !isMaint(f.type)).reduce((acc: number, curr: any) => acc + (curr.amount || 0), 0);
    const maintPaid = paidFinances.filter((f: any) => isMaint(f.type)).reduce((acc: number, curr: any) => acc + (curr.amount || 0), 0);
    
    return { projectValue, projectPaid, maintValue, maintPaid };
  }, [selectedProject]);

  useEffect(() => {
    if (paymentType === "maintenance") {
      setPaymentAmount("");
    }
  }, [paymentType, selectedProject]);

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject) return;
    
    setIsSubmitting(true);
    setSuccessMsg("");
    try {
      const amount = parseMoney(paymentAmount);
      
      // Buat record Finance baru bertipe PAYMENT_RECEIPT
      await createFinance({
        type: paymentType === "maintenance" ? 'MAINTENANCE_PAYMENT' : 'PAYMENT_RECEIPT',
        amount: amount,
        status: 'PAID',
        projectId: selectedProject.id,
        notes: paymentType === "maintenance" ? 'Pembayaran Maintenance Manual via Dashboard' : 'Pembayaran Proyek Manual via Dashboard'
      });
      
      setPaymentAmount("");
      toast.success("Pembayaran berhasil dicatat");
      loadData();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Gagal mencatat pembayaran");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <AppLayout title="Payment Dashboard">
        <div className="p-8 text-center text-text/50">Memuat data keuangan...</div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout title="Payment Dashboard">
        <div className="p-8 text-center text-red-500">{error}</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Payment Dashboard">
      <div className="flex flex-col gap-6 w-full max-w-full overflow-hidden">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold font-heading">Finance & Payments</h1>
            <p className="text-text/60">Pantau arus kas dan sisa tagihan dari proyek yang berjalan.</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Estimasi Proyek
              </CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold md:text-2xl">
                {formatRupiah(metrics.totalProjectValue)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Dari semua proyek aktif
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Kas Masuk (Proyek)
              </CardTitle>
              <DollarSign className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold md:text-2xl text-emerald-600 dark:text-emerald-400">
                {formatRupiah(metrics.totalPaid)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Pelunasan proyek utama
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Kas Masuk (Maintenance)
              </CardTitle>
              <DollarSign className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold md:text-2xl text-emerald-600 dark:text-emerald-400">
                {formatRupiah(metrics.totalMaintenancePaid)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Biaya langganan bulanan
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Piutang
              </CardTitle>
              <TrendingDown className="h-4 w-4 text-rose-500" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold md:text-2xl text-rose-600 dark:text-rose-400">
                {formatRupiah(metrics.totalDebt)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Tagihan belum dibayar
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Klien Menunggak
              </CardTitle>
              <Users className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold md:text-2xl text-orange-600 dark:text-orange-400">
                {metrics.unpaidClients.length} Proyek
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Perlu difollow-up pelunasan
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
          <div className="lg:col-span-2">
            {/* Finance Form */}
            <Card>
              <CardHeader>
                <CardTitle className="font-heading text-xl">Catat Pembayaran Manual</CardTitle>
                <CardDescription className="text-sm text-text/60">
                  Pilih Proyek dan catat uang masuk jika tidak membuat dokumen struk (Receipt) secara sistem.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRecordPayment} className="flex flex-col gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-text/80">Pilih Proyek</label>
                    <select
                      value={selectedProjectId}
                      onChange={(e) => {
                        setSelectedProjectId(e.target.value);
                        setSuccessMsg("");
                      }}
                      className="h-11 w-full rounded-md border border-input bg-transparent px-3 text-base outline-none focus:border-primary transition-colors"
                      required
                    >
                      <option value="" className="text-slate-900 bg-white">-- Pilih Proyek --</option>
                      {projects.map((proj) => {
                        if (proj.status === "cancel" || proj.status === "canceled_by_skyflow") return null;
                        return (
                          <option key={proj.id} value={proj.id} className="text-slate-900 bg-white">
                            {proj.name} ({proj.client?.name || 'Klien tidak diketahui'})
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-text/80">Tipe Pembayaran</label>
                    <select
                      value={paymentType}
                      onChange={(e) => setPaymentType(e.target.value as any)}
                      className="h-11 w-full rounded-md border border-input bg-transparent px-3 text-base outline-none focus:border-primary transition-colors"
                      required
                    >
                      <option value="project" className="text-slate-900 bg-white">Pelunasan Proyek Utama</option>
                      <option value="maintenance" className="text-slate-900 bg-white">Maintenance Bulanan</option>
                    </select>
                  </div>

                  {selectedProject && (
                    <div className="rounded-lg border bg-muted/10 p-5 shadow-sm">
                      <div className="grid gap-4 sm:grid-cols-3">
                        <div className="flex flex-col gap-1">
                          <p className="text-xs font-medium text-text/60">
                            {paymentType === 'maintenance' ? 'Total Tagihan Maintenance' : 'Nilai Proyek'}
                          </p>
                          <p className="font-bold text-lg">
                            {formatRupiah(paymentType === 'maintenance' ? selectedProjectMetrics.maintValue : selectedProjectMetrics.projectValue)}
                          </p>
                        </div>
                        <div className="flex flex-col gap-1">
                          <p className="text-xs font-medium text-text/60">Sudah Dibayar</p>
                          <p className="font-bold text-lg text-emerald-600">
                            {formatRupiah(paymentType === 'maintenance' ? selectedProjectMetrics.maintPaid : selectedProjectMetrics.projectPaid)}
                          </p>
                        </div>
                        <div className="flex flex-col gap-1">
                          <p className="text-xs font-medium text-text/60">Sisa Tagihan</p>
                          <p className="font-bold text-lg text-rose-600">
                            {formatRupiah(Math.max(0, (paymentType === 'maintenance' ? selectedProjectMetrics.maintValue : selectedProjectMetrics.projectValue) - (paymentType === 'maintenance' ? selectedProjectMetrics.maintPaid : selectedProjectMetrics.projectPaid)))}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedProject && (
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-semibold text-text/80">Nominal Pembayaran Masuk (Rp)</label>
                      <input
                        type="text"
                        value={paymentAmount ? new Intl.NumberFormat('id-ID').format(Number(paymentAmount)) : ""}
                        onChange={(e) => setPaymentAmount(e.target.value.replace(/\D/g, ''))}
                        placeholder="Contoh: 5.000.000"
                        className="h-11 w-full rounded-md border border-input bg-transparent px-3 text-base outline-none focus:border-primary transition-colors"
                        required
                      />
                      <p className="text-xs text-text/50">
                        Sisa tagihan akan otomatis berkurang sesuai dengan uang yang masuk.
                      </p>
                    </div>
                  )}

                  {successMsg && (
                     <div className="flex items-center gap-2 rounded-md bg-emerald-500/15 p-3 text-sm text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                      {successMsg}
                    </div>
                  )}

                  <Button type="submit" disabled={!selectedProject || !paymentAmount || isSubmitting} className="w-fit">
                    {isSubmitting ? "Menyimpan..." : "Simpan Uang Masuk"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="h-full max-h-[600px] flex flex-col">
              <CardHeader className="border-b bg-muted/5 pb-4">
                <CardTitle className="font-heading text-xl">Daftar Tagihan</CardTitle>
                <CardDescription className="text-sm text-text/60">
                  Proyek yang belum lunas.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0 flex-1 overflow-y-auto bg-background/50">
                <div className="flex flex-col divide-y divide-border/50">
                  {metrics.unpaidClients.length === 0 ? (
                    <div className="p-8 text-center text-sm text-text/50">
                      Semua tagihan sudah lunas 🎉
                    </div>
                  ) : (
                    metrics.unpaidClients.map((client, idx) => (
                      <div key={idx} className="p-5 flex flex-col gap-2 hover:bg-muted/30 transition-colors">
                        <div className="flex justify-between items-start gap-2">
                          <p className="font-semibold text-text/90 text-sm sm:text-base leading-tight">{client.name}</p>
                          <p className="font-bold text-rose-600 text-sm sm:text-base whitespace-nowrap">{formatRupiah(client.debt)}</p>
                        </div>
                        <div className="flex justify-between items-end">
                          <p className="text-xs text-text/50 font-medium tracking-wide">Proyek: {client.project}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
