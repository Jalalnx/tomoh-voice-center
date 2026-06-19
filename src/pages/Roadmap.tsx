import { motion } from "framer-motion";
import { Map, Loader2, ChevronRight, Inbox } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getRoadmap } from "@/lib/api";
import type { RoadmapItem } from "@/types";
import { Badge } from "@/components/ui/badge";

const columns: {
  status: RoadmapItem["status"];
  label: string;
  emoji: string;
  color: string;
  bg: string;
  border: string;
}[] = [
  { status: "planned",     label: "مخطط",            emoji: "📋", color: "text-blue-700",      bg: "bg-blue-50",      border: "border-blue-200"      },
  { status: "in_progress", label: "جارٍ التنفيذ",     emoji: "⚙️", color: "text-burgundy-700",  bg: "bg-burgundy-50",  border: "border-burgundy-200"  },
  { status: "released",    label: "تم الإطلاق",      emoji: "✅", color: "text-green-700",     bg: "bg-green-50",     border: "border-green-200"     },
];

export function Roadmap() {
  const { data: items = [], isLoading } = useQuery({
    queryKey: ["roadmap"],
    queryFn: getRoadmap,
  });

  return (
    <div className="container mx-auto max-w-6xl px-4 py-10">
      <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <Link to="/" className="hover:text-gray-600 transition-colors">الرئيسية</Link>
        <ChevronRight className="w-4 h-4 rotate-180" />
        <span className="text-gray-700 font-medium">خارطة الطريق</span>
      </nav>

      <div className="mb-8 text-center">
        <div className="w-14 h-14 bg-burgundy-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Map className="w-7 h-7 text-tomoh-burgundy" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">خارطة طريق طموح</h1>
        <p className="text-gray-500 text-sm max-w-lg mx-auto">
          نؤمن بالشفافية الكاملة. هنا كل ما نخطط له وما ننجزه بناءً على اقتراحاتكم.
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-gray-300" />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Inbox className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">لا توجد بنود في خارطة الطريق حالياً</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {columns.map((col) => {
            const colItems = items.filter((i) => i.status === col.status);
            return (
              <div key={col.status}>
                <div className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 ${col.bg} ${col.border} mb-4`}>
                  <span className="text-lg">{col.emoji}</span>
                  <h2 className={`font-bold ${col.color}`}>{col.label}</h2>
                  <Badge variant="outline" className={`mr-auto ${col.color} border-current`}>
                    {colItems.length}
                  </Badge>
                </div>

                {colItems.length === 0 ? (
                  <div className="text-center py-8 text-gray-300 text-sm">لا يوجد</div>
                ) : (
                  <div className="space-y-3">
                    {colItems.map((item, i) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.07 }}
                        className="bg-white rounded-xl border p-4 shadow-soft hover:shadow-card transition-shadow"
                      >
                        <h3 className="font-bold text-sm text-gray-900 mb-1">{item.title}</h3>
                        <p className="text-xs text-gray-500 leading-relaxed mb-3">{item.description}</p>
                        {item.released_at && (
                          <div className="flex items-center gap-1 text-xs text-green-600">
                            <span>✓</span>
                            <span>
                              أُطلق في{" "}
                              {new Date(item.released_at).toLocaleDateString("ar-SA", {
                                month: "long",
                                year: "numeric",
                              })}
                            </span>
                          </div>
                        )}
                        {item.planned_for && (
                          <div className="flex items-center gap-1 text-xs text-blue-600">
                            <span>📅</span>
                            <span>مخطط لـ {item.planned_for}</span>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-12 bg-gradient-soft rounded-2xl border border-burgundy-100 p-6 text-center">
        <p className="text-sm text-gray-700 font-medium mb-2">لديك اقتراح تريد رؤيته هنا؟</p>
        <p className="text-xs text-gray-500 mb-4">اقتراحاتكم هي الوقود الذي يحرك خارطة طموح</p>
        <Link
          to="/suggestion"
          className="inline-flex items-center gap-2 bg-tomoh-burgundy text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-tomoh-burgundy-dark transition-colors"
        >
          💡 اقترح ميزة جديدة
        </Link>
      </div>
    </div>
  );
}
