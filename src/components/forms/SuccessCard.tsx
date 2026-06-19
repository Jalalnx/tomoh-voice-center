import { motion } from "framer-motion";
import { CheckCircle, Copy, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface SuccessCardProps {
  reference: string;
  message: string;
  onReset: () => void;
}

export function SuccessCard({ reference, message, onReset }: SuccessCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(reference);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-10 px-6"
    >
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
        <CheckCircle className="w-10 h-10 text-green-600" />
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mb-2">تم الإرسال بنجاح!</h2>
      <p className="text-gray-500 text-sm mb-8 max-w-sm mx-auto leading-relaxed">{message}</p>

      <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-5 mb-6 max-w-xs mx-auto">
        <p className="text-xs text-gray-500 mb-2">رقم المرجع الخاص بك</p>
        <p className="text-xl font-black tracking-wider text-tomoh-burgundy font-mono">
          {reference}
        </p>
        <button
          onClick={handleCopy}
          className="mt-3 text-xs text-gray-400 hover:text-gray-700 flex items-center gap-1 mx-auto transition-colors"
        >
          <Copy className="w-3 h-3" />
          {copied ? "تم النسخ!" : "نسخ الرقم"}
        </button>
      </div>

      <p className="text-xs text-gray-400 mb-8">
        احتفظ بهذا الرقم لمتابعة حالة طلبك
      </p>

      <div className="flex items-center justify-center gap-3 flex-wrap">
        <Button onClick={onReset} variant="outline">
          إرسال طلب جديد
        </Button>
        <Link to="/track">
          <Button className="gap-2">
            <span>تتبع الطلب</span>
            <ArrowLeft className="w-4 h-4 rotate-180" />
          </Button>
        </Link>
      </div>
    </motion.div>
  );
}
