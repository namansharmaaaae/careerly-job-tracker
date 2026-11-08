import type { ApplicationStatus } from "@/lib/supabase/database.types";

export type DashboardApplication = {
  id: string;
  company: string;
  role: string;
  applicationDate: string;
  salary: string;
  salaryAmount: string;
  salaryCurrency: string;
  status: ApplicationStatus;
  description: string;
  notes: string;
};

export const SAMPLE_APPLICATIONS: DashboardApplication[] = [
  { id: "1", company: "Linear", role: "Senior Product Designer", applicationDate: "2026-11-06", salary: "$145k–$170k", salaryAmount: "", salaryCurrency: "", status: "Interview Scheduled", description: "Help shape the future of project management software.", notes: "Portfolio review with the design team on Thursday." },
  { id: "2", company: "Vercel", role: "Product Designer", applicationDate: "2026-11-04", salary: "$130k–$155k", salaryAmount: "", salaryCurrency: "", status: "Selected", description: "Design tools that make the web better for everyone.", notes: "Recruiter said the team will follow up this week." },
  { id: "3", company: "Notion", role: "Product Design Lead", applicationDate: "2026-11-02", salary: "$160k–$190k", salaryAmount: "", salaryCurrency: "", status: "On Hold", description: "Build delightful, thoughtful collaboration experiences.", notes: "Role is paused until the next planning cycle." },
  { id: "4", company: "Figma", role: "Senior Product Designer", applicationDate: "2026-10-29", salary: "$150k–$180k", salaryAmount: "", salaryCurrency: "", status: "Applied", description: "Make design accessible to more teams around the world.", notes: "" },
  { id: "5", company: "Loom", role: "Product Designer, Growth", applicationDate: "2026-10-27", salary: "$125k–$150k", salaryAmount: "", salaryCurrency: "", status: "Rejected", description: "Create simple ways for teams to communicate at work.", notes: "Asked for feedback for future opportunities." },
  { id: "6", company: "Stripe", role: "Product Designer", applicationDate: "2026-10-24", salary: "$155k–$185k", salaryAmount: "", salaryCurrency: "", status: "Applied", description: "Design clear and approachable financial products.", notes: "Follow up if I haven't heard back by next Friday." },
  { id: "7", company: "Webflow", role: "UX Designer", applicationDate: "2026-10-21", salary: "$120k–$145k", salaryAmount: "", salaryCurrency: "", status: "Interview Scheduled", description: "Help people build for the web without limits.", notes: "Prepare a case study about the portfolio redesign." },
  { id: "8", company: "Airtable", role: "Product Designer", applicationDate: "2026-10-18", salary: "$135k–$165k", salaryAmount: "", salaryCurrency: "", status: "Applied", description: "Bring teams together around the work they care about.", notes: "" },
];
