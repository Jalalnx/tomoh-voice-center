import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import {
  ChevronRight, ChevronDown, GraduationCap, Wrench, CheckCircle, Copy,
  UserPlus, LogIn, ArrowLeft, ListChecks, History, BellRing,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/forms/FormField";
import PageMeta from "@/components/common/PageMeta";
import { useAuth, accountUrl } from "@/contexts/AuthContext";
import { submitServiceRequest, apiErrorMessage } from "@/lib/api";
import { addPendingClaim } from "@/lib/pendingClaims";
import type { ContactMethod, ServiceRequestResponse, ServiceRequestType } from "@/types";

/* Keys must match config('voice.service_requests.types') in the backend —
   the server rejects any field not listed under the chosen type. */
const TYPES: Record<
  ServiceRequestType,
  { label: string; desc: string; icon: typeof GraduationCap; fields: { key: string; label: string; emoji: string }[] }
> = {
  course: {
    label: "كورس",
    desc: "عايز تتعلم مهارة جديدة",
    icon: GraduationCap,
    fields: [
      { key: "programming_basics", label: "أساسيات البرمجة", emoji: "🧩" },
      { key: "web_dev", label: "تطوير الويب", emoji: "🌐" },
      { key: "mobile_dev", label: "تطبيقات الجوال", emoji: "📱" },
      { key: "ai_data", label: "الذكاء الاصطناعي والبيانات", emoji: "🤖" },
      { key: "cybersecurity", label: "الأمن السيبراني", emoji: "🛡️" },
      { key: "cloud_devops", label: "السحابة و DevOps", emoji: "☁️" },
      { key: "ui_ux", label: "تصميم UI/UX", emoji: "🎨" },
      { key: "business_marketing", label: "ريادة الأعمال والتسويق", emoji: "📈" },
      { key: "other", label: "مجال آخر", emoji: "✨" },
    ],
  },
  tech_service: {
    label: "خدمة تقنية",
    desc: "موقع، تطبيق، أو نظام لعملك",
    icon: Wrench,
    fields: [
      { key: "website", label: "تطوير موقع إلكتروني", emoji: "🌐" },
      { key: "mobile_app", label: "تطوير تطبيق جوال", emoji: "📱" },
      { key: "system", label: "نظام إداري / برمجي", emoji: "🗂️" },
      { key: "ecommerce", label: "متجر إلكتروني", emoji: "🛒" },
      { key: "design", label: "تصميم واجهات وهوية", emoji: "🎨" },
      { key: "consulting", label: "استشارة تقنية", emoji: "💬" },
      { key: "other", label: "خدمة أخرى", emoji: "✨" },
    ],
  },
};

const CONTACT_METHODS: { key: ContactMethod; label: string; placeholder: string; type: string }[] = [
  { key: "whatsapp", label: "واتساب", placeholder: "+249 9X XXX XXXX", type: "tel" },
  { key: "phone", label: "هاتف", placeholder: "+249 9X XXX XXXX", type: "tel" },
  { key: "email", label: "بريد إلكتروني", placeholder: "example@email.com", type: "email" },
];

const DETAILS_MAX = 1000;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?[0-9]{7,15}$/;

const META = {
  title: "اطلب كورس أو خدمة تقنية من طموح",
  description:
    "أخبر طموح بما تحتاجه — كورس في البرمجة أو الذكاء الاصطناعي أو التصميم، أو خدمة تقنية مثل تطوير موقع أو تطبيق أو نظام. الطلب يستغرق أقل من دقيقة ودون إنشاء حساب.",
  url: "/service-request",
  keywords: ["طلب كورس", "طلب خدمة تقنية", "تطوير مواقع", "تطوير تطبيقات", "دورات طموح"],
};

function validateContact(method: ContactMethod, value: string): string | null {
  const v = value.trim();
  if (!v) return null;
  if (method === "email") return EMAIL_RE.test(v) ? null : "البريد الإلكتروني غير صحيح";
  return PHONE_RE.test(v.replace(/[\s\-()]/g, "")) ? null : "رقم الهاتف غير صحيح";
}

export function ServiceRequest() {
  const { user } = useAuth();
  const startedAt = useRef(Date.now());

  const [type, setType] = useState<ServiceRequestType | null>(null);
  const [field, setField] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [details, setDetails] = useState("");
  const [showContact, setShowContact] = useState(false);
  const [contactMethod, setContactMethod] = useState<ContactMethod>("whatsapp");
  const [contactValue, setContactValue] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [result, setResult] = useState<ServiceRequestResponse | null>(null);

  const contactError = showContact ? validateContact(contactMethod, contactValue) : null;

  const mutation = useMutation({
    mutationFn: submitServiceRequest,
    onSuccess: (res) => {
      if (res.claim_token) addPendingClaim(res.claim_token, res.reference);
      setResult(res);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
  });

  const chooseType = (t: ServiceRequestType) => {
    if (t !== type) setField(null); // fields differ per type
    setType(t);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!type || !field || contactError || mutation.isPending) return;

    const contact = showContact && !user ? contactValue.trim() : "";
    mutation.mutate({
      request_type: type,
      field,
      details: details.trim() || undefined,
      contact_method: contact ? contactMethod : undefined,
      contact_value: contact || undefined,
      website: honeypot,
      elapsed: Math.floor((Date.now() - startedAt.current) / 1000),
    });
  };

  const reset = () => {
    setResult(null);
    setType(null);
    setField(null);
    setDetails("");
    setShowDetails(false);
    setContactValue("");
    setShowContact(false);
    startedAt.current = Date.now();
    mutation.reset();
  };

  if (result) {
    return (
      <div className="container mx-auto max-w-lg px-4 py-12">
        <PageMeta {...META} />
        <RequestReceived result={result} onReset={reset} />
      </div>
    );
  }

  const fields = type ? TYPES[type].fields : [];

  return (
    <div className="container mx-auto max-w-2xl px-4 py-10">
      <PageMeta {...META} />
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-gray-600 transition-colors">الرئيسية</Link>
        <ChevronRight className="w-4 h-4 rotate-180" />
        <span className="text-gray-700 font-medium">طلب خدمة / كورس</span>
      </nav>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-sm border p-6 sm:p-8"
      >
        <div className="mb-8">
          <h1 className="text-xl font-bold text-gray-900">شنو البتحتاجو؟</h1>
          <p className="text-sm text-gray-500 mt-1">
            اختار نوع الطلب والمجال — أقل من دقيقة، وبدون تسجيل دخول.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-7" noValidate>
          {/* Honeypot — hidden from people and assistive tech; bots fill it. */}
          <div aria-hidden="true" className="absolute w-0 h-0 overflow-hidden opacity-0 pointer-events-none">
            <label>
              Website
              <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
              />
            </label>
          </div>

          {/* 1 — Request type */}
          <FormField label="نوع الطلب" group required>
            <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="نوع الطلب">
              {(Object.keys(TYPES) as ServiceRequestType[]).map((t) => {
                const Icon = TYPES[t].icon;
                const active = type === t;
                return (
                  <button
                    key={t}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => chooseType(t)}
                    className={`flex flex-col items-center gap-2 p-5 rounded-2xl border-2 text-center transition-all ${
                      active
                        ? "border-tomoh-burgundy bg-burgundy-50"
                        : "border-gray-100 hover:border-gray-200"
                    }`}
                  >
                    <Icon className={`w-7 h-7 ${active ? "text-tomoh-burgundy" : "text-gray-500"}`} />
                    <span className={`font-bold ${active ? "text-tomoh-burgundy" : "text-gray-800"}`}>
                      {TYPES[t].label}
                    </span>
                    <span className="text-xs text-gray-500">{TYPES[t].desc}</span>
                  </button>
                );
              })}
            </div>
          </FormField>

          {/* 2 — Field (options depend on type) */}
          <AnimatePresence mode="wait">
            {type && (
              <motion.div
                key={type}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <FormField label="المجال" group required>
                  <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="المجال">
                    {fields.map((f) => {
                      const active = field === f.key;
                      return (
                        <button
                          key={f.key}
                          type="button"
                          role="radio"
                          aria-checked={active}
                          onClick={() => setField(f.key)}
                          className={`px-3.5 py-2 rounded-xl border-2 text-sm font-semibold transition-all ${
                            active
                              ? "border-tomoh-burgundy bg-burgundy-50 text-tomoh-burgundy"
                              : "border-gray-100 text-gray-700 hover:border-gray-200"
                          }`}
                        >
                          <span className="ml-1">{f.emoji}</span>
                          {f.label}
                        </button>
                      );
                    })}
                  </div>
                </FormField>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 3 — Optional extras, collapsed by default to keep it fast */}
          {field && (
            <div className="space-y-4">
              <Toggle open={showDetails} onClick={() => setShowDetails((v) => !v)}>
                أضف تفاصيل
              </Toggle>
              {showDetails && (
                <FormField label="التفاصيل" optional hint={`${details.length}/${DETAILS_MAX}`}>
                  <Textarea
                    rows={4}
                    maxLength={DETAILS_MAX}
                    placeholder={
                      type === "course"
                        ? "مثال: كورس React من الصفر بالعربي، مستواي مبتدئ"
                        : "مثال: موقع تعريفي لشركة صغيرة بخمس صفحات"
                    }
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                  />
                </FormField>
              )}

              {!user && (
                <>
                  <Toggle open={showContact} onClick={() => setShowContact((v) => !v)}>
                    خلّينا نتواصل معاك
                  </Toggle>
                  {showContact && (
                    <FormField
                      label="وسيلة التواصل"
                      htmlFor="sr-contact"
                      optional
                      hint="نستخدمها فقط للتواصل بخصوص هذا الطلب."
                      error={contactValue ? contactError ?? undefined : undefined}
                    >
                      <div className="space-y-2">
                        <div className="flex gap-2" role="radiogroup" aria-label="نوع وسيلة التواصل">
                          {CONTACT_METHODS.map((m) => (
                            <button
                              key={m.key}
                              type="button"
                              role="radio"
                              aria-checked={contactMethod === m.key}
                              onClick={() => setContactMethod(m.key)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                                contactMethod === m.key
                                  ? "border-tomoh-burgundy bg-burgundy-50 text-tomoh-burgundy"
                                  : "border-gray-200 text-gray-600"
                              }`}
                            >
                              {m.label}
                            </button>
                          ))}
                        </div>
                        <Input
                          id="sr-contact"
                          dir="ltr"
                          type={CONTACT_METHODS.find((m) => m.key === contactMethod)!.type}
                          maxLength={200}
                          autoComplete={contactMethod === "email" ? "email" : "tel"}
                          placeholder={CONTACT_METHODS.find((m) => m.key === contactMethod)!.placeholder}
                          value={contactValue}
                          onChange={(e) => setContactValue(e.target.value)}
                        />
                      </div>
                    </FormField>
                  )}
                </>
              )}

              {user && (
                <p className="text-xs text-gray-500 bg-gray-50 rounded-xl px-4 py-3">
                  أنت مسجّل الدخول — سيُحفظ الطلب في حسابك ويمكنك متابعته من «طلباتي».
                </p>
              )}
            </div>
          )}

          {mutation.isError && (
            <div role="alert" className="bg-red-50 border border-red-100 rounded-xl p-4 text-sm text-red-700">
              {apiErrorMessage(mutation.error) ?? "حدث خطأ أثناء الإرسال. يرجى المحاولة مرة أخرى."}
            </div>
          )}

          <Button
            type="submit"
            className="w-full h-12 text-base font-bold"
            disabled={!type || !field || !!contactError || mutation.isPending}
          >
            {mutation.isPending ? "جاري الإرسال..." : "إرسال الطلب"}
          </Button>
        </form>
      </motion.div>
    </div>
  );
}

function Toggle({ open, onClick, children }: { open: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={open}
      className="flex items-center gap-1.5 text-sm font-semibold text-gray-600 hover:text-tomoh-burgundy transition-colors"
    >
      <ChevronDown className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`} />
      {children}
      <span className="text-xs font-normal text-gray-400">(اختياري)</span>
    </button>
  );
}

function RequestReceived({ result, onReset }: { result: ServiceRequestResponse; onReset: () => void }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard?.writeText(result.reference).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {});
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-3xl shadow-sm border p-8 text-center"
    >
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
        <CheckCircle className="w-8 h-8 text-green-600" />
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-1">وصلنا طلبك بنجاح!</h1>
      <p className="text-gray-600 mb-2">شكراً لاهتمامك بطموح 💜</p>
      <p className="text-sm text-gray-500 leading-relaxed mb-6">{result.message}</p>

      <div className="inline-flex items-center gap-3 bg-gray-50 border border-dashed border-gray-200 rounded-xl px-4 py-2.5 mb-8">
        <span className="text-xs text-gray-500">رقم الطلب</span>
        <span dir="ltr" className="font-mono font-bold text-tomoh-burgundy">{result.reference}</span>
        <button type="button" onClick={copy} className="text-gray-400 hover:text-gray-700" aria-label="نسخ رقم الطلب">
          <Copy className="w-4 h-4" />
        </button>
        {copied && <span className="text-xs text-green-600">تم النسخ</span>}
      </div>

      {result.linked ? (
        <div className="space-y-3">
          <p className="text-sm text-gray-600">تم حفظ الطلب في حسابك.</p>
          <Link to="/my-requests">
            <Button className="w-full gap-2">
              <ListChecks className="w-4 h-4" />
              عرض طلباتي
            </Button>
          </Link>
        </div>
      ) : (
        <div className="text-right bg-burgundy-50/60 border border-burgundy-100 rounded-2xl p-5 mb-2">
          <p className="font-bold text-gray-900 mb-3">يمكنك إنشاء حساب لمتابعة طلباتك والاستفادة من خدمات المنصة:</p>
          <ul className="space-y-2 text-sm text-gray-600 mb-5">
            <li className="flex items-center gap-2"><BellRing className="w-4 h-4 text-tomoh-burgundy flex-shrink-0" /> متابعة حالة طلبك خطوة بخطوة</li>
            <li className="flex items-center gap-2"><History className="w-4 h-4 text-tomoh-burgundy flex-shrink-0" /> الرجوع لطلباتك السابقة من أي جهاز</li>
          </ul>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <a href={accountUrl("register", "/my-requests")}>
              <Button className="w-full gap-2">
                <UserPlus className="w-4 h-4" />
                إنشاء حساب
              </Button>
            </a>
            <a href={accountUrl("login", "/my-requests")}>
              <Button variant="outline" className="w-full gap-2 bg-white">
                <LogIn className="w-4 h-4" />
                تسجيل الدخول
              </Button>
            </a>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            طلبك محفوظ عندنا. لو سجّلت من نفس الجهاز خلال 30 يوماً، حيترَبط بحسابك تلقائياً.
          </p>
        </div>
      )}

      {!result.linked && <p className="text-xs text-gray-400 my-4">أو</p>}

      <div className="flex items-center justify-center gap-3 flex-wrap mt-4">
        <Link to="/">
          <Button variant="ghost" className="gap-2">
            متابعة التصفح
            <ArrowLeft className="w-4 h-4 rotate-180" />
          </Button>
        </Link>
        <Button variant="ghost" onClick={onReset}>إرسال طلب آخر</Button>
      </div>
    </motion.div>
  );
}
