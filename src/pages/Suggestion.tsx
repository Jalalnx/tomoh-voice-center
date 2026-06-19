import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Lightbulb, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/forms/FormField";
import { SuccessCard } from "@/components/forms/SuccessCard";
import { submitSuggestion } from "@/lib/api";
import { useAuth, LoginPrompt } from "@/contexts/AuthContext";
import type { SuggestionForm as SuggestionFormType } from "@/types";

const schema = z.object({
  name: z.string().optional(),
  email: z.string().email("بريد إلكتروني غير صحيح").optional().or(z.literal("")),
  area: z.string().min(1, "يرجى اختيار المجال"),
  description: z.string().min(20, "يرجى شرح فكرتك بشكل أوضح"),
  expected_benefit: z.string().min(10, "أخبرنا كيف سيستفيد الطلاب"),
});

type FormValues = z.infer<typeof schema>;

const areaOptions = [
  { value: "design", label: "🎨 تصميم المنصة", desc: "الواجهة والألوان والتخطيط" },
  { value: "speed", label: "⚡ سرعة الموقع", desc: "الأداء وسرعة التحميل" },
  { value: "courses", label: "📚 الدورات", desc: "المحتوى والجودة والتنوع" },
  { value: "quizzes", label: "✏️ الاختبارات", desc: "أسئلة التقييم والتمارين" },
{ value: "community", label: "👥 المجتمع", desc: "التفاعل بين الطلاب" },
  { value: "certificates", label: "🏆 الشهادات", desc: "شهادات الإنجاز والاعتماد" },
  { value: "other", label: "💬 أخرى", desc: "اقتراح عام" },
];

export function Suggestion() {
  const { user } = useAuth();
  const [selectedArea, setSelectedArea] = useState("");
  const [success, setSuccess] = useState<{ reference: string; message: string } | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (user) {
      setValue("name", user.username);
      setValue("email", user.email);
    }
  }, [user, setValue]);

  const mutation = useMutation({
    mutationFn: (data: SuggestionFormType) => submitSuggestion(data),
    onSuccess: (res) => setSuccess({ reference: res.reference, message: res.message }),
  });

  const onSubmit = (values: FormValues) => {
    mutation.mutate({
      ...values,
      email: values.email || undefined,
    });
  };

  if (success) {
    return (
      <div className="container mx-auto max-w-lg px-4 py-12">
        <SuccessCard
          reference={success.reference}
          message={success.message}
          onReset={() => { setSuccess(null); reset(); setSelectedArea(""); }}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-10">
      <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <Link to="/" className="hover:text-gray-600 transition-colors">الرئيسية</Link>
        <ChevronRight className="w-4 h-4 rotate-180" />
        <span className="text-gray-700 font-medium">اقتراح تحسين</span>
      </nav>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-sm border p-8"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-yellow-100 rounded-2xl flex items-center justify-center">
            <Lightbulb className="w-6 h-6 text-yellow-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">اقتراح تحسين</h1>
            <p className="text-sm text-gray-500">فكرتك قد تكون الميزة القادمة في طموح</p>
          </div>
        </div>

        <LoginPrompt />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="الاسم" optional>
              <Input placeholder="اسمك" {...register("name")} />
            </FormField>
            <FormField label="البريد الإلكتروني" optional error={errors.email?.message}>
              <Input type="email" placeholder="example@email.com" {...register("email")} />
            </FormField>
          </div>

          <FormField label="ما الذي تريد تحسينه؟" required error={errors.area?.message}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {areaOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => { setSelectedArea(opt.value); setValue("area", opt.value); }}
                  className={`p-3 rounded-xl border-2 text-center transition-all ${
                    selectedArea === opt.value
                      ? "border-yellow-400 bg-yellow-50"
                      : "border-gray-100 hover:border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <div className="text-xl mb-1">{opt.label.split(" ")[0]}</div>
                  <div className={`text-xs font-semibold ${selectedArea === opt.value ? "text-yellow-700" : "text-gray-700"}`}>
                    {opt.label.substring(opt.label.indexOf(" ") + 1)}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5 hidden sm:block">{opt.desc}</div>
                </button>
              ))}
            </div>
            {errors.area && <p className="text-xs text-red-500 mt-1">{errors.area.message}</p>}
          </FormField>

          <FormField
            label="اشرح فكرتك"
            required
            hint="كلما كانت الفكرة أوضح، كان تطبيقها أسرع"
            error={errors.description?.message}
          >
            <Textarea
              placeholder="اشرح الاقتراح بالتفصيل..."
              rows={5}
              {...register("description")}
            />
          </FormField>

          <FormField
            label="الفائدة المتوقعة"
            required
            hint="كيف سيستفيد الطلاب من هذا التحسين؟"
            error={errors.expected_benefit?.message}
          >
            <Textarea
              placeholder="سيساعد هذا التحسين الطلاب على..."
              rows={3}
              {...register("expected_benefit")}
            />
          </FormField>

          {mutation.isError && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-sm text-red-700">
              حدث خطأ أثناء الإرسال. يرجى المحاولة مرة أخرى.
            </div>
          )}

          <Button
            type="submit"
            className="w-full h-12 text-base font-bold bg-yellow-500 hover:bg-yellow-600"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "جاري الإرسال..." : "💡 إرسال الاقتراح"}
          </Button>
        </form>
      </motion.div>
    </div>
  );
}
