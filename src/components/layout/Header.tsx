import { Link, useLocation } from "react-router-dom";
import { Search, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { LOGIN_URL, PLATFORM_URL } from "@/config";
import logo from "@/assets/logo.png";

const navItems = [
  { label: "الرئيسية", path: "/" },
  { label: "الخارطة", path: "/roadmap" },
  { label: "تتبع طلبك", path: "/track" },
];

export function Header() {
  const location = useLocation();
  const { user, loading } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5">
          <img src={logo} alt="طموح" className="h-9 w-9 object-contain" />
          <div className="flex flex-col leading-tight">
            <span className="font-bold text-sm text-gray-900">مركز صوت طموح</span>
            <span className="text-xs text-tomoh-burgundy font-medium">Voice Center</span>
          </div>
        </Link>

        {/* Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === item.path
                  ? "bg-burgundy-50 text-tomoh-burgundy"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Link to="/track">
            <Button variant="outline" size="sm" className="gap-2">
              <Search className="w-4 h-4" />
              <span className="hidden sm:inline">تتبع طلب</span>
            </Button>
          </Link>

          {/* Auth state */}
          {!loading && (
            user ? (
              /* Logged-in: avatar + name → links back to platform profile */
              <a
                href={`${PLATFORM_URL}/profile`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-1.5 hover:border-burgundy-300 hover:bg-burgundy-50 transition-colors"
              >
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.username}
                    className="w-7 h-7 rounded-full object-cover flex-shrink-0"
                  />
                ) : (
                  <span className="w-7 h-7 rounded-full bg-tomoh-burgundy text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                    {user.username.charAt(0).toUpperCase()}
                  </span>
                )}
                <span className="hidden sm:block text-sm font-medium text-gray-700 max-w-[120px] truncate">
                  {user.username}
                </span>
              </a>
            ) : (
              /* Logged-out: login link */
              <a
                href={`${LOGIN_URL}?return=${encodeURIComponent(window.location.href)}`}
                className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-tomoh-burgundy transition-colors"
              >
                <LogIn className="w-4 h-4" />
                <span className="hidden sm:inline">تسجيل الدخول</span>
              </a>
            )
          )}

          <Link to="/bug-report">
            <Button size="sm" className="bg-tomoh-burgundy hover:bg-tomoh-burgundy-dark text-white">
              أبلغ عن مشكلة
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
