import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { useSearchParams } from "react-router-dom";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TEMPLATES, type TemplateId } from "@/components/documents/templates";

export function TemplatesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tParam = searchParams.get("t") as TemplateId | null;
  const [active, setActive] = useState<TemplateId | null>(tParam);

  useEffect(() => {
    if (tParam && tParam !== active) {
      setActive(tParam);
    }
  }, [tParam]);

  const handleBack = () => {
    setActive(null);
    setSearchParams(new URLSearchParams());
  };

  const handleSelect = (id: TemplateId) => {
    setActive(id);
    setSearchParams({ t: id });
  };

  const activeTemplate = TEMPLATES.find((t) => t.id === active);

  if (activeTemplate) {
    const Doc = activeTemplate.component;
    return (
      <AppLayout title={activeTemplate.label}>
        <div className="flex flex-col gap-4">
          <Button
            variant="outline"
            size="sm"
            className="w-fit"
            onClick={handleBack}
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke daftar template
          </Button>
          <Doc />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Template">
      <div className="flex flex-col gap-4">
        <p className="text-sm text-text/60">
          Pilih jenis dokumen untuk membuat berkas baru.
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TEMPLATES.map((tpl, i) => {
            const Icon = tpl.icon;
            return (
              <motion.button
                key={tpl.id}
                type="button"
                onClick={() => handleSelect(tpl.id)}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, ease: "easeOut", delay: i * 0.05 }}
                className="text-left"
              >
                <Card className="h-full transition-colors hover:border-primary">
                  <CardContent className="flex flex-col gap-3 p-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/15 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-xl font-bold">{tpl.label}</span>
                    <span className="text-base text-text/60">
                      {tpl.description}
                    </span>
                  </CardContent>
                </Card>
              </motion.button>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}
