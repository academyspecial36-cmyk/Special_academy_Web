import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { WhatsAppButton } from "@/components/shared/whatsapp-button";
import { AdminAuthModal } from "@/components/shared/admin-auth-modal";
import { PinnedNoticeWrapper } from "@/components/landing/pinned-notice-wrapper";
import { PublicAppShell } from "@/components/public-app-shell";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PublicAppShell>
      <Navbar />
      <div className="min-h-[50vh]">{children}</div>
      <Footer />
      <PinnedNoticeWrapper />
      <WhatsAppButton />
      <AdminAuthModal />
    </PublicAppShell>
  );
}
