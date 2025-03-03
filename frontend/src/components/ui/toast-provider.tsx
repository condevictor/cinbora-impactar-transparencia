"use client";

import { Toaster } from "sonner";

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      expand={true}
      richColors
      visibleToasts={3}
      duration={4000}
      toastOptions={{
        className: "relative overflow-hidden animate-slide-in",
        style: {
          animation: "slideIn 0.4s ease-out, fadeOut 0.3s ease-in 3.7s forwards",
        },
      }}
    />
  );
}