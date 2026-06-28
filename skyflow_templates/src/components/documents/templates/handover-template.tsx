import { useState, useEffect, useMemo } from "react";
import { useSignature, getTodayDate, getTodayLongDate } from "./use-signature";
import { getClients } from "@/services/client-service";
import { getProjects } from "@/services/project-service";
import { generateDocument, createDocumentSnapshot } from "@/services/document-service";
import { toastManager } from "@/components/ui/toast";
import "./template.css";

export function HandoverTemplate() {
  const sig = useSignature(); // Signature for SkyFlow
  const sig2 = useSignature(); // Signature for Client

  const [docDate, setDocDate] = useState(getTodayDate());
  const [docSeq, setDocSeq] = useState("001");
  const [docNo, setDocNo] = useState(`BAST/${getTodayDate()}/001`);
  
  const [clients, setClients] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  
  const [selectedClientId, setSelectedClientId] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState("");

  const [clientCompany, setClientCompany] = useState("Nama Klien / Perusahaan");
  const [clientName, setClientName] = useState("Nama Klien");
  const [clientDetail, setClientDetail] = useState("Alamat Klien Baris 1, Kota, Kode Pos, Indonesia · email@klien.com · +62 8xx-xxxx-xxxx");
  const [projectName, setProjectName] = useState("Nama Project");

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    getClients().then(setClients);
    getProjects().then(setProjects);
  }, []);

  useEffect(() => {
    if (selectedClientId) {
      const client = clients.find(c => c.id === selectedClientId);
      if (client) {
        const cName = client.name;
        const cComp = client.company;
        if (cName && cComp) setClientCompany(`${cName} / ${cComp}`);
        else if (cName) setClientCompany(cName);
        else if (cComp) setClientCompany(cComp);
        else setClientCompany("Nama Klien / Perusahaan");
        setClientName(client.name || "Nama Klien");
        const address = client.address || "-";
        const phone = client.phone || "-";
        setClientDetail(`${address} · ${phone}`);
      }
    }
  }, [selectedClientId, clients]);

  const preview = `BAST/${docDate || "DD-MM-YYYY"}/${String(docSeq || "001").padStart(3, "0")}`;

  const filteredProjects = useMemo(() => {
    if (!selectedClientId) return projects;
    return projects.filter(p => p.clientId === selectedClientId);
  }, [projects, selectedClientId]);

  const handleSave = async (isPrint = false) => {
    setIsSaving(true);
    try {
      const snap = createDocumentSnapshot(docNo);
      await generateDocument({
        title: docNo,
        template: "Handover",
        projectId: selectedProjectId || undefined,
        clientId: selectedClientId || undefined,
        amount: "0",
        fileUrl: snap?.fileUrl,
        sizeKb: snap?.sizeKb
      });
      if (isPrint) {
        window.print();
      } else {
        toastManager.success({ title: "Berhasil", description: "Berita Acara Serah Terima disimpan." });
      }
    } catch(err) {
      toastManager.error({ title: "Gagal", description: "Gagal menyimpan dokumen." });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="skyflow-doc">
      {/* TOOLBAR */}
      <div className="tpl-toolbar">
        <div className="tpl-toolbar-left">
          <div className="num-builder">
            <label>No. Dokumen:</label>
            <span style={{ color: "var(--gold)", fontWeight: 700, fontSize: 12 }}>BAST</span>
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
              style={{ width: 42 }}
              value={docSeq}
              placeholder="001"
              onChange={(e) => setDocSeq(e.target.value)}
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
          <select 
            className="tpl-btn no-print bg-background text-text" 
            style={{ padding: "5px 12px", border: "1px solid var(--border)" }}
            value={selectedClientId}
            onChange={e => setSelectedClientId(e.target.value)}
          >
            <option value="">-- Pilih Client --</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          
          <select 
            className="tpl-btn no-print bg-background text-text" 
            style={{ padding: "5px 12px", border: "1px solid var(--border)", marginLeft: 4 }}
            value={selectedProjectId}
            onChange={e => {
              const pId = e.target.value;
              setSelectedProjectId(pId);
              if (pId) {
                const proj = projects.find(p => p.id === pId);
                if (proj) {
                  setProjectName(proj.name);
                  if (proj.clientId) setSelectedClientId(proj.clientId);
                }
              }
            }}
          >
            <option value="">-- Pilih Project --</option>
            {filteredProjects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>

          <button 
            className="tpl-btn tpl-btn-fill no-print" 
            onClick={() => handleSave(false)}
            disabled={isSaving}
          >
            {isSaving ? "Menyimpan..." : "💾 Simpan ke Sistem"}
          </button>
          
          <button 
            className="tpl-btn tpl-btn-fill no-print" 
            style={{ background: "var(--ink)", color: "white" }} 
            onClick={() => handleSave(true)}
            disabled={isSaving}
          >
            ↓ PDF / Cetak
          </button>
        </div>
      </div>

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
              <h1 className="sm" style={{ fontSize: 32 }}>BERITA ACARA</h1>
              <div className="doc-sub">{docNo}</div>
            </div>
          </div>
        </div>

        <div className="g-rule" />

        {/* META */}
        <div className="meta-row" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
          <div>
            <div className="meta-lbl">Tanggal</div>
            <div className="meta-val" contentEditable suppressContentEditableWarning>
              {getTodayLongDate()}
            </div>
          </div>
          <div>
            <div className="meta-lbl">Perihal</div>
            <div className="meta-val" contentEditable suppressContentEditableWarning>
              Serah Terima Pekerjaan
            </div>
          </div>
          <div>
            <div className="meta-lbl">Referensi Proyek</div>
            <div className="meta-val" contentEditable suppressContentEditableWarning>
              {projectName || "N/A"}
            </div>
          </div>
        </div>

        {/* ADDRESSES / PARTIES */}
        <div className="addr-row">
          <div className="addr-blk">
            <h3>Pihak Pertama (Penyedia)</h3>
            <div className="company">SkyFlowID</div>
            <div className="detail" contentEditable suppressContentEditableWarning>
              Jl. Wiradisastra, Kp Cipurut, Mandalagiri, Kab. Tasikmalaya 46464,
              Indonesia · Dandicahyamanforw@gmail.com · +6282118300967
            </div>
          </div>
          <div className="addr-blk">
            <h3>Pihak Kedua (Klien)</h3>
            <div 
              className="company" 
              contentEditable 
              suppressContentEditableWarning
              onBlur={(e) => setClientCompany(e.currentTarget.textContent || "")}
            >
              {clientCompany}
            </div>
            <div 
              className="detail" 
              contentEditable 
              suppressContentEditableWarning
              onBlur={(e) => setClientDetail(e.currentTarget.textContent || "")}
            >
              {clientDetail}
            </div>
          </div>
        </div>

        {/* BODY */}
        <div className="tbl-section" style={{ fontSize: 13, lineHeight: 1.8 }}>
          <div className="section-lbl">Keterangan Serah Terima</div>
          <p style={{ marginBottom: 16 }}>
            Pada hari ini, <span style={{ fontWeight: 600, color: "var(--ink)" }} contentEditable suppressContentEditableWarning>Senin</span>, 
            tanggal <span style={{ fontWeight: 600, color: "var(--ink)" }} contentEditable suppressContentEditableWarning>{getTodayLongDate()}</span>, 
            telah dilakukan serah terima pekerjaan pengembangan sistem/aplikasi dengan rincian sebagai berikut:
          </p>
          
          <table style={{ marginBottom: 24 }}>
            <tbody>
              <tr>
                <td style={{ width: "30%", fontWeight: 600 }}>Nama Proyek</td>
                <td style={{ width: "5%" }}>:</td>
                <td style={{ width: "65%", fontWeight: 600, color: "var(--ink)" }} contentEditable suppressContentEditableWarning>{projectName}</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600 }}>Status Penyelesaian</td>
                <td>:</td>
                <td style={{ fontWeight: 600, color: "var(--st-green)" }} contentEditable suppressContentEditableWarning>100% Selesai</td>
              </tr>
            </tbody>
          </table>

          <p style={{ marginBottom: 16 }}>
            Pihak Pertama telah menyelesaikan pekerjaan sesuai dengan spesifikasi dan ruang lingkup yang telah disepakati bersama. 
            Pihak Kedua menyatakan telah menerima hasil pekerjaan tersebut dalam keadaan baik dan berfungsi sebagaimana mestinya.
          </p>

          <p style={{ marginBottom: 12 }}>
            Terhitung sejak ditandatanganinya Berita Acara Serah Terima ini, maka:
          </p>
          
          <ol style={{ paddingLeft: 24, marginBottom: 24 }}>
            <li style={{ marginBottom: 8 }} contentEditable suppressContentEditableWarning>Pihak Kedua menerima Hak Guna atas sistem untuk kebutuhan bisnisnya (tidak untuk dijual ulang/didistribusikan secara komersial sesuai Perjanjian).</li>
            <li style={{ marginBottom: 8 }} contentEditable suppressContentEditableWarning>Masa pemeliharaan (maintenance) gratis berlaku selama 3 (tiga) bulan sejak tanggal dokumen ini, mencakup perbaikan bug dan error.</li>
            <li contentEditable suppressContentEditableWarning>Hal-hal mengenai pembayaran sisa tagihan wajib diselesaikan paling lambat 7 hari setelah serah terima ini.</li>
          </ol>
          
          <p>
            Demikian Berita Acara Serah Terima ini dibuat dalam keadaan sadar dan tanpa paksaan dari pihak manapun untuk dipergunakan sebagaimana mestinya.
          </p>
        </div>

        {/* BOTTOM: SIGNATURE */}
        <div className="bottom-row">
          <div className="sig-block">
            <h3>Pihak Pertama (Penyedia)</h3>
            <div className="sig-canvas-wrap" ref={sig.wrapRef}>
              <canvas ref={sig.canvasRef} />
              {!sig.hasSignature && (
                <div className="sig-hint">
                  Tanda tangani di sini
                  <br />
                  <span style={{ fontSize: 10 }}>klik & geser</span>
                </div>
              )}
            </div>
            <div className="sig-ctrl no-print">
              <button className="sig-btn" onClick={sig.clear}>
                Hapus
              </button>
            </div>
            <div className="sig-name-wrap">
              <div className="sig-name-lbl">Nama & Jabatan</div>
              <div
                style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)", marginTop: 3 }}
                contentEditable
                suppressContentEditableWarning
              >
                SkyFlowID
              </div>
              <div
                style={{ fontSize: 12, color: "var(--ink3)", marginTop: 3 }}
                contentEditable
                suppressContentEditableWarning
              >
                Penyedia Layanan
              </div>
            </div>
          </div>

          <div className="sig-block">
            <h3>Pihak Kedua (Klien)</h3>
            <div className="sig-canvas-wrap" ref={sig2.wrapRef}>
              <canvas ref={sig2.canvasRef} />
              {!sig2.hasSignature && (
                <div className="sig-hint">
                  Tanda tangani di sini
                  <br />
                  <span style={{ fontSize: 10 }}>klik & geser</span>
                </div>
              )}
            </div>
            <div className="sig-ctrl no-print">
              <button className="sig-btn" onClick={sig2.clear}>
                Hapus
              </button>
            </div>
            <div className="sig-name-wrap">
              <div className="sig-name-lbl">Nama & Jabatan</div>
              <div
                style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)", marginTop: 3 }}
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => setClientName(e.currentTarget.textContent || "")}
              >
                {clientName}
              </div>
              <div
                style={{ fontSize: 12, color: "var(--ink3)", marginTop: 3 }}
                contentEditable
                suppressContentEditableWarning
              >
                Klien
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="footer-band">
          <div className="footer-text">
            Terima kasih atas kerja sama dan kepercayaan Anda kepada SkyFlowID.
            <br />
            Dokumen ini sah dan mengikat secara hukum.
          </div>
          <div className="footer-brand">
            <span>SkyFlowID</span>
          </div>
        </div>

      </div>
    </div>
  );
}
