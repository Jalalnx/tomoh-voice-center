import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Bug, Lightbulb, BookOpen, Star, Rocket, Map,
  ArrowLeft, ChevronLeft, TrendingUp, Users, CheckCircle,
} from "lucide-react";
import { platformApi } from "@/lib/api";

/* ── animation variants ── */
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};
const stagger = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
};

/* ── data ── */
const categories = [
  {
    icon: Bug,
    emoji: "🐛",
    title: "الإبلاغ عن مشكلة",
    desc: "واجهت خللاً تقنياً؟ أخبرنا حتى نحله فوراً",
    path: "/bug-report",
    accent: "text-red-600",
    bg:     "bg-red-50",
    border: "hover:border-red-300",
    ring:   "group-hover:ring-red-100",
  },
  {
    icon: Lightbulb,
    emoji: "💡",
    title: "اقتراح تحسين",
    desc: "لديك فكرة تجعل طموح أفضل؟ شاركنا إياها",
    path: "/suggestion",
    accent: "text-amber-600",
    bg:     "bg-amber-50",
    border: "hover:border-amber-300",
    ring:   "group-hover:ring-amber-100",
  },
  {
    icon: BookOpen,
    emoji: "📚",
    title: "ترشيح دورة",
    desc: "دورة أو مهارة تتمنى تعلمها؟ اقترحها علينا",
    path: "/course-request",
    accent: "text-blue-600",
    bg:     "bg-blue-50",
    border: "hover:border-blue-300",
    ring:   "group-hover:ring-blue-100",
  },
  {
    icon: Star,
    emoji: "⭐",
    title: "تقييم تجربتك",
    desc: "قيّم الدورات والمدربين وساعدنا في الارتقاء",
    path: "/satisfaction",
    accent: "text-burgundy-700",
    bg:     "bg-burgundy-50",
    border: "hover:border-burgundy-300",
    ring:   "group-hover:ring-burgundy-100",
  },
  {
    icon: Rocket,
    emoji: "🚀",
    title: "طلب ميزة جديدة",
    desc: "صوّت على الميزات القادمة وشكّل مستقبل المنصة",
    path: "/features",
    accent: "text-orange-600",
    bg:     "bg-orange-50",
    border: "hover:border-orange-300",
    ring:   "group-hover:ring-orange-100",
  },
  {
    icon: Map,
    emoji: "🗺️",
    title: "خارطة الطريق",
    desc: "تابع ما نعمل عليه وما أنجزناه من اقتراحاتكم",
    path: "/roadmap",
    accent: "text-teal-600",
    bg:     "bg-teal-50",
    border: "hover:border-teal-300",
    ring:   "group-hover:ring-teal-100",
  },
];

interface VoiceStats {
  resolved_bugs: number;
  implemented_suggestions: number;
  total_participants: number;
}

function formatStat(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}م+`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}ك+`;
  return n > 0 ? `${n}+` : "—";
}

/* ── floating badge pill ── */
function FloatingPill({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`absolute hidden lg:flex items-center gap-2 bg-white border border-gray-100 rounded-2xl px-4 py-2.5 shadow-card text-sm font-medium text-gray-700 pointer-events-none select-none ${className}`}>
      {children}
    </div>
  );
}

export function Home() {
  const [stats, setStats] = useState<VoiceStats | null>(null);

  useEffect(() => {
    platformApi.get("/voice/stats").then((res) => {
      const d = res.data?.data ?? res.data;
      if (d) setStats(d);
    }).catch(() => {});
  }, []);

  const statItems = [
    { icon: TrendingUp,  label: "مشكلة تم حلها",  value: stats ? formatStat(stats.resolved_bugs)             : null },
    { icon: CheckCircle, label: "اقتراح طُبّق",    value: stats ? formatStat(stats.implemented_suggestions)   : null },
    { icon: Users,       label: "مستخدم مشارك",   value: stats ? formatStat(stats.total_participants)         : null },
  ];

  return (
    <div className="min-h-screen bg-white">

      {/* ════════════════════════ HERO ════════════════════════ */}
      <section className="relative overflow-hidden bg-white">
        {/* Subtle grid texture */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `repeating-linear-gradient(0deg,#000 0,#000 1px,transparent 1px,transparent 40px),
                              repeating-linear-gradient(90deg,#000 0,#000 1px,transparent 1px,transparent 40px)`,
          }}
        />

        {/* Radial glow — top center */}
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full bg-burgundy-100/60 blur-3xl pointer-events-none" />

        {/* Floating context pills */}
        <FloatingPill className="top-28 right-[8%] animate-float" style={{ animationDelay: "0s" } as React.CSSProperties}>
          <span className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0" />
          تم حل المشكلة ✓
        </FloatingPill>
        <FloatingPill className="top-44 left-[6%] animate-float" style={{ animationDelay: "0.8s" } as React.CSSProperties}>
          <span>💡</span> اقتراح جديد بانتظار المراجعة
        </FloatingPill>
        <FloatingPill className="bottom-24 right-[10%] animate-float" style={{ animationDelay: "1.4s" } as React.CSSProperties}>
          <span>🚀</span> Dark Mode — في التطوير الآن
        </FloatingPill>

        {/* Main content */}
        <div className="relative container mx-auto max-w-3xl px-4 pt-20 pb-10 text-center">
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
          >
            {/* Badge */}
            <motion.div variants={fadeUp} className="flex justify-center mb-7">
              <span className="inline-flex items-center gap-2 bg-burgundy-50 text-tomoh-burgundy border border-burgundy-100 rounded-full px-4 py-1.5 text-sm font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-tomoh-burgundy animate-pulse" />
                نستمع إليك دائماً
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={fadeUp}
              className="text-4xl md:text-6xl font-black text-gray-900 leading-tight mb-5"
            >
              رأيك يبني{" "}
              <span className="relative inline-block">
                <span className="text-tomoh-burgundy">طموح</span>
                <svg
                  className="absolute -bottom-1 right-0 w-full"
                  viewBox="0 0 100 8"
                  preserveAspectRatio="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M0 6 Q25 1 50 4 Q75 7 100 2"
                    stroke="#923333"
                    strokeWidth="2.5"
                    fill="none"
                    strokeLinecap="round"
                    opacity="0.5"
                  />
                </svg>
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              variants={fadeUp}
              className="text-lg text-gray-500 max-w-xl mx-auto leading-relaxed mb-9"
            >
              شاركنا اقتراحاتك، أخبرنا عن أي مشكلة تواجهك، أو رشّح دورة
              ومهارة تتمنى تعلمها — وتابع كل طلب برقم مرجعي فوري.
            </motion.p>

            {/* CTAs */}
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/bug-report"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-tomoh-burgundy hover:bg-tomoh-burgundy-dark text-white font-bold px-7 py-3.5 rounded-xl transition-all shadow-md hover:shadow-hover text-sm"
              >
                <Bug className="w-4 h-4" />
                أبلغ عن مشكلة
              </Link>
              <Link
                to="/suggestion"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white border-2 border-gray-200 hover:border-burgundy-300 text-gray-700 hover:text-tomoh-burgundy font-bold px-7 py-3.5 rounded-xl transition-all text-sm"
              >
                <Lightbulb className="w-4 h-4" />
                شارك اقتراحاً
              </Link>
              <Link
                to="/track"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-gray-500 hover:text-tomoh-burgundy font-semibold px-4 py-3.5 rounded-xl transition-colors text-sm"
              >
                تتبع طلب
                <ChevronLeft className="w-4 h-4" />
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Stats strip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="relative border-t border-b border-gray-100 bg-gray-50/60"
        >
          <div className="container mx-auto max-w-2xl px-4 py-5">
            <div className="grid grid-cols-3 divide-x divide-x-reverse divide-gray-200">
              {statItems.map((s) => (
                <div key={s.label} className="text-center px-4">
                  {s.value === null ? (
                    <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mx-auto mb-1" />
                  ) : (
                    <p className="text-2xl font-black text-tomoh-burgundy">{s.value}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* ════════════════════════ CATEGORIES ════════════════════════ */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-2">كيف يمكننا مساعدتك؟</h2>
            <p className="text-gray-400 text-sm">اختر نوع طلبك وسيصل للفريق المختص مباشرةً</p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <motion.div key={cat.path} variants={fadeUp}>
                  <Link to={cat.path} className="group block h-full">
                    <div
                      className={`h-full bg-white rounded-2xl border-2 border-gray-100 ${cat.border} p-6 transition-all duration-200 hover:shadow-hover ring-4 ring-transparent ${cat.ring}`}
                    >
                      {/* Icon */}
                      <div className={`w-11 h-11 rounded-xl ${cat.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200`}>
                        <Icon className={`w-5 h-5 ${cat.accent}`} />
                      </div>

                      {/* Text */}
                      <h3 className="font-bold text-gray-900 text-sm mb-1.5 flex items-center gap-1.5">
                        <span>{cat.emoji}</span>
                        {cat.title}
                      </h3>
                      <p className="text-xs text-gray-500 leading-relaxed mb-4">{cat.desc}</p>

                      {/* CTA link */}
                      <div className={`flex items-center gap-1 text-xs font-bold ${cat.accent} group-hover:gap-2 transition-all duration-150`}>
                        <span>ابدأ الآن</span>
                        <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ════════════════════════ TRACK CTA ════════════════════════ */}
      <section className="px-4 pb-16">
        <div className="container mx-auto max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-between gap-5 bg-gray-50 border border-gray-200 rounded-2xl px-7 py-6"
          >
            <div>
              <p className="font-bold text-gray-900 mb-1">لديك طلب سابق؟</p>
              <p className="text-sm text-gray-500">تابع حالته في أي وقت برقم المرجع</p>
            </div>
            <Link
              to="/track"
              className="flex-shrink-0 inline-flex items-center gap-2 bg-white border-2 border-gray-200 hover:border-burgundy-300 hover:text-tomoh-burgundy text-gray-700 font-bold px-5 py-2.5 rounded-xl text-sm transition-all"
            >
              تتبع طلبي
              <ArrowLeft className="w-4 h-4 rotate-180" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
