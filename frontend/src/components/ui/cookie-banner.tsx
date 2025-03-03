"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = Cookies.get("cookie_consent");
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const handleAccept = () => {
    Cookies.set("cookie_consent", "accepted", { expires: 365, secure: true, sameSite: "Strict" });
    setShowBanner(false);
  };

  const handleReject = () => {
    Cookies.set("cookie_consent", "rejected", { expires: 30, secure: true, sameSite: "Strict" });
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className={cn("fixed bottom-4 left-4 right-4 md:left-auto md:right-4 p-4 bg-white border shadow-lg rounded-lg flex flex-col md:flex-row items-center gap-4")}>
      <p className="text-sm text-gray-700">
        Este site usa cookies para melhorar sua experiência. Você aceita?
      </p>
      <div className="flex gap-2">
        <Button onClick={handleAccept} className="bg-blue-500 text-white">
          Aceitar
        </Button>
        <Button onClick={handleReject} variant="outline">
          Recusar
        </Button>
      </div>
    </div>
  );
}
