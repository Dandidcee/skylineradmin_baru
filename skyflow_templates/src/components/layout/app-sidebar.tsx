import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogClose,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogPopup,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  FileText,
  LayoutDashboard,
  Layers,
  Users,
  CalendarDays,
  ListTodo,
  Wallet,
  Shield,
  LogOut,
  ClipboardList,
  Wrench,
  Briefcase,
  UserCircle,
  Image as ImageIcon,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/clients", label: "List Client", icon: Users, end: false },
  { to: "/projects", label: "Projects", icon: LayoutDashboard, end: false },
  { to: "/solo-projects", label: "Project Solo", icon: Briefcase, end: false },
  { to: "/templates", label: "Template", icon: Layers, end: false },
  { to: "/documents", label: "Dokumen", icon: FileText, end: false },
  { to: "/payment", label: "Payment", icon: Wallet, end: false },
  { to: "/revisions", label: "Revisi", icon: ClipboardList, end: false },
  { to: "/maintenance", label: "Maintenance", icon: Wrench, end: false },
  { to: "/calendar", label: "Kalender", icon: CalendarDays, end: false },
  { to: "/activities", label: "Aktivitas", icon: ListTodo, end: false },
];

export function AppSidebar() {
  const [user, setUser] = useState<{id?: string, name: string, email: string, role?: string, permissions?: string[], photoUrl?: string} | null>(null);
  
  // Profile Modal State
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editPhotoUrl, setEditPhotoUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try { 
        const parsed = JSON.parse(userData);
        setUser(parsed); 
        setEditName(parsed.name || "");
        setEditPhotoUrl(parsed.photoUrl || "");
      } catch (error) { 
        // ignore parse error
      }
    }
  }, []);

  const handleSaveProfile = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: editName,
          password: editPassword || undefined,
          photoUrl: editPhotoUrl || undefined
        })
      });
      if (res.ok) {
        const updatedUser = await res.json();
        const mergedUser = { ...user, ...updatedUser };
        setUser(mergedUser);
        localStorage.setItem('user', JSON.stringify(mergedUser));
        setIsProfileOpen(false);
        setEditPassword("");
      } else {
        alert("Gagal mengupdate profil.");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setEditPhotoUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const isOwner = user?.role === 'OWNER' || user?.permissions?.includes('ALL');

  const filteredNavItems = NAV_ITEMS.filter(item => {
    if (isOwner) return true;
    
    const permissionMap: Record<string, string> = {
      "Dashboard": "DASHBOARD",
      "Dokumen": "DOKUMEN",
      "Template": "TEMPLATE",
      "Projects": "PROJECTS",
      "Project Solo": "PROJECTS",
      "List Client": "CLIENTS",
      "Payment": "PAYMENT",
      "Maintenance": "MAINTENANCE",
      "Revisi": "REVISI",
      "Kalender": "KALENDER",
      "Aktivitas": "AKTIVITAS",
    };
    
    const requiredPerm = permissionMap[item.label];
    return requiredPerm && user?.permissions?.includes(requiredPerm);
  });

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center justify-start px-2 pt-6 pb-0 h-12 mb-4">
          <img 
            src="/LogoMain.png" 
            alt="SkyFlow Logo" 
            className="h-16 w-auto max-w-none object-contain scale-[2.5] -ml-4 origin-left group-data-[collapsible=icon]:hidden" 
          />
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredNavItems.map(({ to, label, icon: Icon, end }) => (
                <SidebarMenuItem key={to}>
                  <NavLink to={to} end={end} className="block w-full">
                    {({ isActive }) => (
                      <SidebarMenuButton isActive={isActive} tooltip={label}>
                        <Icon className="h-4 w-4 shrink-0" />
                        <span className="text-base leading-none">{label}</span>
                      </SidebarMenuButton>
                    )}
                  </NavLink>
                </SidebarMenuItem>
              ))}
              
              {isOwner && (
                <SidebarMenuItem>
                  <NavLink to="/settings" className="block w-full">
                    {({ isActive }) => (
                      <SidebarMenuButton isActive={isActive} tooltip="Manajemen Tim">
                        <Shield className="h-4 w-4 shrink-0" />
                        <span className="text-base leading-none">Manajemen Tim</span>
                      </SidebarMenuButton>
                    )}
                  </NavLink>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <div className="mt-auto flex flex-col p-4 group-data-[collapsible=icon]:p-2 border-t border-white/10">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex cursor-pointer items-center gap-3 rounded-lg p-2 hover:bg-white/10 transition-colors group-data-[collapsible=icon]:justify-center">
              <Avatar className="h-10 w-10 shrink-0 shadow-sm ring-2 ring-white/10">
                <AvatarImage
                  alt={user?.name || 'Admin'}
                  src={user?.photoUrl || "https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?w=128&h=128&dpr=2&q=80"}
                />
            <AvatarFallback className="bg-white/20 text-white font-bold">
              {user?.name?.charAt(0)?.toUpperCase() || 'A'}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col overflow-hidden group-data-[collapsible=icon]:hidden">
            <span className="truncate text-sm font-semibold text-white">{user?.name || 'Super Admin'}</span>
              <span className="truncate text-xs text-blue-200">{user?.email || 'admin@skyflow.id'}</span>
            </div>
          </div>
          </DropdownMenuTrigger>
          
          <DropdownMenuContent align="end" className="w-56 bg-surface border-border">
            <DropdownMenuItem className="cursor-pointer" onClick={() => setIsProfileOpen(true)}>
              <UserCircle className="mr-2 h-4 w-4" />
              <span>Profil Saya</span>
            </DropdownMenuItem>
            
            {/* The Logout trigger */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem className="cursor-pointer text-red-400 focus:text-red-400" onSelect={(e) => e.preventDefault()}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Keluar</span>
                </DropdownMenuItem>
              </AlertDialogTrigger>
              <AlertDialogPopup>
                <AlertDialogHeader>
                  <AlertDialogTitle>Konfirmasi Logout</AlertDialogTitle>
                  <AlertDialogDescription>
                    Apakah Anda yakin ingin keluar dari panel admin SkyFlow?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogClose asChild>
                    <Button variant="ghost">Batal</Button>
                  </AlertDialogClose>
                  <Button variant="destructive" onClick={() => {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    window.location.href = '/login';
                  }}>
                    Keluar
                  </Button>
                </AlertDialogFooter>
              </AlertDialogPopup>
            </AlertDialog>
          </DropdownMenuContent>
        </DropdownMenu>

        <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
          <DialogContent className="sm:max-w-md bg-surface border-border text-text">
            <DialogHeader>
              <DialogTitle>Profil Saya</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4 py-4">
              <div className="flex flex-col items-center gap-2">
                <Avatar className="h-20 w-20 ring-2 ring-border">
                  <AvatarImage src={editPhotoUrl || "https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?w=128&h=128&dpr=2&q=80"} />
                  <AvatarFallback>{editName.charAt(0)}</AvatarFallback>
                </Avatar>
                <label className="cursor-pointer text-sm text-brand-blue hover:underline flex items-center gap-1 mt-1">
                  <ImageIcon className="h-4 w-4" />
                  Ubah Foto
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                </label>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Nama Lengkap</label>
                <input 
                  type="text" 
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Password Baru (Opsional)</label>
                <input 
                  type="password" 
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  placeholder="Kosongkan jika tidak diubah"
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setIsProfileOpen(false)}>Batal</Button>
              <Button className="bg-brand-blue text-white" onClick={handleSaveProfile} disabled={isSaving}>
                {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <SidebarRail />
    </Sidebar>
  );
}
