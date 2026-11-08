export type ApplicationStatus =
  | "Applied"
  | "Interview Scheduled"
  | "Selected"
  | "Rejected"
  | "On Hold";

type ApplicationRow = {
  id: string;
  user_id: string;
  company_name: string;
  job_role: string;
  salary_amount: number | null;
  salary_currency: string | null;
  application_date: string;
  status: ApplicationStatus;
  job_description: string;
  notes: string;
  created_at: string;
  updated_at: string;
};

export type Database = {
  public: {
    Tables: {
      applications: {
        Row: ApplicationRow;
        Insert: {
          id?: string;
          user_id?: string;
          company_name: string;
          job_role: string;
          salary_amount?: number | null;
          salary_currency?: string | null;
          application_date: string;
          status?: ApplicationStatus;
          job_description?: string;
          notes?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          company_name?: string;
          job_role?: string;
          salary_amount?: number | null;
          salary_currency?: string | null;
          application_date?: string;
          status?: ApplicationStatus;
          job_description?: string;
          notes?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      application_status: ApplicationStatus;
    };
    CompositeTypes: Record<string, never>;
  };
};
