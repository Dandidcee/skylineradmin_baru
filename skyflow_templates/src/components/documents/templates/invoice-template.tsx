import { useMemo, useState, useEffect } from "react";
import { useSignature, formatRupiah, parseNumber, getTodayDate, getTodayLongDate } from "./use-signature";
import { generateDocument, createDocumentSnapshot } from "@/services/document-service";
import { getClients } from "@/services/client-service";
import { getProjects } from "@/services/project-service";
import { toastManager } from "@/components/ui/toast";
import "./template.css";

type LineItem = {
  id: number;
  name: string;
  desc: string;
  qty: number;
  price: number;
};

type PayMethod = "bri" | "mandiri";

const INITIAL_ITEMS: LineItem[] = [
  {
    id: 1,
    name: "AI Chatbot Enterprise",
    desc: "Implementasi & kustomisasi model bahasa besar (LLM) untuk operasional bisnis, termasuk training data & deployment",
    qty: 1,
    price: 15000000,
  },
  {
    id: 2,
    name: "Data Pipeline Automation",
    desc: "Orkestrasi alur data real-time berbasis cloud, integrasi API, dan monitoring dashboard",
    qty: 3,
    price: 4500000,
  },
  {
    id: 3,
    name: "Konsultasi Strategi AI",
    desc: "Sesi workshop intensif & penyusunan roadmap transformasi digital (8 jam, onsite)",
    qty: 2,
    price: 3000000,
  },
];

const PAY_DETAILS: Record<
  PayMethod,
  { label: string; bank: string; rek: string; name: string }
> = {
  bri: {
    label: "🏦 BRI",
    bank: "Bank Rakyat Indonesia (BRI)",
    rek: "4362-01-007056-50",
    name: "Dandi Cahyaman",
  },
  mandiri: {
    label: "🏦 Mandiri",
    bank: "Bank Mandiri",
    rek: "1770022057068",
    name: "Dandi Cahyaman",
  },
};

export function InvoiceTemplate() {
  const sig = useSignature();

  const [invDate, setInvDate] = useState(getTodayDate());
  const [invProj, setInvProj] = useState("001");
  const [invNo, setInvNo] = useState("SFI/08-06-2026/001");
  const [status, setStatus] = useState<"unpaid" | "paid">("unpaid");
  const [items, setItems] = useState<LineItem[]>(INITIAL_ITEMS);
  const [ppnEnabled, setPpnEnabled] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [payMethod, setPayMethod] = useState<PayMethod>("bri");
  
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClientId, setSelectedClientId] = useState("");
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const [clientCompany, setClientCompany] = useState("Nama Klien / Perusahaan");
  const [clientDetail, setClientDetail] = useState("Alamat Klien Baris 1, Kota, Kode Pos, Indonesia · email@klien.com · +62 8xx-xxxx-xxxx");

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
        const address = client.address || "-";
        const phone = client.phone || "-";
        setClientDetail(`${address} · ${phone}`);
      }
    }
  }, [selectedClientId, clients]);

  const preview = `SFI/${invDate || "DD-MM-YYYY"}/${String(invProj || "001").padStart(3, "0")}`;

  const { subtotal, tax, grand, dp, remaining } = useMemo(() => {
    const subtotal = items.reduce((s, it) => s + it.qty * it.price, 0);
    const tax = ppnEnabled ? subtotal * 0.11 : 0;
    const grand = subtotal + tax - discount;
    const dp = grand * 0.5;
    return { subtotal, tax, grand, dp, remaining: grand - dp };
  }, [items, ppnEnabled, discount]);

  const filteredProjects = useMemo(() => {
    if (!selectedClientId) return projects;
    return projects.filter(p => p.clientId === selectedClientId);
  }, [projects, selectedClientId]);

  const updateItem = (id: number, patch: Partial<LineItem>) =>
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));

  const addRow = () =>
    setItems((prev) => [
      ...prev,
      { id: Date.now(), name: "Layanan Baru", desc: "Deskripsi layanan", qty: 1, price: 0 },
    ]);

  const delRow = (id: number) =>
    setItems((prev) => prev.filter((it) => it.id !== id));

  const handleSave = async (isPrint = false) => {
    setIsSaving(true);
    try {
      const snap = createDocumentSnapshot(invNo);
      await generateDocument({
        title: invNo,
        template: "Invoice",
        projectId: selectedProjectId || undefined,
        clientId: selectedClientId || undefined,
        amount: grand.toString(),
        fileUrl: snap?.fileUrl,
        sizeKb: snap?.sizeKb
      });
      if (isPrint) {
        window.print();
      } else {
        toastManager.success({ title: "Berhasil", description: "Invoice disimpan." });
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
            <label>No. Invoice:</label>
            <span style={{ color: "var(--gold)", fontWeight: 700, fontSize: 12 }}>SFI</span>
            <span className="sep">/</span>
            <input
              type="text"
              maxLength={10}
              style={{ width: 88 }}
              value={invDate}
              placeholder="08-06-2026"
              onChange={(e) => setInvDate(e.target.value)}
            />
            <span className="sep">/</span>
            <input
              type="text"
              style={{ width: 42 }}
              value={invProj}
              placeholder="001"
              onChange={(e) => setInvProj(e.target.value)}
            />
            <span style={{ color: "var(--ink3)", fontSize: 10, marginLeft: 4 }}>→</span>
            <span className="num-preview">{preview}</span>
            <button
              className="tpl-btn tpl-btn-ghost"
              style={{ padding: "5px 12px", fontSize: 10 }}
              onClick={() => setInvNo(preview)}
            >
              Terapkan
            </button>
          </div>

          <div className={`status-toggle${status === "paid" ? " is-paid" : ""}`}>
            <button
              className={`st-btn unpaid${status === "unpaid" ? " active" : ""}`}
              onClick={() => setStatus("unpaid")}
            >
              ● Belum Dibayar
            </button>
            <button
              className={`st-btn paid${status === "paid" ? " active" : ""}`}
              onClick={() => setStatus("paid")}
            >
              ● Lunas
            </button>
          </div>
        </div>
        <div className="tpl-toolbar-right">
          <button className="tpl-btn tpl-btn-ghost" onClick={addRow}>
            ＋ Item
          </button>
          <button
            className="tpl-btn tpl-btn-ghost"
            style={{ borderColor: "var(--gold-dark)", color: "var(--gold-dark)" }}
            onClick={() => setPpnEnabled((v) => !v)}
          >
            PPN 11% {ppnEnabled ? "✓" : "✕"}
          </button>
          
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
                  if (proj.clientId) setSelectedClientId(proj.clientId);
                  const priceNum = parseInt(proj.price.replace(/\D/g, "")) || 0;
                  setItems([{
                    id: Date.now(),
                    name: proj.name,
                    desc: "Pembayaran untuk project " + proj.name,
                    qty: 1,
                    price: priceNum
                  }]);
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

      {/* PAPER */}
      <div className="paper">
        {/* HEADER */}
        <div className="hdr">
          <div className="hdr-lines" />
          <div className="hdr-inner">
            <div className="logo-area">
              <span className="brand-name">SkyFlowID</span>
              <div className="brand-tagline">Solusi Kecerdasan Buatan</div>
              <div className={`status-pill ${status}`}>
                <div className="status-dot" />
                <span>{status === "paid" ? "LUNAS" : "BELUM DIBAYAR"}</span>
              </div>
            </div>
            <div className="doc-label">
              <h1>INVOICE</h1>
              <div className="doc-sub">{invNo}</div>
            </div>
          </div>
        </div>

        <div className="g-rule" />

        {/* META */}
        <div className="meta-row">
          <div>
            <div className="meta-lbl">Tanggal Invoice</div>
            <div className="meta-val" contentEditable suppressContentEditableWarning>
              {getTodayLongDate()}
            </div>
          </div>
          <div>
            <div className="meta-lbl">Jatuh Tempo</div>
            <div className="meta-val accent" contentEditable suppressContentEditableWarning>
              22 Juni 2026
            </div>
          </div>
          <div>
            <div className="meta-lbl">Referensi Proyek</div>
            <div className="meta-val" contentEditable suppressContentEditableWarning>
              AI-PRJ-2026
            </div>
          </div>
          <div>
            <div className="meta-lbl">Mata Uang</div>
            <div className="meta-val" contentEditable suppressContentEditableWarning>
              IDR – Rupiah
            </div>
          </div>
        </div>

        {/* ADDRESSES */}
        <div className="addr-row">
          <div className="addr-blk">
            <h3>Dari</h3>
            <div className="company">SkyFlowID</div>
            <div className="detail" contentEditable suppressContentEditableWarning>
              Jl. Wiradisastra, Kp Cipurut, Mandalagiri, Kab. Tasikmalaya 46464,
              Indonesia · Dandicahyamanforw@gmail.com · +6282118300967
            </div>
          </div>
          <div className="addr-blk">
            <h3>Tagihan Kepada</h3>
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

        {/* TABLE */}
        <div className="tbl-section">
          <div className="section-lbl">Rincian Layanan</div>
          <table>
            <thead>
              <tr>
                <th style={{ width: "44%" }}>Deskripsi Layanan</th>
                <th style={{ width: "9%" }} className="r">Qty</th>
                <th style={{ width: "23%" }} className="r">Harga Satuan (Rp)</th>
                <th style={{ width: "20%" }} className="r">Total</th>
                <th style={{ width: "4%" }} className="r no-print" />
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.id}>
                  <td>
                    <span
                      className="item-name"
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => updateItem(it.id, { name: e.currentTarget.textContent || "" })}
                    >
                      {it.name}
                    </span>
                    <span
                      className="item-desc"
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => updateItem(it.id, { desc: e.currentTarget.textContent || "" })}
                    >
                      {it.desc}
                    </span>
                  </td>
                  <td className="r">
                    <span
                      className="item-qty"
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) =>
                        updateItem(it.id, { qty: parseNumber(e.currentTarget.textContent || "0") })
                      }
                    >
                      {it.qty}
                    </span>
                  </td>
                  <td className="r">
                    <span
                      className="item-price"
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) =>
                        updateItem(it.id, { price: parseNumber(e.currentTarget.textContent || "0") })
                      }
                    >
                      {it.price.toLocaleString("id-ID")}
                    </span>
                  </td>
                  <td className="r">
                    <span className="item-total">{formatRupiah(it.qty * it.price)}</span>
                  </td>
                  <td className="r no-print">
                    <button className="del-row-btn" title="Hapus baris" onClick={() => delRow(it.id)}>
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button className="tpl-btn tpl-btn-ghost no-print" style={{ marginTop: 12 }} onClick={addRow}>
            ＋ Tambah Item
          </button>
        </div>

        {/* BOTTOM: SIGNATURE + TOTALS */}
        <div className="bottom-row">
          <div className="sig-block">
            <h3>Tanda Tangan Digital</h3>
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
              <div className="sig-name-lbl">Nama & Jabatan</div>
              <div
                style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)", marginTop: 3 }}
                contentEditable
                suppressContentEditableWarning
              >
                Nama Penanda Tangan
              </div>
              <div
                style={{ fontSize: 12, color: "var(--ink3)", marginTop: 3 }}
                contentEditable
                suppressContentEditableWarning
              >
                SkyFlowID · Tasikmalaya, {getTodayLongDate()}
              </div>
            </div>
          </div>

          <div className="totals-wrap">
            <div className="totals-box">
              <div className="tot-row">
                <span className="tot-lbl">Subtotal</span>
                <span style={{ fontWeight: 500 }}>{formatRupiah(subtotal)}</span>
              </div>
              {ppnEnabled && (
                <div className="tot-row">
                  <span className="tot-lbl">PPN 11%</span>
                  <span>{formatRupiah(tax)}</span>
                </div>
              )}
              <div className="tot-row">
                <span className="tot-lbl">Diskon</span>
                <span
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => setDiscount(parseNumber(e.currentTarget.textContent || "0"))}
                >
                  {formatRupiah(discount)}
                </span>
              </div>
              <div className="tot-row grand">
                <span className="tot-lbl">Total Tagihan</span>
                <span>{formatRupiah(grand)}</span>
              </div>
              <div className="tot-row dp">
                <span className="tot-lbl">Down Payment Min. 50%</span>
                <span>{formatRupiah(dp)}</span>
              </div>
              <div className="tot-row remaining">
                <span className="tot-lbl">Sisa Pelunasan</span>
                <span>{formatRupiah(remaining)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* PAYMENT METHODS */}
        <div className="pay-detail-section">
          <div className="section-lbl">Metode Pembayaran</div>
          <div className="pay-type-toggle no-print" style={{ marginBottom: 16 }}>
            {(Object.keys(PAY_DETAILS) as PayMethod[]).map((m) => (
              <button
                key={m}
                className={`pay-type-btn${payMethod === m ? " active" : ""}`}
                onClick={() => setPayMethod(m)}
              >
                {PAY_DETAILS[m].label}
              </button>
            ))}
          </div>
          <div className="pay-grid">
            <div className="pay-field">
              <div className="pay-field-lbl">Bank / Platform</div>
              <div className="pay-field-val">{PAY_DETAILS[payMethod].bank}</div>
            </div>
            <div className="pay-field">
              <div className="pay-field-lbl">No. Rekening / Akun</div>
              <div className="pay-field-val" contentEditable suppressContentEditableWarning>
                {PAY_DETAILS[payMethod].rek}
              </div>
            </div>
            <div className="pay-field">
              <div className="pay-field-lbl">Atas Nama</div>
              <div className="pay-field-val" contentEditable suppressContentEditableWarning>
                {PAY_DETAILS[payMethod].name}
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="footer-band">
          <div className="footer-text">
            Terima kasih atas kepercayaan Anda kepada SkyFlowID.
            <br />
            Pembayaran dianggap sah setelah dana diterima.
          </div>
          <div className="footer-brand">
            <span>SkyFlowID</span>
          </div>
        </div>
      </div>
    </div>
  );
}
