export type FeedbackType =
  | "bug_report"
  | "suggestion"
  | "course_request"
  | "satisfaction"
  | "feature_request";

export type Priority = "P1" | "P2" | "P3" | "P4";
export type TicketStatus =
  | "new"
  | "under_review"
  | "in_progress"
  | "resolved"
  | "closed";

export type ImpactLevel = "low" | "medium" | "high" | "blocking";

export type BugCategory =
  | "login"
  | "payment"
  | "video"
  | "quiz"
  | "certificate"
  | "profile"
  | "other";

export type CourseLevel = "beginner" | "intermediate" | "advanced";

export type RoadmapStatus = "planned" | "in_progress" | "released";

export interface BugReportForm {
  name?: string;
  email: string;
  phone?: string;
  category: BugCategory;
  description: string;
  impact: ImpactLevel;
  screenshot?: File;
  browser?: string;
  os?: string;
  device?: string;
  screen_size?: string;
  current_url?: string;
}

export interface SuggestionForm {
  name?: string;
  email?: string;
  area: string;
  description: string;
  expected_benefit: string;
}

export interface CourseRequestForm {
  name?: string;
  email?: string;
  course_name: string;
  reason: string;
  level: CourseLevel;
  suggested_instructor?: string;
}

export interface SatisfactionForm {
  course_id?: number;
  course_rating: number;
  instructor_rating: number;
  nps_score: number;
  liked: string;
  improvement: string;
}

export interface FeatureVoteForm {
  feature_id: number;
  email?: string;
}

export interface Ticket {
  id: number;
  reference: string;
  type: FeedbackType;
  status: TicketStatus;
  priority: Priority;
  title: string;
  description: string;
  created_at: string;
  updated_at: string;
  ai_summary?: string;
  ai_team?: string;
}

export interface Feature {
  id: number;
  title: string;
  description: string;
  votes_count: number;
  user_voted: boolean;
  status: RoadmapStatus;
  icon?: string;
}

export interface RoadmapItem {
  id: number;
  title: string;
  description: string;
  status: RoadmapStatus;
  released_at?: string;
  planned_for?: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface SubmitResponse {
  reference: string;
  message: string;
}
