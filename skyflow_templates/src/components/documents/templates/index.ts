import type { ComponentType } from "react";
import { FileText, Handshake, Receipt, Map } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { InvoiceTemplate } from "./invoice-template";
import { AgreementTemplate } from "./agreement-template";
import { ReceiptTemplate } from "./receipt-template";
import { ImplementationPlanTemplate } from "./implementation-plan-template";
import { HandoverTemplate } from "./handover-template";

export type TemplateId = "invoice" | "agreement" | "receipt" | "implementation" | "handover";

export type TemplateMeta = {
  id: TemplateId;
  label: string;
  description: string;
  icon: LucideIcon;
  component: ComponentType;
};

/**
 * Registry template dokumen.
 * Tambah jenis dokumen baru cukup dengan menambah entri di sini.
 */
export const TEMPLATES: TemplateMeta[] = [
  {
    id: "implementation",
    label: "Implementation Plan",
    description: "Roadmap integrasi dan spesifikasi teknis.",
    icon: Map,
    component: ImplementationPlanTemplate,
  },
  {
    id: "agreement",
    label: "Perjanjian Kerja",
    description: "Kontrak kerja sama dengan pasal & tanda tangan kedua pihak.",
    icon: Handshake,
    component: AgreementTemplate,
  },
  {
    id: "invoice",
    label: "Invoice",
    description: "Tagihan layanan dengan rincian item, PPN, dan DP.",
    icon: FileText,
    component: InvoiceTemplate,
  },
  {
    id: "receipt",
    label: "Bukti Pembayaran",
    description: "Bukti pembayaran sah dengan status DP / Lunas.",
    icon: Receipt,
    component: ReceiptTemplate,
  },
  {
    id: "handover",
    label: "Serah Terima (BAST)",
    description: "Berita Acara Serah Terima pekerjaan dan hak guna.",
    icon: Handshake,
    component: HandoverTemplate,
  },
];

export function getTemplate(id: string): TemplateMeta | undefined {
  return TEMPLATES.find((t) => t.id === id);
}
