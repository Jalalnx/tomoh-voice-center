import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { Layout } from "@/components/layout/Layout";
import { Home } from "@/pages/Home";
import { BugReport } from "@/pages/BugReport";
import { Suggestion } from "@/pages/Suggestion";
import { CourseRequest } from "@/pages/CourseRequest";
import { Satisfaction } from "@/pages/Satisfaction";
import { FeatureVoting } from "@/pages/FeatureVoting";
import { Roadmap } from "@/pages/Roadmap";
import { TrackTicket } from "@/pages/TrackTicket";

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
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
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
    </AuthProvider>
  );
}
