import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Rocket, ThumbsUp, ChevronRight, Loader2, Inbox } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getFeatures, voteFeature, unvoteFeature } from "@/lib/api";
import type { Feature } from "@/types";
import { Badge } from "@/components/ui/badge";
import { getStatusLabel, getStatusColor } from "@/lib/utils";

const featureIcons: Record<string, string> = {
  android:     "🤖",
  ios:         "🍎",
  dark_mode:   "🌙",
  download:    "⬇️",
  certificate: "🏆",
  ai:          "🧠",
  live:        "📡",
  offline:     "📶",
  community:   "👥",
};

// Derives a stable browser fingerprint from canvas, screen and locale.
// Not perfect — but good enough to catch accidental duplicate votes across tabs
// and to supplement the IP-based check.  No external library needed.
function buildFingerprint(): string {
  try {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.textBaseline = "top";
      ctx.font = "14px Arial";
      ctx.fillStyle = "#f60";
      ctx.fillRect(125, 1, 62, 20);
      ctx.fillStyle = "#069";
      ctx.fillText("Tomoh", 2, 15);
      ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
      ctx.fillText("🔒", 4, 17);
    }
    const bits = [
      canvas.toDataURL(),
      navigator.userAgent,
      `${screen.width}x${screen.height}x${screen.colorDepth}`,
      Intl.DateTimeFormat().resolvedOptions().timeZone,
      navigator.language,
    ].join("|");

    // djb2 hash → hex string (no crypto needed, not for security, just dedup)
    let hash = 5381;
    for (let i = 0; i < bits.length; i++) {
      hash = ((hash << 5) + hash) ^ bits.charCodeAt(i);
      hash = hash >>> 0; // keep unsigned 32-bit
    }
    return hash.toString(16).padStart(8, "0");
  } catch {
    return "unknown";
  }
}

export function FeatureVoting() {
  const queryClient = useQueryClient();
  const [localVotes, setLocalVotes] = useState<Record<number, boolean>>({});
  const fingerprint = useRef<string>("");

  useEffect(() => {
    fingerprint.current = buildFingerprint();
  }, []);

  const { data: features = [], isLoading } = useQuery({
    queryKey: ["features"],
    queryFn: () => getFeatures(fingerprint.current),
  });

  const voteMutation = useMutation({
    mutationFn: (feature: Feature) => {
      const fp = fingerprint.current;
      return (feature.user_voted || localVotes[feature.id])
        ? unvoteFeature(feature.id, fp)
        : voteFeature(feature.id, fp);
    },
    onMutate: (feature) => {
      setLocalVotes((prev) => ({ ...prev, [feature.id]: !feature.user_voted }));
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["features"] }),
  });

  const sorted = [...features].sort((a, b) => b.votes_count - a.votes_count);

  return (
    <div className="container mx-auto max-w-2xl px-4 py-10">
      <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <Link to="/" className="hover:text-gray-600 transition-colors">الرئيسية</Link>
        <ChevronRight className="w-4 h-4 rotate-180" />
        <span className="text-gray-700 font-medium">التصويت على الميزات</span>
      </nav>

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center">
            <Rocket className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">صوّت على الميزات القادمة</h1>
            <p className="text-sm text-gray-500">أعلى الأصوات يكون أولوية التطوير</p>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-gray-300" />
        </div>
      ) : sorted.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Inbox className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">لا توجد ميزات للتصويت حالياً</p>
        </div>
      ) : (
        <motion.div
          className="space-y-3"
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.06 } }, hidden: {} }}
        >
          {sorted.map((feature, index) => {
            const isVoted = localVotes[feature.id] !== undefined
              ? localVotes[feature.id]
              : feature.user_voted;
            const maxVotes = sorted[0]?.votes_count || 1;
            const pct = Math.max(4, (feature.votes_count / maxVotes) * 100);

            return (
              <motion.div
                key={feature.id}
                variants={{ hidden: { opacity: 0, x: -20 }, show: { opacity: 1, x: 0 } }}
                className={`bg-white rounded-2xl border-2 p-5 flex items-center gap-4 transition-all ${
                  isVoted ? "border-tomoh-burgundy bg-burgundy-50/50" : "border-gray-100 hover:border-gray-200"
                }`}
              >
                <div className="text-xl font-black text-gray-200 w-6 text-center flex-shrink-0">{index + 1}</div>
                <div className="text-2xl flex-shrink-0">
                  {featureIcons[feature.icon ?? ""] ?? "✨"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-bold text-gray-900 text-sm">{feature.title}</h3>
                    <Badge className={`text-xs ${getStatusColor(feature.status)}`} variant="outline">
                      {getStatusLabel(feature.status)}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500 mb-3">{feature.description}</p>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-l from-tomoh-burgundy to-burgundy-400 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
                <button
                  onClick={() => voteMutation.mutate(feature)}
                  disabled={voteMutation.isPending}
                  className={`flex flex-col items-center gap-1 px-4 py-3 rounded-xl border-2 transition-all flex-shrink-0 ${
                    isVoted
                      ? "border-tomoh-burgundy bg-tomoh-burgundy text-white"
                      : "border-gray-200 hover:border-burgundy-300 hover:bg-burgundy-50 text-gray-600"
                  }`}
                >
                  <ThumbsUp className={`w-4 h-4 ${isVoted ? "fill-white" : ""}`} />
                  <span className="text-xs font-bold">{feature.votes_count}</span>
                </button>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      <p className="text-center text-xs text-gray-400 mt-8">
        يمكنك التصويت على أكثر من ميزة. يتم تحديث الترتيب بشكل مستمر.
      </p>
    </div>
  );
}
