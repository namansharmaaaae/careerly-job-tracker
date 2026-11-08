import { redirect } from "next/navigation";
import { connection } from "next/server";
import { createHash } from "node:crypto";
import DashboardClient from "@/components/dashboard-client";
import { SAMPLE_APPLICATIONS } from "@/lib/applications/sample-data";
import { createComponentClient } from "@/lib/supabase/server-component";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export const instant = false;

export default async function HomePage() {
  await connection();

  if (!isSupabaseConfigured()) {
    return (
      <DashboardClient
        initialApplications={SAMPLE_APPLICATIONS}
        previewMode
      />
    );
  }

  const supabase = await createComponentClient();
  const { data: authData, error: authError } = await supabase.auth.getClaims();
  if (authError) {
    console.error("Could not verify the current user:", authError.message);
    redirect("/login?error=We%20couldn%E2%80%99t%20verify%20your%20session.%20Please%20sign%20in%20again.");
  }
  if (!authData?.claims) redirect("/login");

  const { data: rows, error: applicationsError } = await supabase
    .from("applications")
    .select("*")
    .order("application_date", { ascending: false });

  if (applicationsError) {
    console.error("Could not load applications:", applicationsError.message);
    throw new Error("We couldn't load your applications. Please refresh the page.");
  }

  const applications = rows.map((row) => ({
    id: row.id,
    company: row.company_name,
    role: row.job_role,
    applicationDate: row.application_date,
    salary: row.salary_amount === null || row.salary_currency === null
      ? ""
      : `${row.salary_currency} ${row.salary_amount.toLocaleString("en-US")}`,
    salaryAmount: row.salary_amount?.toString() ?? "",
    salaryCurrency: row.salary_currency ?? "",
    status: row.status,
    description: row.job_description,
    notes: row.notes,
  }));
  const userEmail = typeof authData.claims.email === "string"
    ? authData.claims.email
    : undefined;
  const applicationsKey = createHash("sha256")
    .update(JSON.stringify(applications))
    .digest("hex");

  return (
    <DashboardClient
      key={applicationsKey}
      initialApplications={applications}
      previewMode={false}
      userEmail={userEmail}
    />
  );
}
