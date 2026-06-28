import { useState, useEffect, useMemo } from "react";
import { useSignature, getTodayDate, getTodayLongDate } from "./use-signature";
import { getClients } from "@/services/client-service";
import { getProjects } from "@/services/project-service";
import { generateDocument, createDocumentSnapshot } from "@/services/document-service";
import { toastManager } from "@/components/ui/toast";
import "./template.css";

type PayType = "Transfer Bank" | "DANA" | "Tunai" | "QRIS";
type PayStatus = "dp" | "lunas";
type PayMethod = "bri" | "mandiri";

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

export function ReceiptTemplate() {
  const sig = useSignature();

  const [recDate, setRecDate] = useState(getTodayDate());
  const [recSeq, setRecSeq] = useState("001");
  const [recNo, setRecNo] = useState(`BYR/${getTodayDate()}/001`);
  const [payType, setPayType] = useState<PayType>("Transfer Bank");
  const [payStatus, setPayStatus] = useState<PayStatus>("dp");
  const [payMethod, setPayMethod] = useState<PayMethod>("bri");

  const [clients, setClients] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  
  const [selectedClientId, setSelectedClientId] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState("");

  const [clientCompany, setClientCompany] = useState("Nama Klien / Perusahaan");
  const [clientDetail, setClientDetail] = useState("Alamat Klien Baris 1, Kota, Kode Pos, Indonesia · email@klien.com · +62 8xx-xxxx-xxxx");

  // Nominal states
  const [jumlahDibayar, setJumlahDibayar] = useState("Rp 0");
  const [sisaTagihan, setSisaTagihan] = useState("Rp —");
  const [nilaiTotal, setNilaiTotal] = useState("Rp 0");
  const [saveAmount, setSaveAmount] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  
  const [projectPriceRaw, setProjectPriceRaw] = useState(0);
  const [paidPastRaw, setPaidPastRaw] = useState(0);

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

  const preview = `BYR/${recDate || "DD-MM-YYYY"}/${String(recSeq || "001").padStart(3, "0")}`;
  const showBank = payType !== "Tunai";

  const statusLabel = payStatus === "lunas" ? "Lunas" : "Down Payment (DP)";
  const statusColor = payStatus === "lunas" ? "var(--st-green)" : "var(--st-orange)";

  const filteredProjects = useMemo(() => {
    if (!selectedClientId) return projects;
    return projects.filter(p => p.clientId === selectedClientId);
  }, [projects, selectedClientId]);

  const handleSave = async (isPrint = false) => {
    setIsSaving(true);
    try {
      const snap = createDocumentSnapshot(recNo);
      await generateDocument({
        title: recNo,
        template: "Payment Receipt",
        projectId: selectedProjectId || undefined,
        clientId: selectedClientId || undefined,
        amount: saveAmount.toString(),
        fileUrl: snap?.fileUrl,
        sizeKb: snap?.sizeKb
      });
      if (isPrint) {
        window.print();
      } else {
        toastManager.success({ title: "Berhasil", description: "Bukti Pembayaran disimpan." });
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
            <label>No. Bukti:</label>
            <span style={{ color: "var(--gold)", fontWeight: 700, fontSize: 12 }}>BYR</span>
            <span className="sep">/</span>
            <input
              type="text"
              maxLength={10}
              style={{ width: 88 }}
              value={recDate}
              placeholder="08-06-2026"
              onChange={(e) => setRecDate(e.target.value)}
            />
            <span className="sep">/</span>
            <input
              type="text"
              style={{ width: 42 }}
              value={recSeq}
              placeholder="001"
              onChange={(e) => setRecSeq(e.target.value)}
            />
            <span style={{ color: "var(--ink3)", fontSize: 10, marginLeft: 4 }}>→</span>
            <span className="num-preview">{preview}</span>
            <button
              className="tpl-btn tpl-btn-ghost"
              style={{ padding: "5px 12px", fontSize: 10 }}
              onClick={() => setRecNo(preview)}
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
                  if (proj.clientId) setSelectedClientId(proj.clientId);
                  const priceNum = parseInt(proj.price.replace(/\D/g, "")) || 0;
                  const projectFinances = proj.finances || [];
                  const paidFinances = projectFinances.filter((f: any) => f.type === 'PAYMENT_RECEIPT' || f.status === 'PAID');
                  const paidPast = paidFinances.reduce((acc: number, curr: any) => acc + (curr.amount || 0), 0);
                  
                  setProjectPriceRaw(priceNum);
                  setPaidPastRaw(paidPast);

                  const sisa = Math.max(0, priceNum - paidPast);
                  
                  const fmt = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });
                  
                  setNilaiTotal(fmt.format(priceNum));
                  setJumlahDibayar(fmt.format(sisa));
                  setSisaTagihan(fmt.format(0)); // asumsikan lunas (bayar semua sisa)
                  setSaveAmount(sisa);
                  setPayStatus(sisa === priceNum ? "dp" : "lunas"); // Simple guess

                  if (proj.clientId && !selectedClientId) setSelectedClientId(proj.clientId);
                }
              }
            }}
          >
            <option value="">-- Pilih Project --</option>
            {filteredProjects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>

          <select 
            className="tpl-btn no-print bg-background text-text" 
            style={{ padding: "5px 12px", border: "1px solid var(--border)", marginLeft: 4 }}
            value={payMethod}
            onChange={e => setPayMethod(e.target.value as PayMethod)}
          >
            <option value="bri">BRI</option>
            <option value="mandiri">Mandiri</option>
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

      <div className="paper narrow">
        {/* HEADER */}
        <div className="hdr">
          <div className="hdr-lines" />
          <div className="hdr-inner">
            <div className="logo-area">
              <span className="brand-name">SkyFlowID</span>
              <div className="brand-tagline">Solusi Kecerdasan Buatan</div>
              <div className={`status-pill ${payStatus}`}>
                <div className="status-dot" />
                <span>{payStatus === "lunas" ? "LUNAS" : "DOWN PAYMENT"}</span>
              </div>
            </div>
            <div className="doc-label">
              <h1 className="sm">BUKTI BAYAR</h1>
              <div className="doc-sub">{recNo}</div>
            </div>
          </div>
        </div>

        <div className="g-rule" />

        {/* META */}
        <div className="meta-row">
          <div>
            <div className="meta-lbl">Tanggal Bayar</div>
            <div className="meta-val accent" contentEditable suppressContentEditableWarning>
              {getTodayLongDate()}
            </div>
          </div>
          <div>
            <div className="meta-lbl">No. Invoice Referensi</div>
            <div className="meta-val" contentEditable suppressContentEditableWarning>
              SFI/{getTodayDate()}/001
            </div>
          </div>
          <div>
            <div className="meta-lbl">Tipe Pembayaran</div>
            <div className="meta-val">{payType}</div>
          </div>
          <div>
            <div className="meta-lbl">Status</div>
            <div className="meta-val" style={{ fontWeight: 700, color: statusColor }}>
              {statusLabel}
            </div>
          </div>
        </div>

        {/* PARTY */}
        <div className="party-row">
          <div className="party-blk">
            <h3>Diterima Oleh</h3>
            <div className="company">SkyFlowID</div>
            <div className="detail" contentEditable suppressContentEditableWarning>
              Jl. Wiradisastra, Kp Cipurut, Mandalagiri, Kab. Tasikmalaya 46464,
              Indonesia · Dandicahyamanforw@gmail.com · +6282118300967
            </div>
          </div>
          <div className="party-blk">
            <h3>Dibayar Oleh</h3>
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

        {/* PAYMENT DETAIL */}
        <div className="pay-detail-section">
          <div className="section-lbl">Detail Pembayaran</div>
          <div className="pay-grid">
            <div className="pay-field">
              <div className="pay-field-lbl">Tipe Pembayaran</div>
              <div className="pay-type-toggle no-print" style={{ marginTop: 6 }}>
                {(["Transfer Bank", "DANA", "Tunai", "QRIS"] as PayType[]).map((t) => (
                  <button
                    key={t}
                    className={`pay-type-btn${payType === t ? " active" : ""}`}
                    onClick={() => setPayType(t)}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <div className="pay-field-val" style={{ marginTop: 6 }}>
                {payType}
              </div>
            </div>

            <div className="pay-field">
              <div className="pay-field-lbl">Status Pembayaran</div>
              <div className="pay-status-toggle no-print" style={{ marginTop: 6 }}>
                <button
                  className={`pst-btn dp${payStatus === "dp" ? " active" : ""}`}
                  onClick={() => {
                    setPayStatus("dp");
                    const dpAmount = projectPriceRaw * 0.5;
                    const sisa = Math.max(0, projectPriceRaw - paidPastRaw - dpAmount);
                    const fmt = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });
                    setJumlahDibayar(fmt.format(dpAmount));
                    setSisaTagihan(fmt.format(sisa));
                    setSaveAmount(dpAmount);
                  }}
                >
                  ● Down Payment
                </button>
                <button
                  className={`pst-btn lunas${payStatus === "lunas" ? " active" : ""}`}
                  onClick={() => {
                    setPayStatus("lunas");
                    const remaining = Math.max(0, projectPriceRaw - paidPastRaw);
                    const fmt = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });
                    setJumlahDibayar(fmt.format(remaining));
                    setSisaTagihan(fmt.format(0));
                    setSaveAmount(remaining);
                  }}
                >
                  ● Lunas
                </button>
              </div>
            </div>

            <div className="pay-field" style={{ opacity: showBank ? 1 : 0.3 }}>
              <div className="pay-field-lbl">Bank / Platform</div>
              <div className="pay-field-val" contentEditable suppressContentEditableWarning>
                {PAY_DETAILS[payMethod].bank}
              </div>
            </div>

            <div className="pay-field" style={{ opacity: showBank ? 1 : 0.3 }}>
              <div className="pay-field-lbl">No. Rekening / Akun Tujuan</div>
              <div className="pay-field-val" contentEditable suppressContentEditableWarning>
                {PAY_DETAILS[payMethod].rek}
              </div>
            </div>

            <div className="pay-field">
              <div className="pay-field-lbl">Atas Nama Penerima</div>
              <div className="pay-field-val" contentEditable suppressContentEditableWarning>
                {PAY_DETAILS[payMethod].name}
              </div>
            </div>

            <div className="pay-field">
              <div className="pay-field-lbl">No. Referensi Transaksi</div>
              <div className="pay-field-val" contentEditable suppressContentEditableWarning>
                —
              </div>
            </div>
          </div>
        </div>

        {/* NOMINAL */}
        <div className="nominal-section">
          <div className="nominal-box">
            <div className="nominal-left">
              <div className="nominal-lbl">
                Jumlah
                <br />
                Dibayar
              </div>
              <div>
                <div 
                  className="nominal-amount" 
                  contentEditable 
                  suppressContentEditableWarning
                  onBlur={(e) => {
                     const text = e.currentTarget.textContent || "0";
                     const paidNow = parseInt(text.replace(/\D/g, "")) || 0;
                     
                     const proj = projects.find(p => p.id === selectedProjectId);
                     if (proj) {
                        const priceNum = projectPriceRaw;
                        const paidPast = paidPastRaw;
                        
                        const sisaBaru = Math.max(0, priceNum - paidPast - paidNow);
                        const fmt = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 });
                        setSisaTagihan(fmt.format(sisaBaru));
                        
                        if (sisaBaru <= 0) setPayStatus("lunas");
                        else setPayStatus("dp");
                     }
                     
                     setJumlahDibayar(text);
                     setSaveAmount(paidNow);
                  }}
                >
                  {jumlahDibayar}
                </div>
                <div className="nominal-ref">
                  Ref. Invoice: <span>SFI/{getTodayDate()}/001</span>
                </div>
              </div>
            </div>
            <div className="nominal-right">
              <div className="remaining-lbl">Sisa Tagihan</div>
              <div className="remaining-val" contentEditable suppressContentEditableWarning>
                {sisaTagihan}
              </div>
            </div>
          </div>
        </div>

        {/* INVOICE REF */}
        <div className="ref-section">
          <div className="ref-box">
            <div className="ref-icon">📄</div>
            <div>
              <div className="ref-info-lbl">Nomor Invoice yang Dirujuk</div>
              <div className="ref-info-val" contentEditable suppressContentEditableWarning>
                SFI/{getTodayDate()}/001
              </div>
            </div>
            <div className="ref-meta">
              <div className="ref-meta-lbl">Nilai Total Invoice</div>
              <div className="ref-meta-val" contentEditable suppressContentEditableWarning>
                {nilaiTotal}
              </div>
            </div>
            <div className="ref-meta" style={{ marginLeft: 24 }}>
              <div className="ref-meta-lbl">Tanggal Invoice</div>
              <div className="ref-meta-val" contentEditable suppressContentEditableWarning>
                {getTodayLongDate()}
              </div>
            </div>
          </div>
        </div>

        {/* LEGAL NOTICE */}
        <div className="legal-section">
          <div className="legal-box">
            <div className="legal-icon">⚖️</div>
            <div>
              <div className="legal-title">Pernyataan Bukti Pembayaran Sah</div>
              <div className="legal-body">
                Dokumen ini merupakan <strong>bukti pembayaran yang sah</strong>{" "}
                dari SkyFlowID sesuai dengan transaksi yang tercatat di atas.
                Dengan melakukan pembayaran kepada SkyFlowID,{" "}
                <strong>
                  Klien dinyatakan telah membaca, memahami, dan menyetujui seluruh
                  Syarat &amp; Ketentuan SkyFlowID
                </strong>
                , termasuk namun tidak terbatas pada ketentuan revisi,
                maintenance, jadwal pengerjaan, dan hak kekayaan intelektual.
              </div>
            </div>
          </div>
        </div>

        {/* SIGNATURE */}
        <div className="sig-section">
          <div className="sig-inner">
            <div className="sig-block" style={{ width: 260, flexShrink: 0 }}>
              <h3>Tanda Tangan Penerima</h3>
              <div className="sig-canvas-wrap" ref={sig.wrapRef} style={{ height: 90 }}>
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
                  style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)", marginTop: 3 }}
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
                  SkyFlowID · {getTodayLongDate()}
                </div>
              </div>
            </div>
            <div className="sig-note">
              <h3>Keterangan Tambahan</h3>
              <div
                style={{ fontSize: 12, color: "var(--ink2)", lineHeight: 1.8 }}
                contentEditable
                suppressContentEditableWarning
              >
                Pembayaran telah diterima dan dikonfirmasi.
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="footer-band">
          <div className="footer-text">
            Terima kasih atas kepercayaan Anda kepada SkyFlowID.
            <br />
            Simpan dokumen ini sebagai bukti pembayaran resmi Anda.
          </div>
          <div className="footer-brand">
            <span>SkyFlowID</span>
          </div>
        </div>
      </div>
    </div>
  );
}
