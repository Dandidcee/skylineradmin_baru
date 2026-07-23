import { useState, useEffect } from "react";
import { useSignature, getTodayDate, getTodayLongDate } from "./use-signature";
import { getClients } from "@/services/client-service";
import { generateDocument, createDocumentSnapshot } from "@/services/document-service";
import { toastManager } from "@/components/ui/toast";
import "./template.css";

const ARTICLES: { title: string; body: React.ReactNode }[] = [
  {
    title: "PASAL 1 - DEFINISI",
    body: (
      <>
        <p>Kecuali secara tegas ditentukan lain, istilah-istilah dalam Perjanjian ini memiliki pengertian sebagai berikut:</p>
        <ol>
          <li><strong>“Sistem”</strong> adalah alur kerja otomasi (automation workflow), integrasi, chatbot, dan/atau konfigurasi berbasis N8N maupun perangkat/aplikasi pendukung lainnya yang dikembangkan oleh Penyedia Jasa untuk Klien sesuai dengan ruang lingkup dalam Perjanjian ini.</li>
          <li><strong>“Implementation Plan”</strong> adalah dokumen tertulis yang memuat rincian kebutuhan, fitur, alur kerja, integrasi, tampilan, dan/atau fungsi Sistem yang telah dibahas, disetujui, dan ditandatangani oleh Para Pihak, dan merupakan satu kesatuan yang tidak terpisahkan dari Perjanjian ini.</li>
          <li><strong>“Maintenance”</strong> adalah layanan pemeliharaan Sistem sebagaimana diatur dalam Pasal 10 Perjanjian ini.</li>
          <li><strong>“Hari Kerja”</strong> adalah hari Senin sampai dengan Jumat, tidak termasuk hari libur nasional yang ditetapkan oleh Pemerintah Republik Indonesia.</li>
        </ol>
      </>
    ),
  },
  {
    title: "PASAL 2 - RUANG LINGKUP PEKERJAAN",
    body: (
      <ol>
        <li>Penyedia Jasa akan mengembangkan Sistem sesuai dengan kebutuhan yang telah dibahas dan disepakati bersama oleh Para Pihak.</li>
        <li>Ruang lingkup pekerjaan mengacu sepenuhnya dan secara eksklusif pada dokumen Implementation Plan yang telah disetujui dan ditandatangani oleh Para Pihak.</li>
        <li>Seluruh fitur, alur kerja, integrasi, tampilan (user interface), maupun fungsi Sistem yang tidak tercantum secara tertulis dalam Implementation Plan dinyatakan berada di luar ruang lingkup pekerjaan dan tidak menjadi kewajiban Penyedia Jasa untuk mengerjakannya tanpa kesepakatan tambahan.</li>
        <li>Setiap permintaan tambahan, perubahan alur bisnis, perubahan desain, penambahan modul, maupun perubahan lain yang diajukan setelah Implementation Plan disetujui akan diperlakukan sebagai pekerjaan baru di luar Perjanjian ini (<strong>“Pekerjaan Tambahan”</strong>), dan akan dikenakan biaya serta jangka waktu pengerjaan tersendiri sesuai penawaran tertulis yang disepakati Para Pihak sebelum pengerjaan Pekerjaan Tambahan dimulai.</li>
        <li>Penyedia Jasa berhak menolak mengerjakan permintaan yang berada di luar ruang lingkup Implementation Plan apabila belum ada kesepakatan tertulis mengenai biaya dan jangka waktu Pekerjaan Tambahan tersebut.</li>
      </ol>
    ),
  },
  {
    title: "PASAL 3 - JANGKA WAKTU PERJANJIAN",
    body: (
      <ol>
        <li>Perjanjian ini berlaku efektif sejak tanggal ditandatangani oleh Para Pihak sampai dengan Sistem diserahterimakan dan diterima oleh Klien, kecuali diperpanjang atau diakhiri lebih awal sesuai ketentuan dalam Perjanjian ini.</li>
        <li>Estimasi jangka waktu pengerjaan mengacu pada jadwal yang tercantum dalam Implementation Plan, dan bersifat estimasi yang dapat berubah sesuai dengan Pasal 4 ayat (3) Perjanjian ini.</li>
        <li>Apabila Para Pihak sepakat untuk melanjutkan hubungan kerja sama dalam bentuk Maintenance sebagaimana diatur dalam Pasal 10, maka ketentuan mengenai Maintenance akan diatur dalam kesepakatan atau lampiran tersendiri, termasuk jangka waktu dan biayanya.</li>
      </ol>
    ),
  },
  {
    title: "PASAL 4 - PELAKSANAAN PEKERJAAN",
    body: (
      <ol>
        <li>Penyedia Jasa melaksanakan pekerjaan sesuai ruang lingkup yang telah disepakati dalam Implementation Plan dengan itikad baik dan sesuai dengan standar keahlian yang berlaku pada bidang pengembangan sistem.</li>
        <li>Klien berkewajiban memberikan data, informasi, akses, akun, materi, keputusan, maupun kebutuhan lain yang diperlukan Penyedia Jasa selama proses pengembangan, dalam jangka waktu yang wajar sesuai permintaan Penyedia Jasa.</li>
        <li>Keterlambatan pemberian data, informasi, akses, persetujuan, maupun keputusan oleh Klien dapat mengakibatkan penyesuaian jadwal penyelesaian proyek, dan penyesuaian tersebut tidak dapat dianggap sebagai wanprestasi atau keterlambatan yang disebabkan oleh Penyedia Jasa.</li>
        <li>Apabila keterlambatan sebagaimana dimaksud pada ayat (3) berlangsung lebih dari tiga puluh (30) hari kalender tanpa tanggapan dari Klien, Penyedia Jasa berhak menghentikan sementara pekerjaan sampai dengan data, informasi, atau persetujuan yang diperlukan diterima, tanpa mengurangi hak Penyedia Jasa atas pembayaran yang telah menjadi haknya.</li>
      </ol>
    ),
  },
  {
    title: "PASAL 5 - BIAYA DAN TATA CARA PEMBAYARAN",
    body: (
      <ol>
        <li>
          Total biaya pengerjaan Sistem sesuai ruang lingkup dalam Implementation Plan adalah sebesar Rp<span className="editable-inline" contentEditable suppressContentEditableWarning>[jumlah]</span> (<span className="editable-inline" contentEditable suppressContentEditableWarning>[jumlah dalam huruf]</span>), belum termasuk pajak yang berlaku apabila ada, yang dibayarkan oleh Klien kepada Penyedia Jasa sesuai skema pembayaran berikut:
          <ul style={{ listStyleType: "disc", paddingLeft: "20px", marginTop: "4px" }}>
            <li>Termin 1 (Uang Muka): sebesar <span className="editable-inline" contentEditable suppressContentEditableWarning>[%]</span> dari total biaya, dibayarkan pada saat penandatanganan Perjanjian ini dan sebelum pekerjaan dimulai;</li>
            <li>Termin 2: sebesar <span className="editable-inline" contentEditable suppressContentEditableWarning>[%]</span> dari total biaya, dibayarkan pada saat <span className="editable-inline" contentEditable suppressContentEditableWarning>[milestone/progres tertentu]</span>;</li>
            <li>Termin 3 (Pelunasan): sebesar <span className="editable-inline" contentEditable suppressContentEditableWarning>[%]</span> dari total biaya, dibayarkan pada saat Sistem selesai dan siap diserahterimakan, sebelum atau bersamaan dengan serah terima akses penuh kepada Klien.</li>
          </ul>
        </li>
        <li>Pembayaran dilakukan melalui transfer ke rekening yang ditunjuk oleh Penyedia Jasa, dan dianggap sah setelah dana diterima secara efektif pada rekening tersebut.</li>
        <li>Apabila Klien tidak melakukan pembayaran sesuai jadwal yang disepakati, Penyedia Jasa berhak untuk: (a) menghentikan sementara pekerjaan sampai dengan pembayaran diterima; (b) mengenakan denda keterlambatan sebesar <span className="editable-inline" contentEditable suppressContentEditableWarning>[%]</span> per minggu dari jumlah tertunggak, dengan maksimal denda <span className="editable-inline" contentEditable suppressContentEditableWarning>[%]</span>; dan/atau (c) mengakhiri Perjanjian secara sepihak sesuai Pasal 17 apabila keterlambatan pembayaran berlangsung lebih dari <span className="editable-inline" contentEditable suppressContentEditableWarning>[30]</span> hari kalender sejak tanggal jatuh tempo.</li>
        <li>Seluruh pembayaran yang telah diterima Penyedia Jasa atas pekerjaan yang telah dilaksanakan tidak dapat ditarik kembali (non-refundable), kecuali diperjanjikan lain secara tertulis oleh Para Pihak.</li>
        <li>Segala biaya administrasi bank, biaya transfer antarbank, maupun biaya lain yang timbul dari proses pembayaran menjadi tanggung jawab Klien.</li>
      </ol>
    ),
  },
  {
    title: "PASAL 6 - KERAHASIAAN DATA",
    body: (
      <ol>
        <li>Penyedia Jasa wajib menjaga kerahasiaan seluruh data, informasi, dokumen, maupun akses milik Klien yang diperoleh selama pelaksanaan pekerjaan, dan hanya menggunakannya untuk keperluan pelaksanaan Perjanjian ini.</li>
        <li>Penyedia Jasa tidak akan menggunakan, memperbanyak, membagikan, maupun memberikan data Klien kepada pihak lain tanpa persetujuan tertulis dari Klien, kecuali diwajibkan oleh peraturan perundang-undangan yang berlaku atau perintah instansi yang berwenang.</li>
        <li>Klien juga wajib menjaga kerahasiaan source code, arsitektur sistem, konfigurasi sistem, dokumentasi teknis, metodologi kerja, maupun informasi teknis lain milik Penyedia Jasa yang bersifat rahasia, dan tidak akan mengungkapkannya kepada pihak ketiga tanpa persetujuan tertulis dari Penyedia Jasa.</li>
        <li>Kewajiban menjaga kerahasiaan sebagaimana diatur dalam Pasal ini tetap berlaku dan mengikat Para Pihak meskipun Perjanjian ini telah berakhir atau diakhiri, untuk jangka waktu <span className="editable-inline" contentEditable suppressContentEditableWarning>[2 (dua)]</span> tahun sejak berakhirnya Perjanjian.</li>
        <li>Ketentuan kerahasiaan dalam Pasal ini tidak berlaku terhadap informasi yang: (a) telah menjadi milik umum bukan karena kesalahan Pihak yang menerima informasi; (b) telah dimiliki secara sah oleh Pihak penerima sebelum diungkapkan; atau (c) wajib diungkapkan berdasarkan ketentuan hukum atau perintah pengadilan/instansi berwenang.</li>
      </ol>
    ),
  },
  {
    title: "PASAL 7 - HAK KEKAYAAN INTELEKTUAL",
    body: (
      <ol>
        <li>Seluruh hak kekayaan intelektual atas source code, desain, arsitektur, metodologi, tools, library, maupun komponen yang dikembangkan sendiri oleh Penyedia Jasa sebelum atau selama pelaksanaan pekerjaan (<strong>“Background IP”</strong>) tetap menjadi milik Penyedia Jasa.</li>
        <li>Hak kekayaan intelektual atas Sistem yang dikembangkan secara khusus untuk Klien berdasarkan Implementation Plan (<strong>“Deliverable”</strong>) akan beralih kepada Klien setelah seluruh kewajiban pembayaran sebagaimana diatur dalam Pasal 5 dilunasi secara penuh oleh Klien.</li>
        <li>Sebelum pelunasan penuh dilakukan, hak kekayaan intelektual atas Deliverable tetap menjadi milik Penyedia Jasa, dan Klien hanya diberikan akses untuk keperluan pengujian (testing/UAT).</li>
        <li>Peralihan hak sebagaimana dimaksud pada ayat (2) tidak termasuk Background IP milik Penyedia Jasa, di mana atas Background IP tersebut Klien diberikan lisensi non-eksklusif untuk digunakan sebagai bagian dari Sistem selama Sistem digunakan oleh Klien.</li>
        <li>Penyedia Jasa berhak mencantumkan nama, logo, dan/atau menyebutkan proyek ini sebagai bagian dari portofolio, kecuali disepakati lain secara tertulis oleh Klien karena alasan kerahasiaan.</li>
      </ol>
    ),
  },
  {
    title: "PASAL 9 - REVISI DAN PERUBAHAN",
    body: (
      <ol>
        <li>Revisi hanya berlaku untuk penyesuaian terhadap fitur yang telah tercantum dalam Implementation Plan, dan diberikan sebanyak <span className="editable-inline" contentEditable suppressContentEditableWarning>[jumlah]</span> kali putaran revisi tanpa biaya tambahan.</li>
        <li>Permintaan revisi di luar jumlah yang disebutkan pada ayat (1), perubahan konsep, perubahan alur bisnis, perubahan kebutuhan operasional, maupun penambahan fitur setelah pekerjaan berjalan dianggap sebagai Pekerjaan Tambahan sebagaimana dimaksud dalam Pasal 2 ayat (4).</li>
        <li>Pekerjaan Tambahan akan dibuatkan estimasi biaya dan waktu pengerjaan tersendiri, dan baru akan dikerjakan setelah disetujui secara tertulis oleh Klien.</li>
      </ol>
    ),
  },
  {
    title: "PASAL 10 - MAINTENANCE",
    body: (
      <ol>
        <li>Maintenance merupakan layanan pemeliharaan Sistem agar fungsi yang telah disepakati dalam Implementation Plan tetap berjalan sebagaimana mestinya.</li>
        <li>
          Maintenance hanya mencakup:
          <ul style={{ listStyleType: "disc", paddingLeft: "20px", marginTop: "4px" }}>
            <li>perbaikan bug pada Sistem yang dikembangkan;</li>
            <li>perbaikan kesalahan fungsi yang tidak sesuai dengan ruang lingkup proyek dalam Implementation Plan;</li>
            <li>pemeriksaan apabila terjadi gangguan pada Sistem; dan</li>
            <li>penyesuaian minor yang diperlukan agar Sistem tetap berjalan sesuai fungsi awal.</li>
          </ul>
        </li>
        <li>
          Maintenance tidak mencakup:
          <ul style={{ listStyleType: "disc", paddingLeft: "20px", marginTop: "4px" }}>
            <li>penambahan fitur;</li>
            <li>perubahan tampilan (UI/UX);</li>
            <li>perubahan alur bisnis;</li>
            <li>integrasi baru dengan layanan atau sistem lain;</li>
            <li>perubahan struktur database;</li>
            <li>migrasi sistem, server, atau penyedia layanan;</li>
            <li>perubahan besar akibat perubahan kebijakan atau layanan pihak ketiga; dan</li>
            <li>pengembangan modul baru.</li>
          </ul>
        </li>
        <li>Seluruh pekerjaan yang tidak termasuk dalam cakupan Maintenance sebagaimana ayat (2) akan dikenakan biaya tambahan berdasarkan penawaran tertulis yang disepakati Para Pihak sebelum pekerjaan dimulai.</li>
        <li>Layanan Maintenance diberikan sepanjang Klien telah melunasi biaya Maintenance yang disepakati; keterlambatan atau tidak dibayarnya biaya Maintenance memberikan hak kepada Penyedia Jasa untuk menghentikan layanan Maintenance sampai dengan pembayaran diterima.</li>
      </ol>
    ),
  },
  {
    title: "PASAL 11 - DUKUNGAN TEKNIS",
    body: (
      <ol>
        <li>Penyedia Jasa tidak menyediakan layanan on-call maupun dukungan teknis selama dua puluh empat (24) jam penuh.</li>
        <li>Permintaan dukungan teknis ditangani pada Hari Kerja, dalam jam kerja normal, dan disesuaikan dengan ketersediaan Penyedia Jasa.</li>
        <li>Dalam keadaan cuti, perjalanan dinas, sakit, keadaan darurat, atau keperluan pribadi lainnya, penanganan permintaan dukungan dapat mengalami penundaan yang wajar hingga Penyedia Jasa kembali tersedia, dan hal tersebut tidak dapat dianggap sebagai wanprestasi.</li>
        <li>Penyedia Jasa akan memberikan upaya terbaik (best effort) dalam menangani setiap laporan gangguan sesuai ruang lingkup Maintenance, tanpa menjamin waktu penyelesaian tertentu kecuali disepakati lain secara tertulis dalam bentuk Service Level Agreement (SLA) terpisah.</li>
        <li>Penyedia Jasa berhak menetapkan dan memperbarui Standar Operasional Prosedur (SOP) layanan dukungan teknis dari waktu ke waktu sesuai kebutuhan operasional, termasuk namun tidak terbatas pada jam operasional, kanal komunikasi yang digunakan, target waktu respons, prioritas penanganan, dan mekanisme eskalasi.</li>
        <li>Pembaruan SOP sebagaimana dimaksud pada ayat (5) cukup diberitahukan secara tertulis kepada Klien (melalui pesan tertulis, surat elektronik, atau media lain yang disepakati) dan berlaku efektif sejak tanggal pemberitahuan tersebut, tanpa memerlukan penandatanganan adendum tersendiri.</li>
        <li>Pembaruan SOP sebagaimana dimaksud pada ayat (5) dan (6) bersifat operasional dan teknis semata, serta tidak dapat digunakan untuk mengubah ruang lingkup pekerjaan, biaya, kepemilikan hak kekayaan intelektual, maupun ketentuan pokok lain dalam Perjanjian ini, yang perubahannya tetap tunduk pada ketentuan Pasal 19 ayat (1).</li>
      </ol>
    ),
  },
  {
    title: "PASAL 12 - LAYANAN PIHAK KETIGA",
    body: (
      <ol>
        <li>Sistem dapat menggunakan dan/atau terintegrasi dengan layanan pihak ketiga, termasuk namun tidak terbatas pada WhatsApp Official API, N8N, WAHA, layanan Artificial Intelligence, VPS, domain, SSL, database, cloud service, maupun layanan pendukung lainnya.</li>
        <li>Gangguan, perubahan kebijakan, perubahan application programming interface (API), pembatasan layanan, penghentian layanan, kenaikan biaya, maupun gangguan operasional yang berasal dari pihak ketiga sepenuhnya berada di luar kendali dan tanggung jawab Penyedia Jasa.</li>
        <li>Penyedia Jasa akan membantu melakukan pemeriksaan, analisis, dan penyesuaian yang diperlukan apabila memungkinkan, namun tidak dapat menjamin waktu maupun kepastian penyelesaian apabila penyebab gangguan berasal dari pihak ketiga, dan setiap penyesuaian yang diperlukan akibat perubahan layanan pihak ketiga dapat dikenakan biaya tambahan sesuai Pasal 2 ayat (4).</li>
      </ol>
    ),
  },
  {
    title: "PASAL 13 - ARTIFICIAL INTELLIGENCE",
    body: (
      <ol>
        <li>Apabila Sistem menggunakan teknologi Artificial Intelligence (AI), maka teknologi tersebut digunakan sebagai alat bantu otomatisasi dan bukan sebagai pengganti penilaian manusia sepenuhnya.</li>
        <li>Klien memahami dan menyetujui bahwa AI tidak menjamin akurasi jawaban seratus persen (100%), dan kemungkinan timbulnya jawaban yang kurang tepat, tidak relevan, atau tidak sesuai harapan merupakan karakteristik yang melekat pada teknologi AI dan bukan merupakan cacat atau kesalahan Sistem.</li>
        <li>Penyedia Jasa tidak bertanggung jawab atas kerugian yang timbul akibat keluaran (output) AI yang tidak akurat, selama Sistem telah dikembangkan sesuai dengan ruang lingkup dan spesifikasi dalam Implementation Plan.</li>
        <li>Sistem dapat dirancang untuk mengalihkan percakapan kepada admin/manusia apabila diperlukan, sesuai desain dan mekanisme yang disepakati dalam Implementation Plan.</li>
      </ol>
    ),
  },
  {
    title: "PASAL 14 - BIAYA LAYANAN BERLANGGANAN PIHAK KETIGA",
    body: (
      <ol>
        <li>Seluruh biaya layanan berlangganan yang diperlukan untuk operasional Sistem menjadi tanggung jawab dan dibayarkan langsung oleh Klien kepada masing-masing penyedia layanan.</li>
        <li>
          Biaya sebagaimana dimaksud pada ayat (1) meliputi namun tidak terbatas pada:
          <ul style={{ listStyleType: "disc", paddingLeft: "20px", marginTop: "4px" }}>
            <li>server/VPS dan hosting;</li>
            <li>domain;</li>
            <li>sertifikat SSL berbayar apabila digunakan;</li>
            <li>N8N dan/atau WAHA;</li>
            <li>WhatsApp Official API beserta biaya percakapan sesuai kebijakan Meta;</li>
            <li>penyedia layanan Artificial Intelligence;</li>
            <li>database berbayar;</li>
            <li>cloud storage;</li>
            <li>email SMTP berbayar;</li>
            <li>monitoring service;</li>
            <li>backup service; dan</li>
            <li>layanan pihak ketiga lainnya yang digunakan dalam operasional Sistem.</li>
          </ul>
        </li>
        <li>Penyedia Jasa tidak menanggung biaya langganan awal maupun kenaikan harga layanan pihak ketiga sebagaimana dimaksud pada ayat (2).</li>
        <li>Apabila terjadi perubahan harga dari penyedia layanan pihak ketiga, seluruh penyesuaian biaya tersebut sepenuhnya menjadi tanggung jawab Klien, dan Penyedia Jasa hanya berkewajiban menginformasikan perubahan tersebut apabila mengetahuinya.</li>
        <li>Kelalaian Klien dalam membayar biaya layanan pihak ketiga yang mengakibatkan Sistem tidak dapat berfungsi bukan merupakan tanggung jawab maupun kesalahan Penyedia Jasa.</li>
      </ol>
    ),
  },
  {
    title: "PASAL 15 - BATAS TANGGUNG JAWAB",
    body: (
      <ol>
        <li>Penyedia Jasa tidak menjamin Sistem akan bebas dari gangguan (error-free) atau beroperasi tanpa henti (uninterrupted) selama digunakan.</li>
        <li>Penyedia Jasa tidak bertanggung jawab atas gangguan yang disebabkan oleh jaringan internet, aliran listrik, perangkat keras milik Klien, kesalahan penggunaan oleh Klien atau penggunanya, layanan pihak ketiga, maupun keadaan lain di luar kendali wajar Penyedia Jasa.</li>
        <li>Penyedia Jasa tidak bertanggung jawab atas kerugian usaha, kehilangan keuntungan, kehilangan data, kehilangan peluang bisnis, maupun kerugian tidak langsung, khusus, insidental, atau konsekuensial lainnya yang timbul akibat gangguan tersebut.</li>
        <li>Tanggung jawab Penyedia Jasa terbatas pada pelaksanaan pekerjaan sesuai ruang lingkup yang telah disepakati dalam Implementation Plan, dan dalam hal apa pun total tanggung jawab Penyedia Jasa kepada Klien berdasarkan Perjanjian ini tidak akan melebihi jumlah biaya yang telah dibayarkan oleh Klien kepada Penyedia Jasa berdasarkan Perjanjian ini.</li>
        <li>Klien setuju untuk membebaskan Penyedia Jasa dari segala tuntutan pihak ketiga yang timbul akibat penggunaan Sistem oleh Klien yang menyimpang dari tujuan dan ruang lingkup yang disepakati dalam Implementation Plan.</li>
      </ol>
    ),
  },
  {
    title: "PASAL 16 - FORCE MAJEURE",
    body: (
      <ol>
        <li>Yang dimaksud dengan keadaan memaksa (force majeure) dalam Perjanjian ini adalah kejadian di luar kemampuan dan kekuasaan wajar Para Pihak, termasuk namun tidak terbatas pada bencana alam, kebakaran, wabah penyakit, perang, huru-hara, kerusuhan, kebijakan pemerintah, pemadaman listrik massal, gangguan internet nasional, maupun kegagalan infrastruktur pihak ketiga yang bersifat luas.</li>
        <li>Pihak yang mengalami force majeure wajib memberitahukan Pihak lainnya secara tertulis selambat-lambatnya tujuh (7) Hari Kerja sejak terjadinya force majeure tersebut.</li>
        <li>Selama berlangsungnya force majeure, kewajiban Pihak yang terkena dampak ditangguhkan sepanjang berkaitan langsung dengan force majeure tersebut, dan tidak dapat dianggap sebagai wanprestasi.</li>
        <li>Apabila force majeure berlangsung lebih dari enam puluh (60) hari kalender berturut-turut, Para Pihak dapat merundingkan kelanjutan atau pengakhiran Perjanjian ini.</li>
      </ol>
    ),
  },
  {
    title: "PASAL 17 - PEMUTUSAN PERJANJIAN",
    body: (
      <ol>
        <li>Perjanjian ini dapat diakhiri sebelum Sistem selesai dikerjakan apabila disepakati bersama secara tertulis oleh Para Pihak.</li>
        <li>Penyedia Jasa berhak mengakhiri Perjanjian secara sepihak dengan pemberitahuan tertulis apabila: (a) Klien terlambat melakukan pembayaran lebih dari <span className="editable-inline" contentEditable suppressContentEditableWarning>[30]</span> hari kalender sejak jatuh tempo sebagaimana diatur dalam Pasal 5 ayat (3); (b) Klien tidak memberikan data, akses, atau persetujuan yang diperlukan dalam jangka waktu lebih dari <span className="editable-inline" contentEditable suppressContentEditableWarning>[60]</span> hari kalender sehingga pekerjaan tidak dapat dilanjutkan; atau (c) Klien menggunakan Sistem untuk tujuan yang melanggar hukum.</li>
        <li>Dalam hal Perjanjian diakhiri karena sebab sebagaimana dimaksud pada ayat (2), seluruh biaya yang telah dibayarkan oleh Klien untuk pekerjaan yang telah dilaksanakan tidak dapat ditarik kembali, dan Klien tetap wajib membayar seluruh pekerjaan yang telah diselesaikan oleh Penyedia Jasa sampai dengan tanggal pengakhiran, secara proporsional sesuai progres pekerjaan.</li>
        <li>Pengakhiran Perjanjian tidak menghapuskan kewajiban Para Pihak yang menurut sifatnya seharusnya tetap berlaku setelah berakhirnya Perjanjian, termasuk namun tidak terbatas pada kewajiban kerahasiaan sebagaimana diatur dalam Pasal 6 dan kewajiban pembayaran yang masih tertunggak.</li>
      </ol>
    ),
  },
  {
    title: "PASAL 18 - PENYELESAIAN SENGKETA",
    body: (
      <ol>
        <li>Apabila timbul perselisihan sehubungan dengan pelaksanaan Perjanjian ini, Para Pihak akan mengupayakan penyelesaian terlebih dahulu secara musyawarah untuk mencapai mufakat.</li>
        <li>Apabila penyelesaian secara musyawarah sebagaimana dimaksud pada ayat (1) tidak tercapai dalam jangka waktu tiga puluh (30) hari kalender sejak perselisihan timbul, maka Para Pihak sepakat untuk menyelesaikan perselisihan tersebut melalui Pengadilan Negeri <span className="editable-inline" contentEditable suppressContentEditableWarning>[nama kota]</span>, tanpa mengurangi hak Para Pihak untuk menempuh upaya hukum lain sesuai peraturan perundang-undangan yang berlaku.</li>
      </ol>
    ),
  },
  {
    title: "PASAL 19 - KETENTUAN LAIN-LAIN",
    body: (
      <ol>
        <li>Segala perubahan, penambahan, atau pembaruan terhadap Perjanjian ini hanya sah apabila dibuat secara tertulis dan ditandatangani oleh Para Pihak dalam bentuk adendum, dan menjadi satu kesatuan yang tidak terpisahkan dari Perjanjian ini.</li>
        <li>Apabila salah satu ketentuan dalam Perjanjian ini dinyatakan batal atau tidak dapat dilaksanakan berdasarkan hukum yang berlaku, maka ketentuan lain dalam Perjanjian ini tetap berlaku dan mengikat Para Pihak.</li>
        <li>Tidak digunakannya atau tertundanya suatu hak oleh salah satu Pihak berdasarkan Perjanjian ini tidak dapat diartikan sebagai pelepasan hak tersebut.</li>
        <li>Para Pihak tidak dapat mengalihkan sebagian atau seluruh hak dan kewajiban berdasarkan Perjanjian ini kepada pihak lain tanpa persetujuan tertulis terlebih dahulu dari Pihak lainnya.</li>
        <li>Perjanjian ini, beserta Implementation Plan dan lampiran-lampirannya, merupakan keseluruhan kesepakatan Para Pihak dan menggantikan segala perundingan, pernyataan, maupun kesepakatan sebelumnya, baik lisan maupun tertulis, mengenai pokok yang sama.</li>
      </ol>
    ),
  },
  {
    title: "PASAL 20 - PENUTUP",
    body: (
      <p>
        Dengan ditandatanganinya Perjanjian ini, Para Pihak menyatakan telah membaca, memahami, dan menyetujui seluruh isi Perjanjian ini tanpa adanya paksaan, tekanan, maupun pengaruh yang tidak sah dari pihak mana pun, dan Perjanjian ini dibuat dalam rangkap 2 (dua) asli yang masing-masing mempunyai kekuatan hukum yang sama, untuk dipegang oleh masing-masing Pihak.
      </p>
    ),
  },
];

export function AgreementTemplate() {
  const sig1 = useSignature("/signature.png");
  const sig2 = useSignature();

  const [clients, setClients] = useState<any[]>([]);
  const [selectedClientId, setSelectedClientId] = useState("");

  const [providerName, setProviderName] = useState("Dandi Cahyaman");
  const [providerTitle, setProviderTitle] = useState("Freelance N8N Automation Developer");
  const [providerAddress, setProviderAddress] = useState("Jl. Wiradisastra, Kp Cipurut, Mandalagiri, Kab. Tasikmalaya 46464");
  const [providerNik, setProviderNik] = useState("320612xxxxxx0001");

  const [teamMembers, setTeamMembers] = useState([
    { id: "tm-1", name: "Dandi Cahyaman", role: "Lead N8N Automation Developer" },
    { id: "tm-2", name: "Tim SkyFlowID", role: "Integration & System Specialist" },
  ]);

  const addTeamMember = () => {
    setTeamMembers((prev) => [
      ...prev,
      { id: String(Date.now()), name: "Nama Anggota Tim", role: "Peran / Jenis Pekerjaan" },
    ]);
  };

  const removeTeamMember = (id: string) => {
    setTeamMembers((prev) => prev.filter((m) => m.id !== id));
  };

  const updateTeamMember = (id: string, patch: Partial<{ name: string; role: string }>) => {
    setTeamMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...patch } : m))
    );
  };

  const [clientCompany, setClientCompany] = useState("[Nama Klien / Perusahaan Klien]");
  const [clientRole, setClientRole] = useState("[jabatan, jika mewakili badan usaha]");
  const [clientDetail, setClientDetail] = useState("[alamat]");
  const [clientPic, setClientPic] = useState("[Nama Klien]");

  useEffect(() => {
    getClients().then(setClients);
  }, []);

  useEffect(() => {
    if (selectedClientId) {
      const client = clients.find((c) => c.id === selectedClientId);
      if (client) {
        const cName = client.name;
        const cComp = client.company;
        if (cName && cComp) setClientCompany(`${cName} / ${cComp}`);
        else if (cName) setClientCompany(cName);
        else if (cComp) setClientCompany(cComp);
        else setClientCompany("[Nama Klien / Perusahaan Klien]");

        const address = client.address || "[alamat]";
        setClientDetail(address);
        setClientPic(client.name || "[Nama Klien]");
      }
    }
  }, [selectedClientId, clients]);

  const [docProj] = useState("001");
  const refFromUrl = new URLSearchParams(window.location.search).get("ref");

  const [isSaving, setIsSaving] = useState(false);
  const docNo = `SFI-AGR/${getTodayDate()}/${docProj}`;

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
        sizeKb: snap?.sizeKb,
      });
      window.print();
    } catch (err: any) {
      toastManager.error({ title: "Gagal", description: err.message || "Gagal menyimpan dokumen." });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="skyflow-doc">
      {/* TOOLBAR */}
      <div className="tpl-toolbar" style={{ justifyContent: "space-between", gap: "12px" }}>
        <div className="num-builder no-print">
          <label>Penanggung Jawab:</label>
          <input
            type="text"
            style={{ width: 160 }}
            value={providerName}
            placeholder="Nama Penanggung Jawab"
            onChange={(e) => setProviderName(e.target.value)}
          />
        </div>
        <div className="tpl-toolbar-right" style={{ display: "flex", gap: "12px" }}>
          <select
            className="tpl-btn no-print bg-background text-text"
            style={{ padding: "5px 12px", border: "1px solid var(--border)" }}
            value={selectedClientId}
            onChange={(e) => setSelectedClientId(e.target.value)}
          >
            <option value="">-- Pilih Client --</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <button
            className="tpl-btn tpl-btn-fill no-print"
            onClick={handleSaveAndPrint}
            disabled={isSaving}
          >
            {isSaving ? "Menyimpan..." : "↓ PDF / Cetak"}
          </button>
        </div>
      </div>

      <div className="paper">
        {/* HEADER */}
        <div className="hdr">
          <div className="hdr-lines" />
          <div className="hdr-inner center">
            <div className="logo-area">
              <img src="/LogoMain.png" alt="SkyFlow Logo" className="brand-logo" />
              <div className="brand-tagline">Solusi Kecerdasan Buatan</div>
            </div>
            <div className="doc-label">
              <h1 className="sm long-title">PERJANJIAN KERJA SAMA PENGEMBANGAN SISTEM</h1>
              <div className="doc-sub" contentEditable suppressContentEditableWarning>
                Nomor: SFI-AGR/{getTodayDate()}/001
              </div>
            </div>
          </div>
        </div>

        <div className="g-rule" />

        <div className="meta-row" style={{ gridTemplateColumns: "repeat(2, 1fr)", marginBottom: "32px" }}>
          <div>
            <div className="meta-lbl">Referensi Implementation Plan</div>
            <div className="meta-val" contentEditable suppressContentEditableWarning>
              {refFromUrl || `SFI-IMP/${getTodayDate()}/N8N-AUTO`}
            </div>
          </div>
          <div>
            <div className="meta-lbl">Tanggal Efektif</div>
            <div className="meta-val accent" contentEditable suppressContentEditableWarning>
              {getTodayLongDate()}
            </div>
          </div>
        </div>

        <div className="content-body">
          <div className="intro">
            Pada hari ini, <span className="editable-inline" contentEditable suppressContentEditableWarning>[hari]</span>, tanggal <span className="editable-inline" contentEditable suppressContentEditableWarning>[tanggal]</span> bulan <span className="editable-inline" contentEditable suppressContentEditableWarning>[bulan]</span> tahun <span className="editable-inline" contentEditable suppressContentEditableWarning>[tahun]</span>, bertempat di <span className="editable-inline" contentEditable suppressContentEditableWarning>[kota]</span>, para pihak yang bertanda tangan di bawah ini:
          </div>

          <div className="party-box" style={{ flexDirection: "column", gap: "16px" }}>
            <div className="party-blk" style={{ width: "100%" }}>
              <h3>1. PENYEDIA JASA / PIHAK PERTAMA</h3>
              <div className="detail" style={{ marginTop: "8px", lineHeight: "1.6", textAlign: "justify" }}>
                <strong>Nama:</strong>{" "}
                <span className="editable-inline" contentEditable suppressContentEditableWarning onBlur={(e) => setProviderName(e.currentTarget.textContent || "")}>{providerName}</span>, pekerjaan/profesi:{" "}
                <span className="editable-inline" contentEditable suppressContentEditableWarning onBlur={(e) => setProviderTitle(e.currentTarget.textContent || "")}>{providerTitle}</span> — dalam hal ini bertindak untuk dan atas nama diri sendiri (perorangan), beralamat di{" "}
                <span className="editable-inline" contentEditable suppressContentEditableWarning onBlur={(e) => setProviderAddress(e.currentTarget.textContent || "")}>{providerAddress}</span>, dengan Nomor Induk Kependudukan (NIK){" "}
                <span className="editable-inline" contentEditable suppressContentEditableWarning onBlur={(e) => setProviderNik(e.currentTarget.textContent || "")}>{providerNik}</span> selanjutnya disebut sebagai <strong>“PENYEDIA JASA”</strong> atau <strong>“PIHAK PERTAMA”</strong>.
              </div>
            </div>

            <div className="party-blk" style={{ width: "100%" }}>
              <h3>2. KLIEN / PIHAK KEDUA</h3>
              <div className="detail" style={{ marginTop: "8px", lineHeight: "1.6", textAlign: "justify" }}>
                <strong>Nama:</strong>{" "}
                <span className="editable-inline" contentEditable suppressContentEditableWarning onBlur={(e) => setClientCompany(e.currentTarget.textContent || "")}>{clientCompany}</span> — dalam hal ini bertindak untuk dan atas nama{" "}
                <span className="editable-inline" contentEditable suppressContentEditableWarning onBlur={(e) => setClientRole(e.currentTarget.textContent || "")}>{clientRole}</span>, berkedudukan di{" "}
                <span className="editable-inline" contentEditable suppressContentEditableWarning onBlur={(e) => setClientDetail(e.currentTarget.textContent || "")}>{clientDetail}</span>, selanjutnya disebut sebagai <strong>“KLIEN”</strong> atau <strong>“PIHAK KEDUA”</strong>.
              </div>
            </div>
          </div>

          <div className="intro" style={{ marginTop: "16px" }}>
            Penyedia Jasa dan Klien secara bersama-sama selanjutnya disebut sebagai <strong>“Para Pihak”</strong>, dan secara sendiri-sendiri disebut sebagai <strong>“Pihak”</strong>.
          </div>

          <div className="intro" style={{ marginTop: "12px" }}>
            Para Pihak dengan ini terlebih dahulu menerangkan hal-hal sebagai berikut:
            <ul style={{ listStyleType: "disc", paddingLeft: "24px", marginTop: "8px", marginBottom: "12px" }}>
              <li>bahwa Klien membutuhkan jasa pengembangan sistem sebagaimana diuraikan dalam dokumen Implementation Plan;</li>
              <li>bahwa Penyedia Jasa memiliki kemampuan dan kesediaan untuk melaksanakan pekerjaan tersebut;</li>
              <li>bahwa Para Pihak sepakat untuk menuangkan kesepakatan kerja sama tersebut ke dalam Perjanjian ini.</li>
            </ul>
            Berdasarkan hal-hal tersebut di atas, Para Pihak sepakat untuk mengikatkan diri dalam Perjanjian Kerja Sama Pengembangan Sistem (<strong>“Perjanjian”</strong>) dengan syarat dan ketentuan sebagai berikut:
          </div>

          {/* TEAM MEMBERS SECTION */}
          <div style={{ marginTop: "20px", padding: "12px 16px", border: "1px solid var(--ink5)", borderRadius: 8, background: "var(--ink6)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <strong style={{ fontSize: 13, color: "var(--ink)" }}>Tim Pelaksana & Tenaga Ahli Penyedia Jasa:</strong>
              <button
                className="tpl-btn tpl-btn-ghost no-print"
                style={{ fontSize: 11, padding: "2px 8px" }}
                onClick={addTeamMember}
              >
                ＋ Tambah Anggota Tim
              </button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "10px" }}>
              {teamMembers.map((m) => (
                <div
                  key={m.id}
                  style={{
                    padding: "8px 12px",
                    border: "1px solid var(--ink5)",
                    borderRadius: 6,
                    background: "white",
                    position: "relative"
                  }}
                >
                  <button
                    className="del-row-btn no-print"
                    style={{ position: "absolute", top: 4, right: 6, fontSize: 10 }}
                    title="Hapus anggota"
                    onClick={() => removeTeamMember(m.id)}
                  >
                    ✕
                  </button>
                  <div
                    style={{ fontWeight: 600, fontSize: 13, color: "var(--ink)", paddingRight: 16 }}
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => updateTeamMember(m.id, { name: e.currentTarget.textContent || "" })}
                  >
                    {m.name}
                  </div>
                  <div
                    style={{ fontSize: 11, color: "var(--ink3)", marginTop: 2 }}
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => updateTeamMember(m.id, { role: e.currentTarget.textContent || "" })}
                  >
                    {m.role}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="section-title" style={{ marginTop: "24px", marginBottom: "16px" }}>SYARAT DAN KETENTUAN</div>

          {ARTICLES.map((art) => (
            <div className="article" key={art.title} style={{ marginBottom: "20px" }}>
              <h4 style={{ fontWeight: 700, fontSize: "14px", marginBottom: "8px" }}>{art.title}</h4>
              {art.body}
            </div>
          ))}
        </div>

        {/* SIGNATURES */}
        <div className="sig-section" style={{ marginTop: "32px" }}>
          <div className="sig-block">
            <h3>PIHAK PERTAMA</h3>
            <div className="sig-sub">Penyedia Jasa</div>
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
              <div
                className="name"
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => setProviderName(e.currentTarget.textContent?.replace(/[()]/g, "").trim() || "")}
              >
                ( {providerName} )
              </div>
              <div className="title">Penyedia Jasa</div>
            </div>
          </div>

          <div className="sig-block">
            <h3>PIHAK KEDUA</h3>
            <div className="sig-sub">Klien</div>
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
                onBlur={(e) => setClientPic(e.currentTarget.textContent?.replace(/[()]/g, "").trim() || "")}
              >
                ( {clientPic} )
              </div>
              <div className="title">Klien</div>
            </div>
          </div>
        </div>

        <div className="footer-band">
          <div className="footer-text">
            Dokumen ini merupakan perjanjian sah dan mengikat secara hukum antara
            Penyedia Jasa dan Klien.
            <br />
            Dilengkapi dengan otentikasi tanda tangan digital.
          </div>
          <div className="footer-brand">
            <img src="/LogoMain.png" alt="SkyFlow" className="footer-logo" />
          </div>
        </div>
      </div>
    </div>
  );
}
