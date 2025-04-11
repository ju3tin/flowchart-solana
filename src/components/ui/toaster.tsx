"use client";

import { toast } from "sonner";

// Backward compatibility layer for existing toaster.create usage
export const toaster = {
  create: ({ title, description, type, duration }: { 
    title: string, 
    description?: string, 
    type?: 'success' | 'error' | 'warning' | 'loading' | 'info', 
    duration?: number 
  }) => {
    switch (type) {
      case 'success':
        return toast.success(title, { description, duration });
      case 'error':
        return toast.error(title, { description, duration });
      case 'warning':
        return toast.warning(title, { description, duration });
      case 'loading':
        return toast.loading(title, { description, duration });
      case 'info':
      default:
        return toast.info(title, { description, duration });
    }
  },
  dismiss: (id?: string) => {
    if (id) {
      toast.dismiss(id);
    }
  },
  promise: async <T extends any>(
    promise: Promise<T>,
    options: {
      loading?: string;
      success?: string;
      error?: string;
    }
  ) => {
    return toast.promise(promise, {
      loading: options.loading || "Loading...",
      success: options.success || "Success!",
      error: options.error || "Error!"
    });
  }
};

// For backward compatibility with any imports expecting a default Toaster component
export const Toaster = () => null;

export default Toaster; 