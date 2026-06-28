import { useState, useEffect, useMemo } from "react";
import { Plus, Search, FileText, Bell, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./theme-toggle";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { TEMPLATES } from "@/components/documents/templates";
import { getProjects, type Project } from "@/services/project-service";

const formatRupiah = (num: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(num);
};

export function Header({ title }: { title: string }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    getProjects().then(setProjects).catch(console.error);
  }, []);

  const notifications = useMemo(() => {
    const notifs: any[] = [];
    const now = new Date();
    projects.forEach(p => {
      if (p.status === 'cancel' || p.status === 'canceled_by_skyflow') return;
      (p.maintenanceCosts || []).forEach((cost: any) => {
        if (cost.status !== 'ACTIVE') return;
        const dueDate = new Date(cost.nextDueDate);
        const diffTime = dueDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays <= 5) {
          notifs.push({
            id: cost.id,
            projectName: p.name,
            clientName: p.client?.name || 'Klien',
            costName: cost.name,
            amount: cost.amount,
            dueDate: dueDate,
            daysLeft: diffDays
          });
        }
      });
    });
    return notifs.sort((a, b) => a.daysLeft - b.daysLeft);
  }, [projects]);
  
  return (
    <header className="flex h-14 items-center justify-between gap-3 border-b bg-card px-4 sm:px-6">
      <div className="flex min-w-0 items-center gap-2">
        <SidebarTrigger className="-ml-1 shrink-0" />
        <h1 className="truncate font-heading text-xl font-bold">{title}</h1>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <div className="relative hidden sm:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text/40" />
          <input
            type="search"
            placeholder="Cari dokumen..."
            aria-label="Cari dokumen"
            className="h-9 w-56 rounded-md border bg-background pl-9 pr-3 text-base outline-none placeholder:text-text/40 focus-visible:ring-2 focus-visible:ring-primary"
          />
        </div>
        <ThemeToggle />
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Generate PDF</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Pilih Template</DialogTitle>
              <DialogDescription>
                Pilih template dokumen yang ingin Anda buat.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {TEMPLATES.map((tpl) => {
                const Icon = tpl.icon;
                return (
                  <button
                    key={tpl.id}
                    onClick={() => {
                      setOpen(false);
                      navigate(`/templates?t=${tpl.id}`);
                    }}
                    className="flex items-start gap-4 rounded-lg border bg-card p-4 text-left transition-all hover:border-primary hover:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/15 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="font-bold text-text">{tpl.label}</span>
                      <span className="text-sm text-text/60">
                        {tpl.description}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </DialogContent>
        </Dialog>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon" className="relative h-9 w-9 border-none bg-background hover:bg-muted">
              <Bell className="h-5 w-5 text-text/70" />
              {notifications.length > 0 && (
                <span className="absolute right-1 top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white shadow-sm ring-2 ring-background">
                  {notifications.length}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 p-0 overflow-hidden shadow-xl border-primary/10">
            <div className="bg-muted/30 border-b px-4 py-3 flex justify-between items-center">
              <h4 className="font-bold text-sm">Notifikasi Jatuh Tempo</h4>
              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-semibold">{notifications.length}</span>
            </div>
            <div className="max-h-[300px] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-sm text-text/50">
                  Tidak ada tagihan yang mendesak.
                </div>
              ) : (
                <div className="flex flex-col divide-y divide-border/40">
                  {notifications.map((n, i) => (
                    <div key={i} className="p-4 flex gap-3 hover:bg-muted/10 transition-colors">
                      <div className={`mt-0.5 shrink-0 rounded-full p-2 ${n.daysLeft < 0 ? 'bg-red-500/10 text-red-500' : 'bg-amber-500/10 text-amber-500'}`}>
                        <Clock className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold leading-tight text-text/90">
                          {n.costName}
                        </p>
                        <p className="text-xs text-text/60 mt-1 line-clamp-1">
                          {n.clientName} - {n.projectName}
                        </p>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-xs font-bold text-primary">{formatRupiah(n.amount)}</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wider ${n.daysLeft < 0 ? 'bg-red-500/10 text-red-600' : 'bg-amber-500/10 text-amber-600'}`}>
                            {n.daysLeft < 0 ? `Telat ${Math.abs(n.daysLeft)} Hari` : `H-${n.daysLeft}`}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {notifications.length > 0 && (
              <div className="border-t p-2">
                <Button variant="ghost" className="w-full text-xs h-8 text-primary" onClick={() => navigate('/payment')}>
                  Catat Pembayaran
                </Button>
              </div>
            )}
          </PopoverContent>
        </Popover>
      </div>
    </header>
  );
}
