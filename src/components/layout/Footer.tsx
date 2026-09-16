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
          <nav className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm text-gray-500 sm:flex sm:flex-wrap sm:items-center sm:gap-6">
            <Link to="/bug-report" className="hover:text-gray-900 transition-colors">أبلغ عن مشكلة</Link>
            <Link to="/suggestion" className="hover:text-gray-900 transition-colors">اقتراح تحسين</Link>
            <Link to="/course-request" className="hover:text-gray-900 transition-colors">ترشيح دورة</Link>
            <Link to="/satisfaction" className="hover:text-gray-900 transition-colors">تقييم تجربتك</Link>
            <Link to="/features" className="hover:text-gray-900 transition-colors">التصويت على الميزات</Link>
            <Link to="/roadmap" className="hover:text-gray-900 transition-colors">خارطة الطريق</Link>
            <Link to="/track" className="hover:text-gray-900 transition-colors">تتبع طلبك</Link>
            <a href="https://tomoh.io" target="_blank" rel="noopener noreferrer" className="hover:text-gray-900 transition-colors">منصة طموح</a>
            <a href="https://tomoh.io/courses" target="_blank" rel="noopener noreferrer" className="hover:text-gray-900 transition-colors">الدورات</a>
            <a href="https://tomoh.io/blogs" target="_blank" rel="noopener noreferrer" className="hover:text-gray-900 transition-colors">المقالات</a>
          </nav>
        </div>
        <div className="mt-6 pt-6 border-t text-center text-xs text-gray-500 flex items-center justify-center gap-1">
          <span>صنع بـ</span>
          <Heart className="w-3 h-3 text-red-400 fill-red-400" />
          <span>لمجتمع طموح © {new Date().getFullYear()}</span>
        </div>
      </div>
    </footer>
  );
}
