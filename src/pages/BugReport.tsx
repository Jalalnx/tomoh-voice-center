import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Bug, Upload, X, AlertCircle, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormField } from "@/components/forms/FormField";
import { SuccessCard } from "@/components/forms/SuccessCard";
import { submitBugReport } from "@/lib/api";
import { detectBrowserInfo } from "@/lib/utils";
import { useAuth, LoginPrompt } from "@/contexts/AuthContext";
import type { BugReportForm as BugReportFormType, BugCategory, ImpactLevel } from "@/types";

const schema = z.object({
  name: z.string().optional(),
  email: z.string().email("بريد إلكتروني غير صحيح"),
  phone: z.string().optional(),
  category: z.enum(["login", "payment", "video", "quiz", "certificate", "profile", "other"]),
  description: z.string().min(20, "يرجى وصف المشكلة بشكل أوضح (20 حرف على الأقل)"),
  impact: z.enum(["low", "medium", "high", "blocking"]),
});

type FormValues = z.infer<typeof schema>;

const categoryOptions = [
  { value: "login", label: "تسجيل الدخول" },
  { value: "payment", label: "الدفع والاشتراك" },
  { value: "video", label: "مشاهدة الدروس" },
  { value: "quiz", label: "الاختبارات" },
  { value: "certificate", label: "الشهادات" },
  { value: "profile", label: "الحساب الشخصي" },
  { value: "other", label: "أخرى" },
];

const impactOptions = [
  { value: "low", label: "منخفض — مشكلة بسيطة", color: "text-green-600", bg: "border-green-200 bg-green-50" },
  { value: "medium", label: "متوسط — يعيق بعض الأمور", color: "text-yellow-600", bg: "border-yellow-200 bg-yellow-50" },
  { value: "high", label: "مرتفع — يؤثر على تجربتي", color: "text-orange-600", bg: "border-orange-200 bg-orange-50" },
  { value: "blocking", label: "يمنعني من استخدام المنصة", color: "text-red-600", bg: "border-red-200 bg-red-50" },
];

export function BugReport() {
  const { user } = useAuth();
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [success, setSuccess] = useState<{ reference: string; message: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { impact: "medium", category: "other" },
  });

  useEffect(() => {
    if (user) {
      setValue("name", user.username);
      setValue("email", user.email);
    }
  }, [user, setValue]);

  const selectedImpact = watch("impact");
  const selectedCategory = watch("category");

  const mutation = useMutation({
    mutationFn: (data: BugReportFormType) => submitBugReport(data),
    onSuccess: (res) => {
      setSuccess({ reference: res.reference, message: res.message });
    },
  });

  const onSubmit = (values: FormValues) => {
    const browserInfo = detectBrowserInfo();
    mutation.mutate({
      ...values,
      category: values.category as BugCategory,
      impact: values.impact as ImpactLevel,
      screenshot: screenshot ?? undefined,
      ...browserInfo,
    });
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setScreenshot(file);
  };

  if (success) {
    return (
      <div className="container mx-auto max-w-lg px-4 py-12">
        <SuccessCard
          reference={success.reference}
          message={success.message}
          onReset={() => { setSuccess(null); reset(); setScreenshot(null); }}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <Link to="/" className="hover:text-gray-600 transition-colors">الرئيسية</Link>
        <ChevronRight className="w-4 h-4 rotate-180" />
        <span className="text-gray-700 font-medium">الإبلاغ عن مشكلة</span>
      </nav>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-sm border p-8"
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center">
            <Bug className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">الإبلاغ عن مشكلة</h1>
            <p className="text-sm text-gray-500">سنراجع البلاغ ونتواصل معك خلال 24 ساعة</p>
          </div>
        </div>

        <LoginPrompt />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Personal Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="الاسم" optional>
              <Input placeholder="اسمك" {...register("name")} />
            </FormField>
            <FormField label="البريد الإلكتروني" htmlFor="email" required error={errors.email?.message}>
              <Input id="email" type="email" placeholder="example@email.com" {...register("email")} />
            </FormField>
          </div>

          <FormField label="رقم الهاتف" optional>
            <Input placeholder="+966 5X XXX XXXX" {...register("phone")} />
          </FormField>

          {/* Category */}
          <FormField label="نوع المشكلة" required error={errors.category?.message}>
            <Select
              value={selectedCategory}
              onValueChange={(v) => setValue("category", v as BugCategory)}
            >
              <SelectTrigger>
                <SelectValue placeholder="اختر نوع المشكلة" />
              </SelectTrigger>
              <SelectContent>
                {categoryOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          {/* Description */}
          <FormField
            label="وصف المشكلة"
            required
            hint="ماذا حدث؟ وما الذي كنت تتوقع حدوثه؟"
            error={errors.description?.message}
          >
            <Textarea
              placeholder="صف المشكلة بالتفصيل..."
              rows={5}
              {...register("description")}
            />
          </FormField>

          {/* Impact */}
          <FormField label="درجة التأثير" required error={errors.impact?.message}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {impactOptions.map((opt) => (
                <label
                  key={opt.value}
                  className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedImpact === opt.value
                      ? opt.bg + " " + opt.color.replace("text-", "border-").replace("600", "400")
                      : "border-gray-100 hover:border-gray-200"
                  }`}
                >
                  <input
                    type="radio"
                    className="hidden"
                    value={opt.value}
                    {...register("impact")}
                    onChange={() => setValue("impact", opt.value as ImpactLevel)}
                  />
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    selectedImpact === opt.value ? "border-current" : "border-gray-300"
                  }`}>
                    {selectedImpact === opt.value && (
                      <div className="w-2 h-2 rounded-full bg-current" />
                    )}
                  </div>
                  <span className={`text-sm font-medium ${selectedImpact === opt.value ? opt.color : "text-gray-700"}`}>
                    {opt.label}
                  </span>
                </label>
              ))}
            </div>
          </FormField>

          {/* Screenshot */}
          <FormField label="صورة توضيحية" optional hint="PNG أو JPG — الحد الأقصى 5MB">
            <div
              className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer hover:border-burgundy-300 hover:bg-burgundy-50/50 transition-all"
              onClick={() => fileRef.current?.click()}
            >
              {screenshot ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                      📷
                    </div>
                    <span className="font-medium">{screenshot.name}</span>
                    <span className="text-gray-400">
                      ({(screenshot.size / 1024 / 1024).toFixed(1)} MB)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setScreenshot(null); }}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="text-gray-400">
                  <Upload className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">اسحب الصورة هنا أو انقر للاختيار</p>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
          </FormField>

          {/* Auto-collected info notice */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3">
            <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-blue-700 leading-relaxed">
              سيتم جمع معلومات تقنية تلقائياً (المتصفح، نظام التشغيل، الجهاز، حجم الشاشة، الرابط الحالي) لمساعدتنا في إعادة إنتاج المشكلة.
            </p>
          </div>

          {mutation.isError && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-sm text-red-700">
              حدث خطأ أثناء الإرسال. يرجى المحاولة مرة أخرى.
            </div>
          )}

          <Button
            type="submit"
            className="w-full h-12 text-base font-bold bg-red-500 hover:bg-red-600"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "جاري الإرسال..." : "🐛 إرسال البلاغ"}
          </Button>
        </form>
      </motion.div>
    </div>
  );
}
