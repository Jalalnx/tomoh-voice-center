import { Link } from "react-router-dom";
import { Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-gray-50 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-right">
            <p className="text-sm text-gray-500">
              مركز صوت طموح — نستمع إليك لنبني معاً منصة أفضل
            </p>
          </div>
          <nav className="flex items-center gap-6 text-sm text-gray-500">
            <Link to="/roadmap" className="hover:text-gray-900 transition-colors">
              خارطة الطريق
            </Link>
            <Link to="/track" className="hover:text-gray-900 transition-colors">
              تتبع طلبك
            </Link>
            <a
              href="https://tomoh.io"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-900 transition-colors"
            >
              طموح
            </a>
          </nav>
        </div>
        <div className="mt-6 pt-6 border-t text-center text-xs text-gray-400 flex items-center justify-center gap-1">
          <span>صنع بـ</span>
          <Heart className="w-3 h-3 text-red-400 fill-red-400" />
          <span>لمجتمع طموح © {new Date().getFullYear()}</span>
        </div>
      </div>
    </footer>
  );
}
