import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { Toaster } from "@/components/ui/toaster";

export function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Skip link: first focusable element on every route, visible only on
          focus. `right-4` (not `left-4`) because the document is dir="rtl". */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:right-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-tomoh-burgundy focus:px-4 focus:py-2 focus:text-white"
      >
        تخطَّ إلى المحتوى الرئيسي
      </a>
      <Header />
      <main id="main-content" className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <Toaster />
    </div>
  );
}
