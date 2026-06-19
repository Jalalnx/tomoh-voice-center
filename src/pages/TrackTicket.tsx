import { useState } from "react";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronRight, Clock, CheckCircle, XCircle, AlertCircle, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { trackTicket } from "@/lib/api";
import type { Ticket } from "@/types";
import { getStatusLabel, getStatusColor, getPriorityLabel, getPriorityColor, formatDate } from "@/lib/utils";

const typeLabels: Record<string, string> = {
  bug_report: "🐛 بلاغ مشكلة",
  suggestion: "💡 اقتراح",
  course_request: "📚 ترشيح دورة",
  satisfaction: "⭐ تقييم",
  feature_request: "🚀 طلب ميزة",
};

const statusIcons: Record<string, React.ReactNode> = {
  new: <AlertCircle className="w-5 h-5 text-blue-500" />,
  under_review: <Clock className="w-5 h-5 text-yellow-500" />,
  in_progress: <Loader2 className="w-5 h-5 text-tomoh-burgundy animate-spin" />,
  resolved: <CheckCircle className="w-5 h-5 text-green-500" />,
  closed: <XCircle className="w-5 h-5 text-gray-400" />,
};

const statusSteps: Ticket["status"][] = ["new", "under_review", "in_progress", "resolved"];

export function TrackTicket() {
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [notFound, setNotFound] = useState(false);

  const { register, handleSubmit, watch } = useForm<{ reference: string }>();
  const reference = watch("reference", "");

  const mutation = useMutation({
    mutationFn: (ref: string) => trackTicket(ref),
    onSuccess: (data) => { setTicket(data); setNotFound(false); },
    onError: () => { setTicket(null); setNotFound(true); },
  });

  const onSubmit = ({ reference }: { reference: string }) => {
    setNotFound(false);
    mutation.mutate(reference.trim().toUpperCase());
  };

  const currentStepIndex = ticket ? statusSteps.indexOf(ticket.status) : -1;

  return (
    <div className="container mx-auto max-w-2xl px-4 py-10">
      <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <Link to="/" className="hover:text-gray-600 transition-colors">الرئيسية</Link>
        <ChevronRight className="w-4 h-4 rotate-180" />
        <span className="text-gray-700 font-medium">تتبع الطلب</span>
      </nav>

      <div className="bg-white rounded-3xl shadow-sm border p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-burgundy-100 rounded-2xl flex items-center justify-center">
            <Search className="w-6 h-6 text-tomoh-burgundy" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">تتبع طلبك</h1>
            <p className="text-sm text-gray-500">أدخل رقم المرجع الذي وصلك بعد الإرسال</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex gap-3 mb-8">
          <Input
            placeholder="TMOH-2026-XXXX"
            className="font-mono text-center text-lg tracking-widest uppercase flex-1"
            {...register("reference", { required: true })}
          />
          <Button
            type="submit"
            className="gap-2 px-6"
            disabled={mutation.isPending || !reference.trim()}
          >
            {mutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            بحث
          </Button>
        </form>

        <AnimatePresence mode="wait">
          {notFound && (
            <motion.div
              key="not-found"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-red-50 border border-red-100 rounded-2xl p-6 text-center"
            >
              <XCircle className="w-10 h-10 text-red-300 mx-auto mb-3" />
              <p className="font-semibold text-red-700 mb-1">لم يتم العثور على الطلب</p>
              <p className="text-sm text-red-500">تأكد من رقم المرجع وحاول مرة أخرى</p>
            </motion.div>
          )}

          {ticket && (
            <motion.div
              key="ticket"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-5"
            >
              {/* Ticket header */}
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <p className="text-xs text-gray-400 mb-1">رقم المرجع</p>
                  <p className="font-mono font-black text-xl text-tomoh-burgundy">{ticket.reference}</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className={getPriorityColor(ticket.priority)}>
                    {getPriorityLabel(ticket.priority)}
                  </Badge>
                  <Badge className={getStatusColor(ticket.status)}>
                    {getStatusLabel(ticket.status)}
                  </Badge>
                </div>
              </div>

              {/* Type & dates */}
              <div className="bg-gray-50 rounded-xl p-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-gray-400 mb-1">نوع الطلب</p>
                  <p className="font-semibold text-gray-800">{typeLabels[ticket.type] ?? ticket.type}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">تاريخ الإرسال</p>
                  <p className="font-semibold text-gray-800">{formatDate(ticket.created_at)}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-gray-400 mb-1">الموضوع</p>
                  <p className="font-semibold text-gray-800">{ticket.title}</p>
                </div>
              </div>

              {/* AI Summary */}
              {ticket.ai_summary && (
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                  <p className="text-xs font-semibold text-slate-500 mb-1 flex items-center gap-1">
                    🤖 ملخص الذكاء الاصطناعي
                  </p>
                  <p className="text-sm text-slate-700">{ticket.ai_summary}</p>
                  {ticket.ai_team && (
                    <p className="text-xs text-slate-400 mt-2">
                      الفريق المختص: <span className="font-semibold">{ticket.ai_team}</span>
                    </p>
                  )}
                </div>
              )}

              {/* Status timeline */}
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-4">مسار الطلب</p>
                <div className="relative">
                  {statusSteps.map((step, index) => {
                    const isCompleted = index <= currentStepIndex;
                    const isCurrent = index === currentStepIndex;
                    const labels: Record<string, string> = {
                      new: "استُلم الطلب",
                      under_review: "تحت المراجعة",
                      in_progress: "قيد التنفيذ",
                      resolved: "تم الحل",
                    };
                    return (
                      <div key={step} className="flex items-start gap-4 mb-4 last:mb-0">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-all ${
                          isCompleted
                            ? "bg-tomoh-burgundy border-tomoh-burgundy"
                            : "bg-white border-gray-200"
                        }`}>
                          {isCompleted ? (
                            <CheckCircle className="w-4 h-4 text-white" />
                          ) : (
                            <div className="w-2 h-2 rounded-full bg-gray-300" />
                          )}
                        </div>
                        <div className="flex-1 pt-1">
                          <p className={`text-sm font-semibold ${isCompleted ? "text-gray-900" : "text-gray-400"}`}>
                            {labels[step]}
                          </p>
                          {isCurrent && (
                            <p className="text-xs text-tomoh-burgundy mt-0.5 font-medium">
                              الحالة الحالية
                            </p>
                          )}
                        </div>
                        {/* Connector line */}
                        {index < statusSteps.length - 1 && (
                          <div className="absolute right-4 mt-8 w-0.5 h-6 bg-gray-100" style={{ top: index * 52 + 32 }} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Status icon */}
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                {statusIcons[ticket.status]}
                <p className="text-sm text-gray-700">
                  {ticket.status === "new" && "تم استلام طلبك وهو في قائمة المراجعة."}
                  {ticket.status === "under_review" && "الفريق يراجع طلبك حالياً."}
                  {ticket.status === "in_progress" && "يعمل الفريق على معالجة طلبك الآن."}
                  {ticket.status === "resolved" && "تم حل الطلب بنجاح! شكراً لمساهمتك."}
                  {ticket.status === "closed" && "تم إغلاق هذا الطلب."}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!ticket && !notFound && !mutation.isPending && (
          <div className="text-center py-8 text-gray-400">
            <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">أدخل رقم المرجع للبحث عن طلبك</p>
            <p className="text-xs mt-1 text-gray-300">مثال: TMOH-2026-1045</p>
          </div>
        )}
      </div>
    </div>
  );
}
