import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { getProjects, createProject, updateProject, deleteProject, type Project } from "@/services/project-service";
import { createRevision, updateRevision, deleteRevision, type Revision } from "@/services/revision-service";
import { getClientTable } from "@/services/client-service";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, GripVertical, ClipboardList, CheckSquare, Square, Trash } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogClose,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogPopup,
  AlertDialogTitle,
  AlertDialogTrigger as AlertDialogTriggerBtn,
} from "@/components/ui/alert-dialog";
import { toastManager } from "@/components/ui/toast";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  defaultDropAnimationSideEffects,
} from '@dnd-kit/core';
import type { DragStartEvent, DragEndEvent, DragOverEvent } from '@dnd-kit/core';
import { useSortable, SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const COLUMNS = [
  { id: "Discuss", label: "Discuss", color: "bg-gray-500/10 border-gray-500/20 text-gray-500" },
  { id: "Waiting", label: "Waiting", color: "bg-yellow-500/10 border-yellow-500/20 text-yellow-500" },
  { id: "On Process", label: "On Process", color: "bg-blue-500/10 border-blue-500/20 text-blue-500" },
  { id: "100% Done", label: "100% Done", color: "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" },
  { id: "Maintenance", label: "Maintenance", color: "bg-purple-500/10 border-purple-500/20 text-purple-500" },
];

function RevisionManager({ project, onUpdate }: { project: Project, onUpdate: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const revisions = project.revisions || [];
  const maxRevisions = project.maxRevisions || 0;
  const revisionsCount = revisions.length;
  const canAdd = revisionsCount < maxRevisions;

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canAdd) return;
    setIsSubmitting(true);
    try {
      await createRevision({
        title: newTitle,
        description: newDesc,
        projectId: project.id,
      });
      setNewTitle("");
      setNewDesc("");
      onUpdate();
    } catch (error) {
      toastManager.error({ title: "Gagal", description: "Gagal menambah revisi." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggle = async (revision: Revision) => {
    try {
      await updateRevision(revision.id, { isDone: !revision.isDone });
      onUpdate();
    } catch (error) {
      toastManager.error({ title: "Gagal", description: "Gagal update status revisi." });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteRevision(id);
      onUpdate();
    } catch (error) {
      toastManager.error({ title: "Gagal", description: "Gagal menghapus revisi." });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button 
          onPointerDown={(e) => e.stopPropagation()}
          className="flex items-center gap-1.5 text-xs font-medium px-2 py-1 bg-amber-500/10 text-amber-600 rounded-md hover:bg-amber-500/20 transition-colors"
        >
          <ClipboardList className="h-3 w-3" />
          Revisi ({revisionsCount}/{maxRevisions})
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Manajemen Revisi - {project.name}</DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Kuota Revisi: {revisionsCount} / {maxRevisions} terpakai
          </p>
        </DialogHeader>
        
        <div className="flex flex-col gap-4 mt-2">
          {revisions.length === 0 ? (
            <div className="text-sm text-center py-4 text-muted-foreground border border-dashed rounded-lg">
              Belum ada revisi yang dicatat.
            </div>
          ) : (
            <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-1">
              {revisions.map((rev: Revision) => (
                <div key={rev.id} className="flex items-start gap-3 p-3 border rounded-lg bg-card">
                  <button onClick={() => handleToggle(rev)} className="mt-0.5 shrink-0 text-primary">
                    {rev.isDone ? <CheckSquare className="h-5 w-5" /> : <Square className="h-5 w-5 opacity-50" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <h4 className={`text-sm font-semibold ${rev.isDone ? 'line-through opacity-50' : ''}`}>{rev.title}</h4>
                    {rev.description && <p className={`text-xs text-muted-foreground mt-1 ${rev.isDone ? 'opacity-50' : ''}`}>{rev.description}</p>}
                  </div>
                  <button onClick={() => handleDelete(rev.id)} className="shrink-0 text-red-500/70 hover:text-red-500 p-1">
                    <Trash className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
          
          <div className="border-t pt-4">
            <h4 className="text-sm font-semibold mb-3">Tambah Revisi Baru</h4>
            {canAdd ? (
              <form onSubmit={handleAdd} className="flex flex-col gap-3">
                <input 
                  required
                  placeholder="Judul Revisi (contoh: Ganti Warna Header)" 
                  className="w-full text-sm p-2 border rounded-md"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
                <textarea 
                  placeholder="Deskripsi detail (opsional)" 
                  className="w-full text-sm p-2 border rounded-md resize-none h-20"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                />
                <Button type="submit" disabled={isSubmitting} size="sm" className="w-full">
                  {isSubmitting ? "Menambahkan..." : "Tambah Revisi"}
                </Button>
              </form>
            ) : (
              <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-200">
                Batas maksimal revisi ({maxRevisions}) telah tercapai. Anda tidak dapat menambahkan revisi baru untuk proyek ini.
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SortableProjectCard({ project, handleDelete, handleProgressChange, formatRupiah, loadData }: { project: Project, handleDelete: (id: string) => void, handleProgressChange: (id: string, progress: number) => void, formatRupiah: (v: string) => string, loadData: () => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: project.id, data: { type: "Project", project } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="touch-none outline-none">
      <Card className={`shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing ${isDragging ? 'border-primary ring-1 ring-primary' : ''}`}>
        <CardContent className="p-4 flex flex-col gap-3">
          <div className="flex justify-between items-start gap-2">
            <h3 className="font-bold text-base leading-tight flex items-center gap-2">
              <GripVertical className="h-4 w-4 text-muted-foreground" />
              {project.name}
            </h3>
            <AlertDialog>
              <AlertDialogTriggerBtn render={
                <button 
                  onPointerDown={(e) => e.stopPropagation()}
                  className="text-red-500 hover:bg-red-500/10 p-1.5 rounded-md transition-colors shrink-0"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              } />
              <AlertDialogPopup>
                <AlertDialogHeader>
                  <AlertDialogTitle>Hapus project ini?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tindakan ini tidak bisa dibatalkan. Data project akan dihapus secara permanen.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogClose render={<Button variant="ghost" />}>Batal</AlertDialogClose>
                  <AlertDialogClose render={<Button variant="destructive" onClick={() => handleDelete(project.id)} />}>
                    Hapus Project
                  </AlertDialogClose>
                </AlertDialogFooter>
              </AlertDialogPopup>
            </AlertDialog>
          </div>
          
          <div className="flex flex-col gap-1 text-sm pl-6">
            <span className="text-text/70 text-xs">Klien:</span>
            <span className="font-medium">{project.client?.name || 'Klien tidak ditemukan'}</span>
          </div>
          
          <div className="flex flex-col gap-1 text-sm pl-6">
            <span className="text-text/70 text-xs">Harga:</span>
            <span className="font-bold text-primary">{formatRupiah(project.price)}</span>
          </div>

          <div className="pl-6 mt-1 flex items-center gap-2">
            <RevisionManager project={project} onUpdate={loadData} />
          </div>

          <div className="flex flex-col gap-1 text-sm pl-6 mt-2">
            <span className="text-text/70 text-xs flex justify-between">
              <span>Progres ({project.progressPercentage || 0}%)</span>
              {!["On Process", "100% Done", "Maintenance"].includes(project.status) && <span className="text-red-500/70 text-[10px]">Terkunci</span>}
            </span>
            <input 
              type="range" 
              min="0" max="100" 
              value={project.progressPercentage || 0} 
              disabled={!["On Process", "100% Done", "Maintenance"].includes(project.status)}
              onChange={(e) => handleProgressChange(project.id, parseInt(e.target.value))}
              onPointerDown={(e) => e.stopPropagation()}
              className={`w-full ${!["On Process", "100% Done", "Maintenance"].includes(project.status) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function KanbanColumn({ col, projects, handleDelete, handleProgressChange, formatRupiah, loadData }: any) {
  const { setNodeRef, isOver } = useSortable({
    id: col.id,
    data: {
      type: "Column",
      col,
    },
  });

  return (
    <div 
      ref={setNodeRef}
      className={`flex flex-col gap-3 p-3 sm:p-4 rounded-xl border transition-colors h-full shrink-0 w-[85vw] sm:w-[300px] snap-center sm:snap-align-none ${isOver ? 'bg-muted/50 border-primary/50' : 'bg-muted/30'}`}
    >
      <div className={`px-3 py-1.5 rounded-md border font-semibold text-sm ${col.color} w-fit`}>
        {col.label} ({projects.length})
      </div>
      
      <div className="flex flex-col gap-3 min-h-[200px]">
        <SortableContext items={projects.map((p: any) => p.id)} strategy={verticalListSortingStrategy}>
          {projects.map((project: any) => (
            <SortableProjectCard 
              key={project.id} 
              project={project} 
              handleDelete={handleDelete} 
              handleProgressChange={handleProgressChange}
              formatRupiah={formatRupiah} 
              loadData={loadData}
            />
          ))}
        </SortableContext>
        
        {projects.length === 0 && (
          <div className={`text-sm text-center py-8 border-2 border-dashed rounded-lg transition-colors ${isOver ? 'border-primary text-primary' : 'border-border text-text/40'}`}>
            {isOver ? 'Lepas disini' : 'Kosong'}
          </div>
        )}
      </div>
    </div>
  );
}

export function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Drag and Drop State
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeProject, setActiveProject] = useState<Project | null>(null);

  // Form State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: "", price: "", clientId: "", status: "Discuss", maintenanceFee: "", maxRevisions: 3 });

  const loadData = async () => {
    setLoading(true);
    const [projs, cli] = await Promise.all([getProjects(), getClientTable()]);
    setProjects(projs);
    setClients(cli.rows);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor)
  );

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await createProject({ ...formData, maxRevisions: Number(formData.maxRevisions) });
      setIsDialogOpen(false);
      setFormData({ name: "", price: "", clientId: "", status: "Discuss", maintenanceFee: "", maxRevisions: 3 });
      await loadData();
      toastManager.success({ title: "Berhasil", description: "Project berhasil dibuat." });
    } catch (error) {
      console.error(error);
      toastManager.error({ title: "Gagal", description: "Gagal membuat project." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const { id } = active;
    setActiveId(id as string);
    
    const project = projects.find(p => p.id === id);
    if (project) {
      setActiveProject(project);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveProject = active.data.current?.type === "Project";
    const isOverProject = over.data.current?.type === "Project";
    const isOverColumn = over.data.current?.type === "Column";

    if (!isActiveProject) return;

    if (isActiveProject && isOverColumn) {
      setProjects((projects) => {
        const activeIndex = projects.findIndex((p) => p.id === activeId);
        
        if (projects[activeIndex].status !== overId) {
          const newProjects = [...projects];
          newProjects[activeIndex].status = overId as string;
          return newProjects;
        }
        return projects;
      });
    } else if (isActiveProject && isOverProject) {
      const overProject = projects.find((p) => p.id === overId);
      if (!overProject) return;
      
      const overColumnId = overProject.status;

      setProjects((projects) => {
        const activeIndex = projects.findIndex((p) => p.id === activeId);
        const overIndex = projects.findIndex((p) => p.id === overId);

        if (projects[activeIndex].status !== overColumnId) {
          const newProjects = [...projects];
          newProjects[activeIndex].status = overColumnId;
          return arrayMove(newProjects, activeIndex, overIndex);
        }
        
        return arrayMove(projects, activeIndex, overIndex);
      });
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveId(null);
    setActiveProject(null);
    
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    const isOverColumn = over.data.current?.type === "Column";
    const isOverProject = over.data.current?.type === "Project";

    let nextStatus: string | null = null;

    if (isOverColumn) {
      nextStatus = overId as string;
    } else if (isOverProject) {
      const overProject = projects.find(p => p.id === overId);
      if (overProject) {
        nextStatus = overProject.status;
      }
    }

    const activeProjectFinal = projects.find(p => p.id === activeId);

    if (activeProjectFinal && nextStatus) {
      try {
        await updateProject(activeProjectFinal.id, { status: nextStatus });
        toastManager.success({ title: "Berhasil", description: `Project dipindahkan ke ${COLUMNS.find(c => c.id === nextStatus)?.label}.` });
      } catch (error) {
        console.error(error);
        toastManager.error({ title: "Gagal", description: "Gagal memindahkan project." });
        await loadData();
      }
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProject(id);
      await loadData();
      toastManager.success({ title: "Berhasil", description: "Project telah dihapus." });
    } catch (error) {
      console.error(error);
      toastManager.error({ title: "Gagal", description: "Gagal menghapus project." });
    }
  };

  const handleProgressChange = async (id: string, progressPercentage: number) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, progressPercentage } : p));
    try {
      await updateProject(id, { progressPercentage });
    } catch (error) {
      toastManager.error({ title: "Gagal", description: "Gagal memperbarui progres." });
      loadData();
    }
  };

  const formatRupiah = (numStr: string) => {
    const num = parseInt(numStr.replace(/\D/g, ""), 10) || 0;
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(num);
  };

  return (
    <AppLayout title="Projects Dashboard">
      <div className="flex flex-col gap-6 w-full max-w-full overflow-hidden">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold font-heading">Kanban Board</h1>
            <p className="text-text/60">Kelola dan pantau progres proyek aktif.</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4" />
                Tambah Project
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] sm:max-w-[500px] max-h-[90dvh] overflow-hidden p-0 gap-0 flex flex-col">
              <DialogHeader className="border-b p-4 sm:p-6 pb-4 shrink-0">
                <DialogTitle>Buat Project Baru</DialogTitle>
                <p className="text-sm text-text/60 mt-1">
                  Masukkan detail project dan pilih klien yang terkait.
                </p>
              </DialogHeader>
              <form onSubmit={handleCreate} className="flex flex-col flex-1 overflow-hidden">
                <div className="p-4 sm:p-6 flex flex-col gap-4 flex-1 overflow-y-auto">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-text/80">Nama Project</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none focus:border-primary transition-colors"
                      placeholder="Contoh: Pembuatan Website E-Commerce"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-text/80">Klien</label>
                    <select
                      required
                      value={formData.clientId}
                      onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                      className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none focus:border-primary transition-colors"
                    >
                      <option value="" className="text-slate-900 bg-white">-- Pilih Klien --</option>
                      {clients.map(c => (
                        <option key={c.id} value={c.id} className="text-slate-900 bg-white">{c.cells.name} {c.cells.phone ? `(${c.cells.phone})` : ""}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-text/80">Harga Project (Rp)</label>
                    <input
                      type="text"
                      required
                      value={formData.price ? new Intl.NumberFormat('id-ID').format(Number(formData.price)) : ""}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value.replace(/\D/g, '') })}
                      className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none focus:border-primary transition-colors"
                      placeholder="Contoh: 15.000.000"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-text/80">Biaya Maintenance / Bulan (Opsional)</label>
                    <input
                      type="text"
                      value={formData.maintenanceFee ? new Intl.NumberFormat('id-ID').format(Number(formData.maintenanceFee)) : ""}
                      onChange={(e) => setFormData({ ...formData, maintenanceFee: e.target.value.replace(/\D/g, '') })}
                      className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none focus:border-primary transition-colors"
                      placeholder="Contoh: 500.000"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-text/80">Maksimal Revisi</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formData.maxRevisions}
                      onChange={(e) => setFormData({ ...formData, maxRevisions: parseInt(e.target.value) || 0 })}
                      className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none focus:border-primary transition-colors"
                    />
                  </div>
                </div>
                <div className="border-t p-4 sm:px-6 bg-muted/10 flex justify-end gap-2 shrink-0">
                  <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>
                    Batal
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Menyimpan..." : "Simpan Project"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="py-12 text-center text-text/50">Memuat projects...</div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            <div className="flex flex-nowrap overflow-x-auto gap-4 items-start w-full pb-6 snap-x snap-mandatory sm:snap-none">
              {COLUMNS.map((col) => {
                const colProjects = projects.filter(p => p.status === col.id);
                return (
                  <KanbanColumn 
                    key={col.id} 
                    col={col} 
                    projects={colProjects} 
                    handleDelete={handleDelete} 
                    handleProgressChange={handleProgressChange}
                    formatRupiah={formatRupiah} 
                    loadData={loadData}
                  />
                );
              })}
            </div>
            
            <DragOverlay dropAnimation={{
              sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: "0.5" } } }),
            }}>
              {activeId && activeProject ? (
                <Card className="shadow-lg border-primary ring-1 ring-primary cursor-grabbing opacity-80">
                  <CardContent className="p-4 flex flex-col gap-3">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-bold text-base leading-tight flex items-center gap-2">
                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                        {activeProject.name}
                      </h3>
                      <button className="text-red-500/50 p-1.5 rounded-md shrink-0 cursor-not-allowed">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="flex flex-col gap-1 text-sm pl-6">
                      <span className="text-text/70 text-xs">Klien:</span>
                      <span className="font-medium">{activeProject.client?.name || 'Klien tidak ditemukan'}</span>
                    </div>
                    <div className="flex flex-col gap-1 text-sm pl-6">
                      <span className="text-text/70 text-xs">Harga:</span>
                      <span className="font-bold text-primary">{formatRupiah(activeProject.price)}</span>
                    </div>
                  </CardContent>
                </Card>
              ) : null}
            </DragOverlay>
          </DndContext>
        )}
      </div>
    </AppLayout>
  );
}
