import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function detectBrowserInfo() {
  const ua = navigator.userAgent;
  let browser = "Unknown";
  let os = "Unknown";
  let device = "Desktop";

  if (ua.includes("Chrome") && !ua.includes("Edg")) browser = "Chrome";
  else if (ua.includes("Firefox")) browser = "Firefox";
  else if (ua.includes("Safari") && !ua.includes("Chrome")) browser = "Safari";
  else if (ua.includes("Edg")) browser = "Edge";

  if (ua.includes("Windows")) os = "Windows";
  else if (ua.includes("Mac")) os = "macOS";
  else if (ua.includes("Linux")) os = "Linux";
  else if (ua.includes("Android")) { os = "Android"; device = "Mobile"; }
  else if (ua.includes("iPhone") || ua.includes("iPad")) { os = "iOS"; device = "Mobile"; }

  return {
    browser,
    os,
    device,
    screen_size: `${window.screen.width}x${window.screen.height}`,
    current_url: window.location.href,
  };
}

export function formatDate(dateStr: string) {
  return new Intl.DateTimeFormat("ar-SA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(dateStr));
}

export function getStatusLabel(status: string) {
  const labels: Record<string, string> = {
    new: "جديد",
    under_review: "تحت المراجعة",
    in_progress: "قيد التنفيذ",
    resolved: "تم الحل",
    closed: "مغلق",
    planned: "مخطط",
    in_progress_roadmap: "جارٍ التنفيذ",
    released: "تم الإطلاق",
  };
  return labels[status] ?? status;
}

export function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    new: "bg-blue-100 text-blue-700",
    under_review: "bg-amber-100 text-amber-700",
    in_progress: "bg-burgundy-100 text-burgundy-700",
    resolved: "bg-green-100 text-green-700",
    closed: "bg-gray-100 text-gray-600",
    planned: "bg-blue-100 text-blue-700",
    released: "bg-green-100 text-green-700",
  };
  return colors[status] ?? "bg-gray-100 text-gray-600";
}

export function getPriorityLabel(priority: string) {
  const labels: Record<string, string> = {
    P1: "P1 - حرجة",
    P2: "P2 - عالية",
    P3: "P3 - متوسطة",
    P4: "P4 - منخفضة",
  };
  return labels[priority] ?? priority;
}

export function getPriorityColor(priority: string) {
  const colors: Record<string, string> = {
    P1: "bg-red-100 text-red-700",
    P2: "bg-orange-100 text-orange-700",
    P3: "bg-yellow-100 text-yellow-700",
    P4: "bg-gray-100 text-gray-600",
  };
  return colors[priority] ?? "bg-gray-100 text-gray-600";
}
