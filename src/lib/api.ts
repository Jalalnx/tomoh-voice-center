import axios from "axios";
import { API_URL } from "@/config";
import type {
  BugReportForm,
  SuggestionForm,
  CourseRequestForm,
  SatisfactionForm,
  Feature,
  RoadmapItem,
  Ticket,
  SubmitResponse,
  ApiResponse,
} from "@/types";

// The session cookie set by Laravel Sanctum on tomoh.io carries
// Domain=.tomoh.io so the browser includes it automatically on requests
// from feedback.tomoh.io too. We just need withCredentials: true.
const api = axios.create({
  baseURL: `${API_URL}/voice`,
  withCredentials: true,
  headers: { "Content-Type": "application/json", Accept: "application/json" },
});

// Separate client for platform endpoints (e.g. /user) that live outside /voice
export const platformApi = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json", Accept: "application/json" },
});

// Bug Reports
export const submitBugReport = async (data: BugReportForm): Promise<SubmitResponse> => {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, value instanceof File ? value : String(value));
    }
  });
  const res = await api.post<ApiResponse<SubmitResponse>>("/bug-reports", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data.data;
};

// Suggestions
export const submitSuggestion = async (data: SuggestionForm): Promise<SubmitResponse> => {
  const res = await api.post<ApiResponse<SubmitResponse>>("/suggestions", data);
  return res.data.data;
};

// Course Requests
export const submitCourseRequest = async (data: CourseRequestForm): Promise<SubmitResponse> => {
  const res = await api.post<ApiResponse<SubmitResponse>>("/course-requests", data);
  return res.data.data;
};

// Satisfaction Survey
export const submitSatisfaction = async (data: SatisfactionForm): Promise<SubmitResponse> => {
  const res = await api.post<ApiResponse<SubmitResponse>>("/satisfaction", data);
  return res.data.data;
};

// Feature Voting
export const getFeatures = async (): Promise<Feature[]> => {
  const res = await api.get<ApiResponse<Feature[]>>("/features");
  return res.data.data;
};

export const voteFeature = async (featureId: number): Promise<void> => {
  await api.post(`/features/${featureId}/vote`);
};

export const unvoteFeature = async (featureId: number): Promise<void> => {
  await api.delete(`/features/${featureId}/vote`);
};

// Roadmap
export const getRoadmap = async (): Promise<RoadmapItem[]> => {
  const res = await api.get<ApiResponse<RoadmapItem[]>>("/roadmap");
  return res.data.data;
};

// Ticket Tracking
export const trackTicket = async (reference: string): Promise<Ticket> => {
  const res = await api.get<ApiResponse<Ticket>>(`/tickets/${reference}`);
  return res.data.data;
};
