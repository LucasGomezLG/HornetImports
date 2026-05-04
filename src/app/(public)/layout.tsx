import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import MobileBottomNav from "@/components/ui/MobileBottomNav";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>{children}</main>
      <Footer />
      <MobileBottomNav />
    </>
  );
}
