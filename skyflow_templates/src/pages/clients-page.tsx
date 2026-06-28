import { useMemo } from "react";
import { Users } from "lucide-react";
import { motion } from "framer-motion";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent } from "@/components/ui/card";
import { ClientTable } from "@/components/clients/client-table";
import { useClientTable } from "@/store/client-store";

const ACTIVE = ["pending", "waiting_payment", "dp_done"];
const DONE = ["payment_full_done", "done"];
const CANCELED = ["cancel", "canceled_by_skyflow"];

export function ClientsPage() {
  const { data, loading } = useClientTable();

const STATS = [
    { label: "Total Client", value: data.rows.length },
  ];

  return (
    <AppLayout title="List Client">
      <div className="flex flex-col gap-6 min-w-0 w-full">
        {/* Mini dashboard */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, ease: "easeOut", delay: i * 0.05 }}
            >
              <Card>
                <CardContent className="flex flex-col gap-3 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm text-text/60">{s.label}</span>
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/15 text-primary">
                      <Users className="h-4 w-4" />
                    </div>
                  </div>
                  <span className="font-heading text-2xl font-bold leading-tight">
                    {loading ? "—" : s.value}
                  </span>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>



        {/* Tabel database custom (ala AFFiNE) */}
        <ClientTable />
      </div>
    </AppLayout>
  );
}
