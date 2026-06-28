import { toast } from "sonner";

export const toastManager = {
  add: ({ title, description }: { title?: string; description?: string }) => {
    toast(title, {
      description: description,
    });
  },
  success: ({ title, description }: { title?: string; description?: string }) => {
    toast.success(title, {
      description: description,
    });
  },
  error: ({ title, description }: { title?: string; description?: string }) => {
    toast.error(title, {
      description: description,
    });
  },
};
