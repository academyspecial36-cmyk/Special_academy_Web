"use client";

import { useState } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppContext } from "@/lib/app-context";

const PHONE_NUMBER = "9860302036";
const DEFAULT_MESSAGE = "How can I help you?";

export function WhatsAppButton() {
  const { settings } = useAppContext();
  const primaryColor = settings.config?.theme?.primaryColor || "#25D366";
  const [popupOpen, setPopupOpen] = useState(false);

  function openWhatsApp() {
    const encoded = encodeURIComponent(DEFAULT_MESSAGE);
    window.open(`https://wa.me/${PHONE_NUMBER}?text=${encoded}`, "_blank", "noopener,noreferrer");
    setPopupOpen(false);
  }

  return (
    <>
      <AnimatePresence>
        {popupOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-20 right-6 z-50 bg-white rounded-2xl shadow-elevated border border-primary/5 p-4 w-72"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: `${primaryColor}1A` }}>
                  <MessageCircle className="w-4 h-4" style={{ color: primaryColor }} />
                </div>
                <span className="text-sm font-bold text-primary">WhatsApp</span>
              </div>
              <button
                onClick={() => setPopupOpen(false)}
                className="p-1 rounded-md hover:bg-accent text-muted hover:text-primary transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-muted mb-4 leading-relaxed">
              {DEFAULT_MESSAGE}
            </p>
            <button
              onClick={openWhatsApp}
              className="w-full flex items-center justify-center gap-2 text-white text-sm font-medium py-2.5 px-4 rounded-xl transition-colors"
              style={{ backgroundColor: primaryColor }}
            >
              <Send className="w-4 h-4" />
              Open WhatsApp
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setPopupOpen((p) => !p)}
        className="fixed bottom-6 right-6 z-40 text-white rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center md:pl-4 md:pr-5 md:py-3 md:gap-2.5 w-12 h-12 md:w-auto md:h-auto"
        style={{ backgroundColor: primaryColor }}
        aria-label="Chat on WhatsApp"
      >
        <MessageCircle className="w-5 h-5 shrink-0" />
        <span className="text-sm font-medium hidden md:inline">Chat on WhatsApp</span>
      </button>
    </>
  );
}
