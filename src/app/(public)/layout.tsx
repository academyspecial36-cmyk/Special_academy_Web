import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { WhatsAppButton } from "@/components/shared/whatsapp-button";
import { AdminAuthModal } from "@/components/shared/admin-auth-modal";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <div className="min-h-[50vh]">{children}</div>
      <Footer />
      <WhatsAppButton />
      <AdminAuthModal />
    </>
  );
}
