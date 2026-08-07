import type { DashboardStats, DocumentItem } from "./types";
import { fetchApi } from "./api";
import templateCssRaw from "../components/documents/templates/template.css?raw";

/**
 * DOCUMENT SERVICE — semua akses data dokumen terpusat di sini.
 */

export async function listDocuments(): Promise<DocumentItem[]> {
  try {
    return await fetchApi('/documents');
  } catch {
    return [];
  }
}

export async function getDocumentFile(id: string): Promise<{ fileUrl: string, clientSignature?: string }> {
  return await fetchApi(`/documents/${id}/file`);
}

export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    return await fetchApi('/stats');
  } catch {
    return {
      totalDocuments: 0,
      generatedThisMonth: 0,
      templates: 0,
      storageUsedMb: 0,
    };
  }
}

export async function deleteDocument(id: string): Promise<boolean> {
  await fetchApi(`/documents/${id}`, { method: 'DELETE' });
  return true;
}

export async function updateDocument(id: string, data: { title: string }): Promise<DocumentItem> {
  return await fetchApi(`/documents/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
}

export async function generateDocument(input: {
  title: string;
  template: string;
  projectId?: string;
  clientId?: string;
  amount?: string;
  fileUrl?: string;
  sizeKb?: number;
}): Promise<DocumentItem> {
  return await fetchApi('/documents', {
    method: 'POST',
    body: JSON.stringify({ 
      title: input.title, 
      template: input.template,
      projectId: input.projectId,
      clientId: input.clientId,
      amount: input.amount,
      fileUrl: input.fileUrl,
      status: input.fileUrl ? 'ready' : 'processing', 
      sizeKb: input.sizeKb || 0 
    })
  });
}

/**
 * Helper untuk mengkonversi URL gambar menjadi base64 data URL
 * agar gambar bisa ditampilkan di iframe srcDoc tanpa request ke server
 */
async function imageUrlToBase64(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(url); // fallback ke url asli
      reader.readAsDataURL(blob);
    });
  } catch {
    return url; // fallback jika fetch gagal
  }
}

/**
 * Helper untuk membuat HTML snapshot dari elemen `.paper`
 * Dokumen bersifat SELF-CONTAINED: semua CSS di-embed inline, gambar dikonversi ke base64.
 * Dengan begini, dokumen bisa ditampilkan di manapun tanpa bergantung ke server.
 */
export async function createDocumentSnapshot(title: string): Promise<{ fileUrl: string, sizeKb: number } | null> {
  const paper = document.querySelector('.paper');
  if (!paper) return null;

  const clone = paper.cloneNode(true) as HTMLElement;

  // Hapus elemen yang tidak perlu di-share
  clone.querySelectorAll('.no-print').forEach(el => el.remove());
  clone.querySelectorAll('[contenteditable]').forEach(el => el.removeAttribute('contenteditable'));
  clone.querySelectorAll('input, textarea').forEach(el => (el as HTMLElement).setAttribute('disabled', 'true'));

  // Convert canvas (tanda tangan) ke <img> base64
  const originalCanvases = paper.querySelectorAll('canvas');
  const clonedCanvases = clone.querySelectorAll('canvas');
  originalCanvases.forEach((canvas, index) => {
    const dataUrl = canvas.toDataURL('image/png');
    const img = document.createElement('img');
    img.src = dataUrl;
    img.className = clonedCanvases[index].className;
    img.style.cssText = (clonedCanvases[index] as HTMLElement).style.cssText;
    img.style.width = (canvas as HTMLCanvasElement).style.width || (canvas.width + 'px');
    img.style.height = (canvas as HTMLCanvasElement).style.height || (canvas.height + 'px');
    img.style.display = 'block';
    img.style.objectFit = 'contain';
    clonedCanvases[index].replaceWith(img);
  });

  // Konversi semua <img> dengan src relatif/absolut ke base64
  // agar tidak bergantung request ke server
  const allImgs = clone.querySelectorAll('img');
  await Promise.all(Array.from(allImgs).map(async (img) => {
    const src = img.getAttribute('src') || '';
    if (src && !src.startsWith('data:')) {
      const absoluteSrc = src.startsWith('http') ? src : `${window.location.origin}${src.startsWith('/') ? '' : '/'}${src}`;
      img.src = await imageUrlToBase64(absoluteSrc);
    }
  }));

  // Hanya ambil inline <style> yang berisi class template kita (JANGAN copy <link> - CORS blocked di iframe srcDoc)
  let inlineStyles = '';
  document.querySelectorAll('style').forEach(tag => {
    const text = tag.textContent || '';
    if (
      text.includes('.skyflow-doc') ||
      text.includes('.paper') ||
      text.includes('@font-face') ||
      text.includes('editable-inline')
    ) {
      inlineStyles += tag.outerHTML + '\n';
    }
  });

  const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0">
  <title>${title}</title>
  ${inlineStyles}
  <style>
    ${templateCssRaw}
  </style>
  <style>
    :root, html, body {
      color-scheme: light !important;
    }
    html, body { width: 100%; margin: 0; padding: 0; }
    body {
      background: #f1f5f9 !important;
      padding: 24px 0;
      display: block;
      overflow-x: hidden;
      color: #100a04;
      font-family: system-ui, -apple-system, sans-serif;
    }
    .skyflow-doc .paper,
    .skyflow-doc .tpl-toolbar { zoom: 1 !important; }
    .skyflow-doc .paper {
      transform-origin: top left !important;
      margin: 0 !important;
      box-shadow: 0 4px 24px rgba(0,0,0,0.10) !important;
      background: white !important;
      pointer-events: none !important;
      user-select: none !important;
      width: 820px !important;
      max-width: 820px !important;
      min-width: 820px !important;
    }
    @media print {
      body { background: white !important; padding: 0; }
      .skyflow-doc .paper { transform: none !important; zoom: 1 !important; margin: 0 auto !important; box-shadow: none !important; }
    }
  </style>
  <script>
    function fitPaper() {
      var paper = document.querySelector('.paper');
      if (!paper) return;
      var winW = document.documentElement.clientWidth || window.innerWidth;
      var scale = Math.min(1, (winW - 20) / 820);
      paper.style.transform = 'scale(' + scale + ')';
      paper.style.transformOrigin = 'top left';
      paper.style.marginLeft = Math.max(0, (winW - 820 * scale) / 2) + 'px';
      paper.style.marginBottom = '-' + Math.round(820 * (1 - scale) * 1.2) + 'px';
    }
    window.addEventListener('resize', fitPaper);
    window.addEventListener('DOMContentLoaded', fitPaper);
    setTimeout(fitPaper, 100);
  </script>
</head>
<body class="skyflow-doc">
  ${clone.outerHTML}
  <script>
    document.documentElement.classList.remove('dark');
  </script>
</body>
</html>`;

  const base64 = btoa(unescape(encodeURIComponent(htmlContent)));
  return {
    fileUrl: `data:text/html;base64,${base64}`,
    sizeKb: Math.round(base64.length / 1024)
  };
}
