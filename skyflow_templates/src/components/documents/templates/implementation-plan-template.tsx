import { useState } from "react";
import { useSignature, getTodayDate, getTodayLongDate } from "./use-signature";
import { generateDocument, createDocumentSnapshot } from "@/services/document-service";
import { toastManager } from "@/components/ui/toast";
import "./template.css";

type Task = {
  id: number;
  name: string;
  status: "pending" | "progress" | "done";
};

type Phase = {
  id: number;
  name: string;
  tasks: Task[];
};

const INITIAL_PHASES: Phase[] = [
  {
    id: 1,
    name: "Analisis & Perancangan Workflow",
    tasks: [
      { id: 101, name: "Pemetaan proses bisnis klien", status: "pending" },
      { id: 102, name: "Desain arsitektur automasi N8N", status: "pending" },
      { id: 103, name: "Identifikasi API dan sistem pihak ketiga", status: "pending" },
    ],
  },
  {
    id: 2,
    name: "Pengembangan & Integrasi N8N",
    tasks: [
      { id: 201, name: "Setup server & environment N8N", status: "pending" },
      { id: 202, name: "Pembuatan workflow automasi (Nodes & Logic)", status: "pending" },
      { id: 203, name: "Koneksi ke sistem eksternal (Webhook / Credentials)", status: "pending" },
    ],
  },
  {
    id: 3,
    name: "Pengujian & Deployment",
    tasks: [
      { id: 301, name: "Testing skenario automasi end-to-end (UAT)", status: "pending" },
      { id: 302, name: "Setup penanganan error (Error Handling)", status: "pending" },
      { id: 303, name: "Deployment & Serah terima ke Klien", status: "pending" },
    ],
  },
];

export function ImplementationPlanTemplate() {
  const sig = useSignature();

  const [docDate, setDocDate] = useState(getTodayDate());
  const [docProj, setDocProj] = useState("N8N-AUTO");
  const [docNo, setDocNo] = useState(`SFI/${getTodayDate()}/N8N-AUTO`);
  const [clientName] = useState("Nama Klien / Perusahaan");
  const [phases, setPhases] = useState<Phase[]>(INITIAL_PHASES);
  const [isSaving, setIsSaving] = useState(false);

  const preview = `SFI/${docDate || "DD-MM-YYYY"}/${docProj}`;

  const handleSaveAndPrint = async () => {
    setIsSaving(true);
    try {
      const snap = createDocumentSnapshot(docNo);
      await generateDocument({
        title: docNo,
        template: "Implementation Plan",
        projectId: undefined,
        clientId: undefined,
        amount: "0",
        fileUrl: snap?.fileUrl,
        sizeKb: snap?.sizeKb
      });
      window.print();
    } catch(err) {
      toastManager.error({ title: "Gagal", description: "Gagal menyimpan dokumen." });
    } finally {
      setIsSaving(false);
    }
  };

  const addPhase = () => {
    setPhases((prev) => [
      ...prev,
      { id: Date.now(), name: "Fase Baru", tasks: [{ id: Date.now() + 1, name: "Tugas Baru", status: "pending" }] },
    ]);
  };

  const addTask = (phaseId: number) => {
    setPhases((prev) =>
      prev.map((p) =>
        p.id === phaseId
          ? { ...p, tasks: [...p.tasks, { id: Date.now(), name: "Tugas Baru", status: "pending" }] }
          : p
      )
    );
  };

  const updatePhaseName = (id: number, name: string) => {
    setPhases((prev) => prev.map((p) => (p.id === id ? { ...p, name } : p)));
  };

  const updateTask = (phaseId: number, taskId: number, patch: Partial<Task>) => {
    setPhases((prev) =>
      prev.map((p) =>
        p.id === phaseId
          ? { ...p, tasks: p.tasks.map((t) => (t.id === taskId ? { ...t, ...patch } : t)) }
          : p
      )
    );
  };

  const delTask = (phaseId: number, taskId: number) => {
    setPhases((prev) =>
      prev.map((p) =>
        p.id === phaseId ? { ...p, tasks: p.tasks.filter((t) => t.id !== taskId) } : p
      )
    );
  };

  const delPhase = (phaseId: number) => {
    setPhases((prev) => prev.filter((p) => p.id !== phaseId));
  };

  const statusColors = {
    pending: { bg: "#f3f4f6", color: "#6b7280", label: "Menunggu" },
    progress: { bg: "#fef3c7", color: "#d97706", label: "Proses" },
    done: { bg: "#d1fae5", color: "#059669", label: "Selesai" },
  };

  const toggleTaskStatus = (phaseId: number, taskId: number, current: Task["status"]) => {
    const nextStatus = current === "pending" ? "progress" : current === "progress" ? "done" : "pending";
    updateTask(phaseId, taskId, { status: nextStatus });
  };

  return (
    <div className="skyflow-doc">
      {/* TOOLBAR */}
      <div className="tpl-toolbar no-print">
        <div className="tpl-toolbar-left">
          <div className="num-builder">
            <label>No. Dokumen:</label>
            <span style={{ color: "var(--gold)", fontWeight: 700, fontSize: 12 }}>SFI</span>
            <span className="sep">/</span>
            <input
              type="text"
              maxLength={10}
              style={{ width: 88 }}
              value={docDate}
              placeholder="08-06-2026"
              onChange={(e) => setDocDate(e.target.value)}
            />
            <span className="sep">/</span>
            <input
              type="text"
              style={{ width: 80 }}
              value={docProj}
              placeholder="N8N-INT"
              onChange={(e) => setDocProj(e.target.value)}
            />
            <span style={{ color: "var(--ink3)", fontSize: 10, marginLeft: 4 }}>→</span>
            <span className="num-preview">{preview}</span>
            <button
              className="tpl-btn tpl-btn-ghost"
              style={{ padding: "5px 12px", fontSize: 10 }}
              onClick={() => setDocNo(preview)}
            >
              Terapkan
            </button>
          </div>
        </div>
        <div className="tpl-toolbar-right">
          <button className="tpl-btn tpl-btn-ghost" onClick={addPhase}>
            ＋ Fase
          </button>
          <button 
            className="tpl-btn tpl-btn-fill" 
            onClick={handleSaveAndPrint}
            disabled={isSaving}
          >
            {isSaving ? "Menyimpan..." : "↓ PDF / Cetak"}
          </button>
        </div>
      </div>

      {/* PAPER */}
      <div className="paper">
        {/* HEADER */}
        <div className="hdr">
          <div className="hdr-lines" />
          <div className="hdr-inner">
            <div className="logo-area">
              <span className="brand-name">SkyFlowID</span>
              <div className="brand-tagline">Solusi Kecerdasan Buatan</div>
            </div>
            <div className="doc-label">
              <h1 style={{ fontSize: "1.8rem" }}>IMPLEMENTATION PLAN</h1>
              <div className="doc-sub">{docNo}</div>
            </div>
          </div>
        </div>

        <div className="g-rule" />

        {/* META */}
        <div className="meta-row">
          <div>
            <div className="meta-lbl">Tanggal Dokumen</div>
            <div className="meta-val" contentEditable suppressContentEditableWarning>
              {getTodayLongDate()}
            </div>
          </div>
          <div>
            <div className="meta-lbl">Proyek / Modul</div>
            <div className="meta-val accent" contentEditable suppressContentEditableWarning>
              Automasi Workflow Bisnis
            </div>
          </div>
          <div>
            <div className="meta-lbl">Penanggung Jawab</div>
            <div className="meta-val" contentEditable suppressContentEditableWarning>
              Tim Developer SkyFlowID
            </div>
          </div>
          <div>
            <div className="meta-lbl">Klien / Tujuan</div>
            <div className="meta-val" contentEditable suppressContentEditableWarning>
              {clientName}
            </div>
          </div>
        </div>

        {/* INTRODUCTION */}
        <div className="addr-row" style={{ marginTop: 24 }}>
          <div className="addr-blk" style={{ flex: "1" }}>
            <h3>Deskripsi & Ruang Lingkup</h3>
            <div className="detail" style={{ maxWidth: "100%", lineHeight: 1.6 }} contentEditable suppressContentEditableWarning>
              Dokumen ini menguraikan tahapan implementasi sistem automasi menggunakan platform N8N. 
              Fokus utama meliputi integrasi antar aplikasi, pengelolaan alur data otomatis, serta optimasi proses bisnis sesuai dengan kebutuhan operasional Klien.
            </div>
          </div>
        </div>

        {/* ROADMAP TABLE */}
        <div className="tbl-section">
          <div className="section-lbl">Roadmap Implementasi</div>
          {phases.map((phase, pIdx) => (
            <div key={phase.id} className="phase-block" style={{ marginBottom: 24 }}>
              <div className="phase-heading" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, paddingBottom: 4, borderBottom: "1px solid var(--ink5)" }}>
                <h4 style={{ margin: 0, color: "var(--ink)", fontSize: 14 }}>
                  Tahap {pIdx + 1}:{" "}
                  <span
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => updatePhaseName(phase.id, e.currentTarget.textContent || "")}
                  >
                    {phase.name}
                  </span>
                </h4>
                <button className="del-row-btn no-print" onClick={() => delPhase(phase.id)}>
                  Hapus Fase
                </button>
              </div>
              <table style={{ marginTop: 0 }}>
                <thead>
                  <tr>
                    <th style={{ width: "65%" }}>Deskripsi Tugas</th>
                    <th style={{ width: "25%" }}>Status</th>
                    <th style={{ width: "10%" }} className="r no-print" />
                  </tr>
                </thead>
                <tbody>
                  {phase.tasks.map((task) => (
                    <tr key={task.id}>
                      <td>
                        <span
                          className="item-name"
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={(e) => updateTask(phase.id, task.id, { name: e.currentTarget.textContent || "" })}
                        >
                          {task.name}
                        </span>
                      </td>
                      <td>
                        <button
                          className="no-print"
                          style={{
                            background: statusColors[task.status].bg,
                            color: statusColors[task.status].color,
                            border: "none",
                            padding: "4px 8px",
                            borderRadius: 4,
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: "pointer",
                            width: "100%"
                          }}
                          onClick={() => toggleTaskStatus(phase.id, task.id, task.status)}
                        >
                          {statusColors[task.status].label}
                        </button>
                        <span className="print-only" style={{ color: statusColors[task.status].color, fontWeight: 600 }}>
                          {statusColors[task.status].label}
                        </span>
                      </td>
                      <td className="r no-print">
                        <button className="del-row-btn" title="Hapus baris" onClick={() => delTask(phase.id, task.id)}>
                          ✕
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button className="tpl-btn tpl-btn-ghost no-print" style={{ marginTop: 8, fontSize: 11, padding: "4px 8px" }} onClick={() => addTask(phase.id)}>
                ＋ Tambah Tugas
              </button>
            </div>
          ))}
        </div>

        {/* API SPECIFICATIONS SECTION */}
        <div className="addr-row" style={{ marginTop: 24, padding: "16px", background: "var(--ink6)", borderRadius: 8 }}>
          <div className="addr-blk" style={{ flex: "1", paddingRight: 0 }}>
            <h3 style={{ color: "var(--ink2)", marginBottom: 8 }}>Spesifikasi Teknis / Webhook (Catatan Tambahan)</h3>
            <div className="detail" style={{ maxWidth: "100%", whiteSpace: "pre-wrap", fontFamily: "monospace", fontSize: 12 }} contentEditable suppressContentEditableWarning>
{` `}
            </div>
          </div>
        </div>

        <div className="page-break" />
        {/* BOTTOM: SIGNATURE */}
        <div className="bottom-row" style={{ marginTop: 32 }}>
          <div className="sig-block">
            <h3>Disetujui Oleh</h3>
            <div className="sig-canvas-wrap" ref={sig.wrapRef}>
              <canvas ref={sig.canvasRef} />
              {!sig.hasSignature && (
                <div className="sig-hint">
                  Tanda tangani di sini
                  <br />
                  <span style={{ fontSize: 10 }}>klik & geser untuk menggambar</span>
                </div>
              )}
            </div>
            <div className="sig-ctrl no-print">
              <button className="sig-btn" onClick={sig.clear}>
                Hapus
              </button>
            </div>
            <div className="sig-name-wrap">
              <div className="sig-name-lbl">Project Manager</div>
              <div
                style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)", marginTop: 3 }}
                contentEditable
                suppressContentEditableWarning
              >
                Dandi Cahyaman
              </div>
              <div
                style={{ fontSize: 12, color: "var(--ink3)", marginTop: 3 }}
                contentEditable
                suppressContentEditableWarning
              >
                SkyFlowID
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="footer-band" style={{ marginTop: 40 }}>
          <div className="footer-text">
            Dokumen ini bersifat rahasia dan merupakan hak milik internal SkyFlowID.
          </div>
          <div className="footer-brand">
            <span>SkyFlowID</span>
          </div>
        </div>
      </div>
    </div>
  );
}
