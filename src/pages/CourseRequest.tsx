import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { BookOpen, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/forms/FormField";
import { SuccessCard } from "@/components/forms/SuccessCard";
import { submitCourseRequest } from "@/lib/api";
import type { CourseRequestForm as CourseRequestFormType, CourseLevel } from "@/types";

const schema = z.object({
  name: z.string().optional(),
  email: z.string().email("بريد إلكتروني غير صحيح").optional().or(z.literal("")),
  course_name: z.string().min(2, "أدخل اسم الدورة أو المهارة"),
  reason: z.string().min(20, "أخبرنا لماذا تحتاج هذه الدورة"),
  level: z.enum(["beginner", "intermediate", "advanced"]),
  suggested_instructor: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

const levelOptions = [
  { value: "beginner", label: "مبتدئ", emoji: "🌱", desc: "للمبتدئين من الصفر" },
  { value: "intermediate", label: "متوسط", emoji: "🚀", desc: "يتطلب معرفة مسبقة" },
  { value: "advanced", label: "متقدم", emoji: "⚡", desc: "للمحترفين فقط" },
];

const trendingCourses = ["Flutter", "React Native", "AI/ML", "AWS", "UI/UX", "DevOps", "Python", "Kotlin"];

export function CourseRequest() {
  const [success, setSuccess] = useState<{ reference: string; message: string } | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { level: "beginner" } });

  const selectedLevel = watch("level");

  const mutation = useMutation({
    mutationFn: (data: CourseRequestFormType) => submitCourseRequest(data),
    onSuccess: (res) => setSuccess({ reference: res.reference, message: res.message }),
  });

  const onSubmit = (values: FormValues) => {
    mutation.mutate({
      ...values,
      level: values.level as CourseLevel,
      email: values.email || undefined,
    });
  };

  if (success) {
    return (
      <div className="container mx-auto max-w-lg px-4 py-12">
        <SuccessCard
          reference={success.reference}
          message={success.message}
          onReset={() => { setSuccess(null); reset(); }}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-10">
      <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <Link to="/" className="hover:text-gray-600 transition-colors">الرئيسية</Link>
        <ChevronRight className="w-4 h-4 rotate-180" />
        <span className="text-gray-700 font-medium">ترشيح دورة</span>
      </nav>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-sm border p-8"
      >
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">ترشيح دورة جديدة</h1>
            <p className="text-sm text-gray-500">ساعدنا في اختيار الدورات التي يحتاجها المجتمع</p>
          </div>
        </div>

        {/* Trending suggestions */}
        <div className="mb-6">
          <p className="text-xs text-gray-500 mb-2 font-medium">أكثر المهارات المطلوبة:</p>
          <div className="flex flex-wrap gap-2">
            {trendingCourses.map((course) => (
              <button
                key={course}
                type="button"
                onClick={() => setValue("course_name", course)}
                className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-xs font-semibold hover:bg-blue-100 transition-colors"
              >
                {course}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="الاسم" optional>
              <Input placeholder="اسمك" {...register("name")} />
            </FormField>
            <FormField label="البريد الإلكتروني" optional error={errors.email?.message}>
              <Input type="email" placeholder="example@email.com" {...register("email")} />
            </FormField>
          </div>

          <FormField label="اسم الدورة أو المهارة" required error={errors.course_name?.message}>
            <Input placeholder="مثال: دورة Flutter للمبتدئين" {...register("course_name")} />
          </FormField>

          <FormField
            label="لماذا تحتاجها؟"
            required
            hint="أخبرنا كيف ستفيدك هذه الدورة"
            error={errors.reason?.message}
          >
            <Textarea placeholder="أحتاج هذه الدورة لأن..." rows={4} {...register("reason")} />
          </FormField>

          <FormField label="المستوى المطلوب" required>
            <div className="grid grid-cols-3 gap-3">
              {levelOptions.map((opt) => (
                <label
                  key={opt.value}
                  className={`flex flex-col items-center gap-1 p-4 rounded-xl border-2 cursor-pointer transition-all text-center ${
                    selectedLevel === opt.value
                      ? "border-blue-400 bg-blue-50"
                      : "border-gray-100 hover:border-gray-200"
                  }`}
                >
                  <input
                    type="radio"
                    className="hidden"
                    value={opt.value}
                    {...register("level")}
                    onChange={() => setValue("level", opt.value as CourseLevel)}
                  />
                  <span className="text-2xl">{opt.emoji}</span>
                  <span className={`text-sm font-bold ${selectedLevel === opt.value ? "text-blue-700" : "text-gray-800"}`}>
                    {opt.label}
                  </span>
                  <span className="text-xs text-gray-400">{opt.desc}</span>
                </label>
              ))}
            </div>
          </FormField>

          <FormField label="هل تعرف مدرباً مناسباً؟" optional>
            <Input
              placeholder="اسم المدرب أو حسابه على تويتر/لينكدإن"
              {...register("suggested_instructor")}
            />
          </FormField>

          {mutation.isError && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-sm text-red-700">
              حدث خطأ أثناء الإرسال. يرجى المحاولة مرة أخرى.
            </div>
          )}

          <Button
            type="submit"
            className="w-full h-12 text-base font-bold bg-blue-500 hover:bg-blue-600"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "جاري الإرسال..." : "📚 إرسال الترشيح"}
          </Button>
        </form>
      </motion.div>
    </div>
  );
}
