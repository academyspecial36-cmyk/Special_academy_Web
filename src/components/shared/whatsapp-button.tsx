import { MessageCircle } from "lucide-react";

const PHONE_NUMBER = "9860302036";
const WHATSAPP_URL = `https://wa.me/${PHONE_NUMBER}`;

export function WhatsAppButton() {
  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 bg-[#25D366] flex items-center gap-2.5 pl-4 pr-5 py-3 rounded-full text-white shadow-lg hover:bg-[#22c35e] hover:scale-105 active:scale-95 transition-all duration-200"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle className="w-5 h-5" />
      <span className="text-sm font-medium">Chat on WhatsApp</span>
    </a>
  );
}
