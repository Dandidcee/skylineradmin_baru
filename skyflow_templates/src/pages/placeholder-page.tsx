import { Construction } from "lucide-react";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent } from "@/components/ui/card";

export function PlaceholderPage({ title }: { title: string }) {
  return (
    <AppLayout title={title}>
      <Card>
        <CardContent className="flex flex-col items-center gap-3 p-12">
          <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary/15 text-primary">
            <Construction className="h-6 w-6" />
          </div>
          <p className="text-xl font-bold">Segera Hadir</p>
          <p className="text-base text-text/60">
            Halaman {title} sedang dalam pengembangan.
          </p>
        </CardContent>
      </Card>
    </AppLayout>
  );
}
