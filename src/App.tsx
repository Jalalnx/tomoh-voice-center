import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { Layout } from "@/components/layout/Layout";
import PageMeta from "@/components/common/PageMeta";
import { Home } from "@/pages/Home";

/* Landing route stays static (no second round-trip); the rest split per route
   so a visitor on /track does not download six unrelated forms. */
const BugReport = lazy(() => import("@/pages/BugReport").then((m) => ({ default: m.BugReport })));
const Suggestion = lazy(() => import("@/pages/Suggestion").then((m) => ({ default: m.Suggestion })));
const CourseRequest = lazy(() => import("@/pages/CourseRequest").then((m) => ({ default: m.CourseRequest })));
const Satisfaction = lazy(() => import("@/pages/Satisfaction").then((m) => ({ default: m.Satisfaction })));
const FeatureVoting = lazy(() => import("@/pages/FeatureVoting").then((m) => ({ default: m.FeatureVoting })));
const Roadmap = lazy(() => import("@/pages/Roadmap").then((m) => ({ default: m.Roadmap })));
const TrackTicket = lazy(() => import("@/pages/TrackTicket").then((m) => ({ default: m.TrackTicket })));
const ServiceRequest = lazy(() => import("@/pages/ServiceRequest").then((m) => ({ default: m.ServiceRequest })));
const MyRequests = lazy(() => import("@/pages/MyRequests").then((m) => ({ default: m.MyRequests })));

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <PageMeta
        title="الصفحة غير موجودة"
        description="الصفحة التي تبحث عنها غير متاحة في مركز صوت طموح. عد إلى الرئيسية لاختيار نوع طلبك."
        noIndex
      />
      <p className="text-6xl mb-4">🔍</p>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">الصفحة غير موجودة</h1>
      <p className="text-gray-500 mb-6">الصفحة التي تبحث عنها غير متاحة</p>
      <a href="/" className="text-tomoh-burgundy font-semibold hover:underline">
        العودة للرئيسية
      </a>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
    <BrowserRouter>
      <Suspense fallback={<div className="min-h-[60vh]" />}>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/bug-report" element={<BugReport />} />
          <Route path="/suggestion" element={<Suggestion />} />
          <Route path="/course-request" element={<CourseRequest />} />
          <Route path="/satisfaction" element={<Satisfaction />} />
          <Route path="/features" element={<FeatureVoting />} />
          <Route path="/roadmap" element={<Roadmap />} />
          <Route path="/track" element={<TrackTicket />} />
          <Route path="/service-request" element={<ServiceRequest />} />
          <Route path="/my-requests" element={<MyRequests />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
      </Suspense>
    </BrowserRouter>
    </AuthProvider>
  );
}
