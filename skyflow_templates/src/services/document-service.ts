import type { DashboardStats, DocumentItem } from "./types";
import { fetchApi } from "./api";

/**
 * DOCUMENT SERVICE — semua akses data dokumen terpusat di sini.
 */

export async function listDocuments(): Promise<DocumentItem[]> {
  try {
    return await fetchApi('/documents');
  } catch (error) {
    return [];
  }
}

export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    return await fetchApi('/stats');
  } catch (error) {
    return {
      totalDocuments: 0,
      generatedThisMonth: 0,
      templates: 0,
      storageUsedMb: 0,
    };
  }
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

  let headStyles = '';
  const styleTags = document.querySelectorAll('style, link[rel="stylesheet"]');
  styleTags.forEach(tag => {
    headStyles += tag.outerHTML + '\n';
  });
  
  const clone = paper.cloneNode(true) as HTMLElement;
  const noPrints = clone.querySelectorAll('.no-print');
  noPrints.forEach(el => el.remove());

  // Convert inputs/textareas inside clone to static text if needed, 
  // but most inputs are contentEditable which works fine as static HTML.
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>${title}</title>
        ${headStyles}
        <style>
          body { background: #525659; margin: 0; padding: 20px; display: flex; justify-content: center; color: #100a04; font-family: system-ui, -apple-system, sans-serif; }
          .paper { box-shadow: 0 0 15px rgba(0,0,0,0.2) !important; margin: 0 !important; border: none !important; }
          @media print {
            body { padding: 0; background: white; }
            .paper { box-shadow: none !important; }
          }
        </style>
      </head>
      <body class="skyflow-doc">
        ${clone.outerHTML}
        <script>
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
