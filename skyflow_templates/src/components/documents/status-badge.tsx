import { Badge } from "@/components/ui/badge";
import type { DocumentStatus } from "@/services/types";

const LABEL: Record<DocumentStatus, string> = {
  ready: "Siap",
  processing: "Diproses",
  draft: "Draf",
  failed: "Gagal",
};

export function StatusBadge({ status }: { status: DocumentStatus }) {
  return <Badge variant={status}>{LABEL[status]}</Badge>;
}
