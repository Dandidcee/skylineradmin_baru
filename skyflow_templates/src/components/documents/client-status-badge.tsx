import { cn } from "@/lib/utils";
import type { ClientStatus } from "@/services/types";

const LABEL: Record<ClientStatus, string> = {
  pending: "Pending",
  cancel: "Cancel",
  waiting_payment: "Waiting Payment",
  dp_done: "DP Done",
  payment_full_done: "Payment Full Done",
  canceled_by_skyflow: "Canceled by SkyFlow",
  done: "Done",
};

/**
 * Warna mengikuti palet resmi (primary gold, accent/secondary green, netral muted).
 * Status batal pakai netral + outline agar terlihat non-aktif.
 */
const STYLE: Record<ClientStatus, string> = {
  pending: "bg-muted text-text/60",
  waiting_payment: "bg-primary/15 text-primary",
  dp_done: "bg-primary/25 text-primary",
  payment_full_done: "bg-accent/20 text-accent",
  done: "bg-secondary/30 text-secondary",
  cancel: "border border-border bg-transparent text-text/50",
  canceled_by_skyflow: "border border-border bg-transparent text-text/40",
};

export function ClientStatusBadge({ status }: { status: ClientStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-md px-2 py-0.5 text-sm font-normal",
        STYLE[status]
      )}
    >
      {LABEL[status]}
    </span>
  );
}

export { LABEL as CLIENT_STATUS_LABEL };
