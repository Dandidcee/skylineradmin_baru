import { useState, useEffect } from "react";
import { useSignature, getTodayDate, getTodayLongDate } from "./use-signature";
import { getClients } from "@/services/client-service";
import { generateDocument, createDocumentSnapshot } from "@/services/document-service";
import { toastManager } from "@/components/ui/toast";
import "./template.css";

const ARTICLES: { title: string; body: React.ReactNode }[] = [
  {
    title: "Pasal 1 - Ruang Lingkup Pekerjaan",
    body: (
      <ol>
        <li>Pihak Pertama akan menyediakan layanan sesuai dengan proposal, quotation, invoice, atau dokumen penawaran yang telah disetujui oleh Pihak Kedua.</li>
        <li>Ruang lingkup pekerjaan dapat berupa pembuatan website, chatbot, sistem AI, automasi bisnis, workflow N8N, integrasi API, dashboard, database, atau layanan teknologi lainnya yang telah disepakati.</li>
        <li>Permintaan di luar ruang lingkup yang telah disetujui akan dianggap sebagai pekerjaan tambahan dan dapat dikenakan biaya tambahan sesuai kesepakatan bersama.</li>
      </ol>
    ),
  },
  {
    title: "Pasal 2 - Pembayaran",
    body: (
      <ol>
        <li>Nilai pekerjaan mengacu pada invoice atau quotation yang telah disetujui.</li>
        <li>Pihak Kedua wajib membayar Down Payment (DP) minimal <span className="editable-inline" contentEditable suppressContentEditableWarning>50%</span> sebelum pekerjaan dimulai.</li>
        <li>Sisa pembayaran wajib dilunasi maksimal <span className="editable-inline" contentEditable suppressContentEditableWarning>7 (tujuh)</span> hari kerja setelah pekerjaan selesai dan diserahterimakan.</li>
        <li>Apabila terjadi keterlambatan pembayaran lebih dari <span className="editable-inline" contentEditable suppressContentEditableWarning>14</span> hari, Pihak Pertama berhak menghentikan layanan atau dukungan sementara sampai pembayaran diselesaikan.</li>
      </ol>
    ),
  },
  {
    title: "Pasal 3 - Kewajiban Pihak Kedua",
    body: (
      <ol>
        <li>Pihak Kedua wajib menyediakan data, akses akun, API Key, dokumen, dan informasi lain yang dibutuhkan untuk pengerjaan proyek.</li>
        <li>Keterlambatan pemberian akses atau informasi dapat menyebabkan perubahan jadwal pengerjaan.</li>
        <li>Pihak Kedua bertanggung jawab atas keakuratan data dan informasi yang diberikan.</li>
      </ol>
    ),
  },
  {
    title: "Pasal 4 - Revisi dan Maintenance",
    body: (
      <ol>
        <li>Pihak Kedua berhak mendapatkan maksimal <span className="editable-inline font-bold text-primary" contentEditable suppressContentEditableWarning>3 (tiga)</span> kali revisi setelah tahap serah terima awal.</li>
        <li>Revisi hanya berlaku untuk fitur dan kebutuhan yang termasuk dalam ruang lingkup pekerjaan yang telah disepakati.</li>
        <li>Revisi harus diajukan maksimal <span className="editable-inline" contentEditable suppressContentEditableWarning>14 (empat belas)</span> hari kalender setelah serah terima.</li>
        <li>Penambahan fitur baru atau perubahan konsep utama tidak termasuk revisi dan dapat dikenakan biaya tambahan.</li>
        <li>Pihak Pertama memberikan maintenance gratis selama <span className="editable-inline font-bold" contentEditable suppressContentEditableWarning>30 (tiga puluh)</span> hari kalender sejak tanggal serah terima.</li>
        <li>Maintenance hanya mencakup perbaikan bug atau error yang berasal dari pekerjaan Pihak Pertama.</li>
        <li>Maintenance tidak mencakup biaya VPS, hosting, domain, API, layanan AI, atau layanan pihak ketiga lainnya.</li>
      </ol>
    ),
  },
  {
    title: "Pasal 5 - Penundaan dan Pembatalan Proyek",
    body: (
      <ol>
        <li>Apabila Pihak Kedua tidak memberikan tanggapan selama lebih dari <span className="editable-inline" contentEditable suppressContentEditableWarning>30 (tiga puluh)</span> hari kalender sejak komunikasi terakhir, proyek dianggap ditunda oleh Pihak Kedua.</li>
        <li>Apabila proyek dibatalkan oleh Pihak Kedua setelah pekerjaan dimulai, pembayaran yang telah dilakukan tidak dapat diminta kembali.</li>
        <li>Apabila proyek tidak dapat diselesaikan karena kesalahan dari Pihak Pertama, maka Pihak Pertama akan mengembalikan pembayaran yang telah diterima.</li>
        <li>Pengembalian dana tidak mencakup biaya yang sudah dikeluarkan dan tidak dapat dikembalikan seperti domain, hosting, VPS, API, lisensi software, layanan AI, atau layanan pihak ketiga lainnya yang telah disetujui oleh Pihak Kedua.</li>
        <li>Pihak Pertama wajib memberikan bukti transaksi apabila diminta oleh Pihak Kedua.</li>
      </ol>
    ),
  },
  {
    title: "Pasal 6 - Layanan dan Biaya Pihak Ketiga",
    body: (
      <ol>
        <li>Biaya layanan pihak ketiga seperti VPS, hosting, domain, WhatsApp API, OpenAI API, cloud service, database, email service, dan layanan lainnya menjadi tanggung jawab Pihak Kedua kecuali disepakati lain.</li>
        <li>Pihak Pertama tidak bertanggung jawab atas perubahan harga, gangguan layanan, suspend akun, atau perubahan kebijakan dari penyedia layanan pihak ketiga.</li>
      </ol>
    ),
  },
  {
    title: "Pasal 7 - Hak Penggunaan dan Kepemilikan",
    body: (
      <ol>
        <li>Setelah seluruh pembayaran diselesaikan, Pihak Kedua berhak menggunakan sistem untuk kebutuhan bisnisnya tanpa batas waktu.</li>
        <li>Pihak Kedua dapat melakukan pengembangan lanjutan sendiri atau melalui pihak lain.</li>
        <li>Workflow, template, framework, metodologi, komponen reusable, dokumentasi internal, dan aset pengembangan milik Pihak Pertama tetap menjadi milik Pihak Pertama.</li>
        <li>Pihak Kedua tidak diperkenankan menjual ulang, menyewakan, mendistribusikan, atau menjadikan hasil pekerjaan sebagai produk komersial tanpa persetujuan tertulis dari Pihak Pertama.</li>
      </ol>
    ),
  },
  {
    title: "Pasal 8 - Kerahasiaan",
    body: (
      <ol>
        <li>Kedua belah pihak sepakat menjaga kerahasiaan data, dokumen, akses akun, source code, dan informasi bisnis yang diperoleh selama proyek berlangsung.</li>
        <li>Informasi tersebut tidak boleh dibagikan kepada pihak lain tanpa persetujuan dari pihak yang bersangkutan.</li>
      </ol>
    ),
  },
  {
    title: "Pasal 9 - Batas Tanggung Jawab",
    body: (
      <ol>
        <li>Pihak Pertama akan mengerjakan proyek sesuai kesepakatan dan standar profesional yang wajar.</li>
        <li>Setelah tahap testing, UAT, dan serah terima selesai dilakukan, penggunaan sistem menjadi tanggung jawab Pihak Kedua.</li>
        <li>Pihak Pertama tidak bertanggung jawab atas kerugian bisnis, kehilangan pelanggan, kehilangan keuntungan, atau kerugian tidak langsung lainnya yang timbul dari penggunaan sistem.</li>
      </ol>
    ),
  },
  {
    title: "Pasal 10 - Kepemilikan Akun dan Akses",
    body: (
      <ol>
        <li>Setelah serah terima dilakukan, akun, password, API Key, token akses, dan kredensial lainnya menjadi tanggung jawab Pihak Kedua.</li>
        <li>Pihak Pertama tidak bertanggung jawab atas kehilangan akses, perubahan konfigurasi, atau penghapusan data yang terjadi setelah serah terima.</li>
      </ol>
    ),
  },
  {
    title: "Pasal 11 - Keadaan Di Luar Kendali",
    body: (
      <ol>
        <li>Keterlambatan atau gangguan yang disebabkan oleh bencana alam, gangguan internet, gangguan pusat data, kebijakan pemerintah, gangguan layanan pihak ketiga, atau keadaan lain di luar kendali Para Pihak tidak dianggap sebagai pelanggaran Perjanjian.</li>
      </ol>
    ),
  },
  {
    title: "Pasal 12 - Portofolio",
    body: (
      <ol>
        <li>Pihak Pertama berhak menampilkan nama perusahaan, logo, dan gambaran umum proyek sebagai portofolio.</li>
        <li>Data rahasia, source code, API Key, dan informasi sensitif lainnya tidak akan dipublikasikan tanpa izin dari Pihak Kedua.</li>
      </ol>
    ),
  },
  {
    title: "Pasal 13 - Penyelesaian Perselisihan",
    body: (
      <ol>
        <li>Apabila terjadi permasalahan atau perbedaan pendapat, Para Pihak sepakat untuk menyelesaikannya terlebih dahulu melalui komunikasi dan musyawarah secara baik-baik.</li>
        <li>Apabila tidak ditemukan kesepakatan, Para Pihak dapat menempuh jalur hukum sesuai peraturan yang berlaku di Indonesia.</li>
      </ol>
    ),
  },
  {
    title: "Pasal 14 - Persetujuan",
    body: (
      <p>
        Dengan menandatangani Perjanjian ini, Para Pihak menyatakan telah membaca, memahami, dan menyetujui seluruh isi Perjanjian serta bersedia menjalankan hak dan kewajiban masing-masing dengan itikad baik.
      </p>
    ),
  },
];

export function AgreementTemplate() {
  const sig1 = useSignature();
  const sig2 = useSignature();

  const [clients, setClients] = useState<any[]>([]);
  const [selectedClientId, setSelectedClientId] = useState("");

  const [clientCompany, setClientCompany] = useState("Nama Perusahaan Klien");
  const [clientDetail, setClientDetail] = useState("Alamat Lengkap Klien, Kota, Kode Pos. Diwakili oleh: Nama PIC Klien. Selaku: Jabatan PIC.");
  const [clientPic, setClientPic] = useState("Nama PIC Klien");

  useEffect(() => {
    getClients().then(setClients);
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
        setClientDetail(`${address} · ${phone}. Diwakili oleh: ${client.name || "Nama PIC"}`);
        setClientPic(client.name || "Nama PIC Klien");
      }
    }
  }, [selectedClientId, clients]);

  const [isSaving, setIsSaving] = useState(false);
  const docNo = `SFI-AGR/${getTodayDate()}/001`;

  const handleSaveAndPrint = async () => {
    setIsSaving(true);
    try {
      const snap = createDocumentSnapshot(docNo);
      await generateDocument({
        title: docNo,
        template: "Agreement",
        projectId: undefined,
        clientId: selectedClientId || undefined,
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

  return (
    <div className="skyflow-doc">
      {/* TOOLBAR */}
      <div className="tpl-toolbar" style={{ justifyContent: "flex-end", gap: "12px" }}>
        <select 
          className="tpl-btn no-print bg-background text-text" 
          style={{ padding: "5px 12px", border: "1px solid var(--border)" }}
          value={selectedClientId}
          onChange={e => setSelectedClientId(e.target.value)}
        >
          <option value="">-- Pilih Client --</option>
          {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <button 
          className="tpl-btn tpl-btn-fill no-print" 
          onClick={handleSaveAndPrint}
          disabled={isSaving}
        >
          {isSaving ? "Menyimpan..." : "↓ PDF / Cetak"}
        </button>
      </div>

      <div className="paper">
        {/* HEADER */}
        <div className="hdr">
          <div className="hdr-lines" />
          <div className="hdr-inner center">
            <div className="logo-area">
              <span className="brand-name">SkyFlowID</span>
              <div className="brand-tagline">Solusi Kecerdasan Buatan</div>
            </div>
            <div className="doc-label">
              <h1 className="sm">Perjanjian Kerja</h1>
              <div className="doc-sub" contentEditable suppressContentEditableWarning>
                No: SFI-AGR/{getTodayDate()}/001
              </div>
            </div>
          </div>
        </div>

        <div className="g-rule" />

        <div className="content-body">
          <div className="intro">
            Perjanjian Kerja Sama ini ("Perjanjian") dibuat dan ditandatangani
            pada tanggal{" "}
            <span className="editable-inline" contentEditable suppressContentEditableWarning>
              {getTodayLongDate()}
            </span>
            , oleh dan antara:
          </div>

          <div className="party-box">
            <div className="party-blk">
              <h3>Pihak Pertama (Penyedia Layanan)</h3>
              <div className="company">SkyFlowID</div>
              <div className="detail" contentEditable suppressContentEditableWarning>
                Jl. Wiradisastra, Kp Cipurut, Mandalagiri, Kab. Tasikmalaya 46464.
                Diwakili oleh: Dandi Cahyaman. Selaku: Tim.
              </div>
            </div>
            <div className="party-blk">
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

          <div className="intro">
            Pihak Pertama dan Pihak Kedua selanjutnya secara bersama-sama disebut
            sebagai <strong>"Para Pihak"</strong> dan masing-masing disebut{" "}
            <strong>"Pihak"</strong>. Para Pihak dengan ini menerangkan dan
            sepakat atas syarat dan ketentuan sebagai berikut:
          </div>

          <div className="section-title">Syarat dan Ketentuan</div>

          {ARTICLES.map((art) => (
            <div className="article" key={art.title}>
              <h4>{art.title}</h4>
              {art.body}
            </div>
          ))}
        </div>

        <div className="page-break" />

        {/* SIGNATURES */}
        <div className="sig-section">
          <div className="sig-block">
            <h3>Pihak Pertama</h3>
            <div className="sig-canvas-wrap" ref={sig1.wrapRef}>
              <canvas ref={sig1.canvasRef} />
              {!sig1.hasSignature && (
                <div className="sig-hint">
                  Tanda tangani di sini
                  <br />
                  <span style={{ fontSize: 10 }}>klik & geser</span>
                </div>
              )}
            </div>
            <div className="sig-ctrl no-print">
              <button className="sig-btn" onClick={sig1.clear}>
                Hapus
              </button>
            </div>
            <div className="sig-name-wrap">
              <div className="name" contentEditable suppressContentEditableWarning>
                Dandi Cahyaman
              </div>
              <div className="title" contentEditable suppressContentEditableWarning>
                Tim SkyFlowID
              </div>
            </div>
          </div>

          <div className="sig-block">
            <h3>Pihak Kedua</h3>
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
              <div 
                className="name" 
                contentEditable 
                suppressContentEditableWarning
                onBlur={(e) => setClientPic(e.currentTarget.textContent || "")}
              >
                {clientPic}
              </div>
              <div className="title" contentEditable suppressContentEditableWarning>
                Jabatan / Posisi
              </div>
            </div>
          </div>
        </div>

        <div className="footer-band">
          <div className="footer-text">
            Dokumen ini merupakan perjanjian sah dan mengikat secara hukum antara
            SkyFlowID dan Klien.
            <br />
            Dilengkapi dengan otentikasi tanda tangan digital.
          </div>
          <div className="footer-brand">
            <span>SkyFlowID</span>
          </div>
        </div>
      </div>
    </div>
  );
}
