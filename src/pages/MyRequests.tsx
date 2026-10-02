import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ChevronRight, Inbox, LogIn, UserPlus, Plus, CheckCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import PageMeta from "@/components/common/PageMeta";
import { useAuth, accountUrl } from "@/contexts/AuthContext";
import { getMyServiceRequests } from "@/lib/api";
import { getPendingClaims } from "@/lib/pendingClaims";
import { formatDate, getStatusLabel, getStatusColor } from "@/lib/utils";

export function MyRequests() {
  const { user, loading, claimsSettled, claimedCount } = useAuth();

  const query = useQuery({
    queryKey: ["my-service-requests", user?.id],
    queryFn: getMyServiceRequests,
    // Wait for any pending anonymous requests to be linked first, so they
    // appear in the very first fetch.
    enabled: !!user && claimsSettled,
  });

  return (
    <div className="container mx-auto max-w-2xl px-4 py-10">
      <PageMeta
        title="طلباتي"
        description="تابع طلبات الكورسات والخدمات التقنية التي أرسلتها إلى طموح."
        url="/my-requests"
        noIndex
      />
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-gray-600 transition-colors">الرئيسية</Link>
        <ChevronRight className="w-4 h-4 rotate-180" />
        <span className="text-gray-700 font-medium">طلباتي</span>
      </nav>

      <div className="flex items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">طلباتي</h1>
        <Link to="/service-request">
          <Button size="sm" className="gap-1.5">
            <Plus className="w-4 h-4" />
            طلب جديد
          </Button>
        </Link>
      </div>

      {loading || (user && (!claimsSettled || query.isLoading)) ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-24 rounded-2xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : !user ? (
        <SignedOut />
      ) : query.isError ? (
        <div role="alert" className="bg-red-50 border border-red-100 rounded-xl p-4 text-sm text-red-700">
          تعذّر تحميل طلباتك. حاول مرة أخرى لاحقاً.
        </div>
      ) : (
        <>
          {claimedCount > 0 && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-100 text-green-700 rounded-xl px-4 py-3 text-sm mb-4">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              تم ربط {claimedCount} {claimedCount === 1 ? "طلب" : "طلبات"} أرسلتها سابقاً بحسابك.
            </div>
          )}
          {query.data?.length ? (
            <ul className="space-y-3">
              {query.data.map((r, i) => (
                <motion.li
                  key={r.reference}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="bg-white border rounded-2xl p-5"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <p className="text-xs text-gray-500">{r.type_label}</p>
                      <h2 className="font-bold text-gray-900">{r.field_label}</h2>
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${getStatusColor(r.status)}`}>
                      {getStatusLabel(r.status)}
                    </span>
                  </div>
                  {r.details && (
                    <p className="text-sm text-gray-600 whitespace-pre-line break-words line-clamp-3 mb-3">{r.details}</p>
                  )}
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span dir="ltr" className="font-mono">{r.reference}</span>
                    <span>{formatDate(r.created_at)}</span>
                  </div>
                </motion.li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-16 border-2 border-dashed rounded-2xl">
              <Inbox className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600 font-medium mb-1">لا توجد طلبات بعد</p>
              <p className="text-sm text-gray-400 mb-5">اطلب كورس أو خدمة تقنية في أقل من دقيقة.</p>
              <Link to="/service-request">
                <Button>ابدأ طلبك</Button>
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function SignedOut() {
  const pending = getPendingClaims().length;
  return (
    <div className="bg-white border rounded-2xl p-8 text-center">
      <p className="font-bold text-gray-900 mb-2">سجّل دخولك لمتابعة طلباتك</p>
      <p className="text-sm text-gray-500 mb-6">
        {pending > 0
          ? `لديك ${pending} ${pending === 1 ? "طلب محفوظ" : "طلبات محفوظة"} على هذا الجهاز — حيترَبط بحسابك تلقائياً بعد تسجيل الدخول.`
          : "بحسابك تقدر تتابع حالة كل طلب وترجع لطلباتك السابقة من أي جهاز."}
      </p>
      <div className="flex items-center justify-center gap-2 flex-wrap">
        <a href={accountUrl("register", "/my-requests")}>
          <Button className="gap-2"><UserPlus className="w-4 h-4" /> إنشاء حساب</Button>
        </a>
        <a href={accountUrl("login", "/my-requests")}>
          <Button variant="outline" className="gap-2"><LogIn className="w-4 h-4" /> تسجيل الدخول</Button>
        </a>
      </div>
    </div>
  );
}
