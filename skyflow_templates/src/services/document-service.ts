import type { DashboardStats, DocumentItem } from "./types";
import { fetchApi } from "./api";

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
 * Helper untuk membuat HTML snapshot dari elemen `.paper` 
 * (menghindari penggunaan library PDF yang berat di frontend)
 */
export function createDocumentSnapshot(title: string): { fileUrl: string, sizeKb: number } | null {
  const paper = document.querySelector('.paper');
  if (!paper) return null;

  // Copy only relevant document & print styles to avoid bloat (reduces snapshot payload by 99%)
  let headStyles = '';
  const styleTags = document.querySelectorAll('style, link[rel="stylesheet"]');
  styleTags.forEach(tag => {
    const text = tag.textContent || '';
    if (
      tag.tagName.toLowerCase() === 'link' || 
      text.includes('.skyflow-doc') || 
      text.includes('.paper') || 
      text.includes('@media print') || 
      text.includes('editable-inline') ||
      text.includes('@font-face')
    ) {
      headStyles += tag.outerHTML + '\n';
    }
  });
  
  const clone = paper.cloneNode(true) as HTMLElement;
  const noPrints = clone.querySelectorAll('.no-print');
  noPrints.forEach(el => el.remove());

  // Hapus semua contenteditable agar dokumen yang di-share tidak bisa diedit
  clone.querySelectorAll('[contenteditable]').forEach(el => {
    el.removeAttribute('contenteditable');
  });
  // Hapus semua input & textarea agar tidak bisa diisi
  clone.querySelectorAll('input, textarea').forEach(el => {
    (el as HTMLElement).setAttribute('disabled', 'true');
  });

  // Convert canvas elements to images so their drawn signatures persist in outerHTML
  const originalCanvases = paper.querySelectorAll('canvas');
  const clonedCanvases = clone.querySelectorAll('canvas');
  originalCanvases.forEach((canvas, index) => {
    const dataUrl = canvas.toDataURL('image/png');
    // Only replace if the canvas has actually been drawn on (dataUrl length > some small blank canvas threshold)
    // Or just always replace it.
    const img = document.createElement('img');
    img.src = dataUrl;
    img.className = clonedCanvases[index].className;
    img.style.cssText = clonedCanvases[index].style.cssText;
    // ensure size matches
    img.style.width = canvas.style.width || (canvas.width + 'px');
    img.style.height = canvas.style.height || (canvas.height + 'px');
    img.style.objectFit = 'contain';
    clonedCanvases[index].replaceWith(img);
  });

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0">
        <title>${title}</title>
        <base href="${window.location.origin}">
        ${headStyles}
        <style>
          :root, html, body {
            --text: #100a04 !important;
            --background: #fefcfb !important;
            --primary: #004aad !important;
            --primary-foreground: #fefcfb !important;
            --card: #ffffff !important;
            --muted: #f4f0ec !important;
            --border: #e7e0d8 !important;
            color-scheme: light !important;
          }
          html, body {
            width: 100%;
            margin: 0;
            padding: 0;
          }
          body {
            background: #f1f5f9 !important;
            padding: 24px 0;
            display: block;
            overflow-x: hidden;
            color: #100a04;
            font-family: system-ui, -apple-system, sans-serif;
          }
          /* Reset semua zoom dari template.css — kita handle via JS transform */
          .skyflow-doc .paper,
          .skyflow-doc .tpl-toolbar {
            zoom: 1 !important;
          }
          .skyflow-doc .paper {
            transform-origin: top left !important;
            margin: 0 !important;
            box-shadow: 0 4px 24px rgba(0,0,0,0.10) !important;
            border: none !important;
            background: white !important;
            pointer-events: none !important;
            user-select: none !important;
            width: 820px !important;
            max-width: 820px !important;
            min-width: 820px !important;
          }
          @media screen and (max-width: 860px) { .skyflow-doc .paper, .skyflow-doc .tpl-toolbar { zoom: 1 !important; } }
          @media screen and (max-width: 800px) { .skyflow-doc .paper, .skyflow-doc .tpl-toolbar { zoom: 1 !important; } }
          @media screen and (max-width: 768px) { .skyflow-doc .paper, .skyflow-doc .tpl-toolbar { zoom: 1 !important; } }
          @media screen and (max-width: 700px) { .skyflow-doc .paper, .skyflow-doc .tpl-toolbar { zoom: 1 !important; } }
          @media screen and (max-width: 640px) { .skyflow-doc .paper, .skyflow-doc .tpl-toolbar { zoom: 1 !important; } }
          @media screen and (max-width: 580px) { .skyflow-doc .paper, .skyflow-doc .tpl-toolbar { zoom: 1 !important; } }
          @media screen and (max-width: 520px) { .skyflow-doc .paper, .skyflow-doc .tpl-toolbar { zoom: 1 !important; } }
          @media screen and (max-width: 480px) { .skyflow-doc .paper, .skyflow-doc .tpl-toolbar { zoom: 1 !important; } }
          @media screen and (max-width: 420px) { .skyflow-doc .paper, .skyflow-doc .tpl-toolbar { zoom: 1 !important; } }
          @media screen and (max-width: 380px) { .skyflow-doc .paper, .skyflow-doc .tpl-toolbar { zoom: 1 !important; } }
          @media screen and (max-width: 340px) { .skyflow-doc .paper, .skyflow-doc .tpl-toolbar { zoom: 1 !important; } }
          @media print {
            body { display: block; padding: 0; background: white !important; }
            .paper { transform: none !important; zoom: 1 !important; margin: 0 auto !important; box-shadow: none !important; }
          }
        </style>
        <script>
          function fitPaper() {
            var paper = document.querySelector('.paper');
            if (!paper) return;
            var winW = document.documentElement.clientWidth || window.innerWidth;
            var scale = Math.min(1, (winW - 20) / 820);
            var scaledW = 820 * scale;
            var marginLeft = Math.max(0, (winW - scaledW) / 2);
            paper.style.transform = 'scale(' + scale + ')';
            paper.style.transformOrigin = 'top left';
            paper.style.marginLeft = marginLeft + 'px';
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
          // Pastikan tidak ada dark mode class
          document.documentElement.classList.remove('dark');
          window.onload = () => { setTimeout(() => { window.print(); }, 500); }
        </script>
      </body>
    </html>
  `;
  const base64 = btoa(unescape(encodeURIComponent(htmlContent)));
  return { 
    fileUrl: `data:text/html;base64,${base64}`,
    sizeKb: Math.round(base64.length / 1024)
  };
}
