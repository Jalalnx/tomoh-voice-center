import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Star, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/forms/FormField";
import { SuccessCard } from "@/components/forms/SuccessCard";
import { submitSatisfaction } from "@/lib/api";
import type { SatisfactionForm as SatisfactionFormType } from "@/types";

const schema = z.object({
  course_rating: z.number().min(1, "يرجى تقييم الدورة").max(5),
  instructor_rating: z.number().min(1, "يرجى تقييم المدرب").max(5),
  nps_score: z.number({ required_error: "يرجى اختيار تقييم NPS" }).min(0).max(10),
  liked: z.string().min(5, "أخبرنا ماذا أعجبك"),
  improvement: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

function StarRating({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) {
  const [hovered, setHovered] = useState(0);

  return (
    <div>
      <p className="text-sm font-semibold text-gray-700 mb-2">{label}</p>
      <div className="flex gap-1" onMouseLeave={() => setHovered(0)}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHovered(star)}
            className="transition-transform hover:scale-110"
          >
            <Star
              className={`w-8 h-8 transition-colors ${
                star <= (hovered || value)
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-200"
              }`}
            />
          </button>
        ))}
        {value > 0 && (
          <span className="text-sm text-gray-500 mr-2 self-center">
            {["", "ضعيف", "مقبول", "جيد", "جيد جداً", "ممتاز"][value]}
          </span>
        )}
      </div>
    </div>
  );
}

function NpsScore({ value, onChange }: { value: number | null; onChange: (v: number) => void }) {
  return (
    <div>
      <p className="text-xs text-gray-500 flex justify-between mb-3">
        <span>غير محتمل</span>
        <span>محتمل جداً</span>
      </p>
      <div className="flex gap-1.5 flex-wrap">
        {Array.from({ length: 11 }, (_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onChange(i)}
            className={`w-10 h-10 rounded-lg border-2 text-sm font-bold transition-all ${
              value === i
                ? "border-tomoh-burgundy bg-tomoh-burgundy text-white"
                : i <= 6
                ? "border-red-100 text-red-400 hover:border-red-300"
                : i <= 8
                ? "border-yellow-100 text-yellow-500 hover:border-yellow-300"
                : "border-green-100 text-green-600 hover:border-green-300"
            }`}
            aria-pressed={value === i}
          >
            {i}
          </button>
        ))}
      </div>
    </div>
  );
}

export function Satisfaction() {
  const [success, setSuccess] = useState<{ reference: string; message: string } | null>(null);
  const [courseRating, setCourseRating] = useState(0);
  const [instructorRating, setInstructorRating] = useState(0);
  const [npsScore, setNpsScore] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const mutation = useMutation({
    mutationFn: (data: SatisfactionFormType) => submitSatisfaction(data),
    onSuccess: (res) => setSuccess({ reference: res.reference, message: res.message }),
  });

  const onSubmit = (values: FormValues) => mutation.mutate(values);

  if (success) {
    return (
      <div className="container mx-auto max-w-lg px-4 py-12">
        <SuccessCard
          reference={success.reference}
          message={success.message}
          onReset={() => {
            setSuccess(null);
            reset();
            setCourseRating(0);
            setInstructorRating(0);
            setNpsScore(null);
          }}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-10">
      <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <Link to="/" className="hover:text-gray-600 transition-colors">الرئيسية</Link>
        <ChevronRight className="w-4 h-4 rotate-180" />
        <span className="text-gray-700 font-medium">تقييم التجربة</span>
      </nav>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-sm border p-8"
      >
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-yellow-100 rounded-2xl flex items-center justify-center">
            <Star className="w-6 h-6 text-yellow-500" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">قيّم تجربتك</h1>
            <p className="text-sm text-gray-500">رأيك يساعدنا في تقديم تجربة تعليمية أفضل</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Course Rating */}
          <div>
            <StarRating
              value={courseRating}
              label="كيف تقيم الدورة؟"
              onChange={(v) => { setCourseRating(v); setValue("course_rating", v); }}
            />
            {errors.course_rating && (
              <p className="text-xs text-red-500 mt-1">{errors.course_rating.message}</p>
            )}
          </div>

          {/* Instructor Rating */}
          <div>
            <StarRating
              value={instructorRating}
              label="كيف تقيم المدرب؟"
              onChange={(v) => { setInstructorRating(v); setValue("instructor_rating", v); }}
            />
            {errors.instructor_rating && (
              <p className="text-xs text-red-500 mt-1">{errors.instructor_rating.message}</p>
            )}
          </div>

          {/* NPS */}
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-3">
              من 0 إلى 10، كيف تقيّم احتمالية توصيتك بطموح لصديق؟
            </p>
            <NpsScore
              value={npsScore}
              onChange={(v) => { setNpsScore(v); setValue("nps_score", v, { shouldValidate: true }); }}
            />
            {errors.nps_score && (
              <p className="text-xs text-red-500 mt-2">{errors.nps_score.message}</p>
            )}
          </div>

          {/* Liked */}
          <FormField label="ماذا أعجبك؟" required error={errors.liked?.message}>
            <Textarea
              placeholder="أعجبني أسلوب الشرح، والمحتوى العملي..."
              rows={3}
              {...register("liked")}
            />
          </FormField>

          {/* Improvement */}
          <FormField label="ما الذي يحتاج للتحسين؟" optional>
            <Textarea
              placeholder="أتمنى لو كان هناك..."
              rows={3}
              {...register("improvement")}
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
            {mutation.isPending ? "جاري الإرسال..." : "⭐ إرسال التقييم"}
          </Button>
        </form>
      </motion.div>
    </div>
  );
}
