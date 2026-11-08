"use client";

import { useMemo, useRef, useState, useTransition, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  deleteApplication as deleteApplicationAction,
  saveApplication as saveApplicationAction,
  summarizeJobDescription as summarizeJobDescriptionAction,
  type ApplicationInput,
} from "@/app/actions";
import { signOutAction } from "@/app/auth/actions";
import type { DashboardApplication } from "@/lib/applications/sample-data";
import type { ApplicationStatus } from "@/lib/supabase/database.types";

const STATUSES = [
  "Applied",
  "Interview Scheduled",
  "Selected",
  "Rejected",
  "On Hold",
] as const;

type StatusFilter = "All applications" | ApplicationStatus;

const STATUS_FILTERS: StatusFilter[] = ["All applications", ...STATUSES];
const WEEK_LABELS = ["Sep 14", "Sep 21", "Sep 28", "Oct 5", "Oct 12", "Oct 19", "Oct 26", "Nov 2"];

function Icon({
  name,
  size = 18,
}: {
  name: "briefcase" | "grid" | "chart" | "search" | "plus" | "calendar" | "arrow" | "edit" | "close";
  size?: number;
}) {
  const paths: Record<typeof name, ReactNode> = {
    briefcase: <><rect x="3" y="7" width="18" height="14" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18M10 12v2h4v-2" /></>,
    grid: <><rect x="3" y="3" width="8" height="8" rx="2" /><rect x="13" y="3" width="8" height="5" rx="2" /><rect x="13" y="10" width="8" height="11" rx="2" /><rect x="3" y="13" width="8" height="8" rx="2" /></>,
    chart: <><path d="M4 19V5M4 19h17" /><path d="m7 15 4-4 3 2 6-7" /><path d="M16 6h4v4" /></>,
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
    plus: <path d="M12 5v14M5 12h14" />,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 11h18" /></>,
    arrow: <path d="m7 17 10-10M8 7h9v9" />,
    edit: <><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" /></>,
    close: <path d="m18 6-12 12M6 6l12 12" />,
  };

  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {paths[name]}
    </svg>
  );
}

function statusClass(status: ApplicationStatus) {
  return `status-pill status-${status.toLowerCase().replaceAll(" ", "-")}`;
}

function isApplicationStatus(value: string): value is ApplicationStatus {
  return STATUSES.some((status) => status === value);
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}

export default function DashboardClient({
  initialApplications,
  previewMode,
  userEmail,
}: {
  initialApplications: DashboardApplication[];
  previewMode: boolean;
  userEmail?: string;
}) {
  const router = useRouter();
  const [applications, setApplications] = useState(initialApplications);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<StatusFilter>("All applications");
  const [editing, setEditing] = useState<DashboardApplication | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formError, setFormError] = useState("");
  const [isPending, startTransition] = useTransition();
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summary, setSummary] = useState("");
  const [summaryError, setSummaryError] = useState("");
  const applicationFormRef = useRef<HTMLFormElement>(null);
  const nextPreviewId = useRef(0);
  const userInitials = userEmail?.slice(0, 2).toUpperCase() ?? "MC";

  const visibleApplications = useMemo(() => {
    const query = search.trim().toLowerCase();
    return applications.filter((application) => {
      const matchesStatus = activeFilter === "All applications" || application.status === activeFilter;
      const searchableText = [application.company, application.role, application.description, application.notes].join(" ").toLowerCase();
      return matchesStatus && (!query || searchableText.includes(query));
    });
  }, [activeFilter, applications, search]);

  const interviews = applications.filter((application) => application.status === "Interview Scheduled").length;
  const selected = applications.filter((application) => application.status === "Selected").length;
  const responded = applications.filter((application) => application.status !== "Applied" && application.status !== "On Hold").length;
  const responseRate = applications.length ? Math.round((responded / applications.length) * 100) : 0;

  function openNewApplicationForm() {
    setEditing(null);
    setFormError("");
    setSummary("");
    setSummaryError("");
    setIsFormOpen(true);
  }

  function openEditForm(application: DashboardApplication) {
    setEditing(application);
    setFormError("");
    setSummary("");
    setSummaryError("");
    setIsFormOpen(true);
  }

  function closeForm() {
    setIsFormOpen(false);
    setEditing(null);
    setFormError("");
  }

  async function summarizeDescription() {
    const formData = applicationFormRef.current
      ? new FormData(applicationFormRef.current)
      : null;
    const description = formData?.get("description");
    if (typeof description !== "string") {
      setSummaryError("Enter a job description before requesting a summary.");
      return;
    }

    setIsSummarizing(true);
    setSummary("");
    setSummaryError("");
    try {
      const result = await summarizeJobDescriptionAction(description);
      if (!result.ok) {
        setSummaryError(result.error);
        return;
      }
      setSummary(result.summary);
    } catch {
      setSummaryError("We couldn't complete the AI request. Please try again.");
    } finally {
      setIsSummarizing(false);
    }
  }

  function saveApplication(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const statusValue = formData.get("status");
    const company = formData.get("company");
    const role = formData.get("role");
    const applicationDate = formData.get("applicationDate");
    const salaryAmountValue = previewMode ? "" : formData.get("salaryAmount");
    const salaryCurrencyValue = previewMode ? "" : formData.get("salaryCurrency");

    if (
      typeof statusValue !== "string" ||
      !isApplicationStatus(statusValue) ||
      typeof company !== "string" ||
      typeof role !== "string" ||
      typeof applicationDate !== "string" ||
      typeof salaryAmountValue !== "string" ||
      typeof salaryCurrencyValue !== "string"
    ) {
      setFormError("Check the application details and try again.");
      return;
    }

    const amount = salaryAmountValue.trim();
    const currency = amount ? salaryCurrencyValue.trim().toUpperCase() : "";
    const previewSalary = formData.get("salary");
    const input: ApplicationInput = {
      company,
      role,
      applicationDate,
      salaryAmount: amount,
      salaryCurrency: currency,
      status: statusValue as ApplicationStatus,
      description: String(formData.get("description") ?? ""),
      notes: String(formData.get("notes") ?? ""),
    };

    if (previewMode) {
      const salary = typeof previewSalary === "string" ? previewSalary.trim() : "";
      const application: DashboardApplication = {
        id: editing?.id ?? `preview-${++nextPreviewId.current}`,
        company: company.trim(),
        role: role.trim(),
        applicationDate,
        salary,
        salaryAmount: amount,
        salaryCurrency: currency,
        status: statusValue,
        description: input.description,
        notes: input.notes,
      };
      setApplications((current) =>
        editing
          ? current.map((item) => (item.id === editing.id ? application : item))
          : [application, ...current],
      );
      closeForm();
      return;
    }

    startTransition(async () => {
      const result = await saveApplicationAction(input, editing?.id);
      if (!result.ok) {
        setFormError(result.error);
        return;
      }
      closeForm();
      router.refresh();
    });
  }

  function deleteApplication() {
    if (!editing || !window.confirm(`Delete the application to ${editing.company}?`)) return;

    if (previewMode) {
      setApplications((current) =>
        current.filter((application) => application.id !== editing.id),
      );
      closeForm();
      return;
    }

    startTransition(async () => {
      const result = await deleteApplicationAction(editing.id);
      if (!result.ok) {
        setFormError(result.error);
        return;
      }
      closeForm();
      router.refresh();
    });
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#overview" aria-label="Careerly home">
          <span className="brand-mark"><Icon name="briefcase" size={20} /></span>
          <span>careerly</span>
        </a>
        <div className="workspace-label">WORKSPACE</div>
        <nav className="sidebar-nav" aria-label="Main navigation">
          <a className="nav-link active" href="#overview"><Icon name="grid" /><span>Overview</span></a>
          <a className="nav-link" href="#applications"><Icon name="briefcase" /><span>Applications</span><span className="nav-count">{applications.length}</span></a>
          <a className="nav-link" href="#insights"><Icon name="chart" /><span>Insights</span></a>
        </nav>
        <div className="sidebar-bottom">
          <div className="tip-card">
            <span className="tip-sparkle">✳</span>
            <p className="tip-title">A little progress adds up.</p>
            <p className="tip-copy">Keep your applications in one place and make your next move with confidence.</p>
          </div>
          <div className="profile">
            <div className="profile-avatar">{userInitials}</div>
            <div className="profile-copy">
              <span className="profile-name">{previewMode ? "Sample account" : userEmail}</span>
              <span className="profile-plan">{previewMode ? "Preview only" : "Personal workspace"}</span>
            </div>
            {!previewMode && (
              <form action={signOutAction}>
                <button className="sign-out-button" type="submit">Sign out</button>
              </form>
            )}
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <span className="breadcrumb">Workspace <span>/</span> Overview</span>
          <div className="topbar-right">
            {previewMode ? (
              <>
                <span className="preview-label"><span /> Sample preview</span>
                <Link className="sign-in-link" href="/login">Sign in</Link>
              </>
            ) : (
              <span className="account-label">{userEmail}</span>
            )}
            <div className="topbar-avatar" aria-label={userEmail ?? "Sample account"}>{userInitials}</div>
          </div>
        </header>

        <div className="page-content">
          <section className="welcome-row" id="overview">
            <div>
              <p className="eyebrow">SUNDAY, NOVEMBER 8, 2026</p>
              <h1>Your career, in motion<span>.</span></h1>
              <p className="welcome-copy">A clear view of every opportunity you&apos;re working toward.</p>
            </div>
            <button className="primary-button" onClick={openNewApplicationForm} type="button"><Icon name="plus" size={17} />Add application</button>
          </section>

          <section className="stats-grid" aria-label="Application statistics">
            <article className="stat-card">
              <div className="stat-card-top"><span className="stat-label">Total applications</span><span className="stat-icon stat-icon-lavender"><Icon name="briefcase" size={17} /></span></div>
              <div className="stat-value">{applications.length}</div>
              <p className="stat-foot"><span className="stat-dot dot-lavender" /> All time</p>
            </article>
            <article className="stat-card">
              <div className="stat-card-top"><span className="stat-label">Interviews</span><span className="stat-icon stat-icon-blue"><Icon name="calendar" size={17} /></span></div>
              <div className="stat-value">{interviews}</div>
              <p className="stat-foot"><span className="stat-dot dot-blue" /> In progress</p>
            </article>
            <article className="stat-card">
              <div className="stat-card-top"><span className="stat-label">Offers</span><span className="stat-icon stat-icon-green">✳</span></div>
              <div className="stat-value">{selected}</div>
              <p className="stat-foot"><span className="stat-dot dot-green" /> Selected</p>
            </article>
            <article className="stat-card">
              <div className="stat-card-top"><span className="stat-label">Response rate</span><span className="stat-icon stat-icon-peach"><Icon name="arrow" size={17} /></span></div>
              <div className="stat-value">{responseRate}<span className="stat-unit">%</span></div>
              <p className="stat-foot"><span className="stat-dot dot-peach" /> Applications with a reply</p>
            </article>
          </section>

          <section className="insights-grid" id="insights">
            <article className="panel activity-panel">
              <div className="panel-heading">
                <div><p className="panel-kicker">YOUR MOMENTUM</p><h2>Application activity</h2></div>
                <button className="period-button" type="button">Last 8 weeks <span aria-hidden="true">⌄</span></button>
              </div>
              <div className="chart-area" role="img" aria-label="Applications submitted over the last eight weeks, trending upward">
                <div className="chart-y-labels" aria-hidden="true"><span>8</span><span>6</span><span>4</span><span>2</span><span>0</span></div>
                <div className="chart-plot">
                  <div className="chart-grid-lines" aria-hidden="true"><span /><span /><span /><span /><span /></div>
                  <div className="bar-list">
                    {[2, 3, 2, 4, 3, 5, 4, 6].map((height, index) => (
                      <div className="bar-column" key={index}>
                        <div className={`activity-bar${index === 7 ? " current" : ""}`} style={{ height: `${height * 12.5}%` }} />
                        <span className="bar-label">{WEEK_LABELS[index]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="chart-legend"><span /> Applications sent</div>
            </article>
            <article className="panel focus-panel">
              <div className="focus-icon"><span>✳</span></div>
              <p className="panel-kicker">A MOMENT TO REFLECT</p>
              <h2>Small steps,<br />big possibilities.</h2>
              <p className="focus-copy">You&apos;ve been showing up for your future. Keep the momentum going—your next opportunity could be just around the corner.</p>
              <a className="text-link" href="#applications">View your applications <span>→</span></a>
              <div className="focus-decoration" aria-hidden="true" />
            </article>
          </section>

          <section className="panel applications-panel" id="applications">
            <div className="applications-heading">
              <div><p className="panel-kicker">YOUR OPPORTUNITIES</p><h2>Recent applications</h2></div>
              <button className="secondary-button" onClick={openNewApplicationForm} type="button"><Icon name="plus" size={16} /> Add new</button>
            </div>
            <div className="list-toolbar">
              <label className="search-field">
                <Icon name="search" size={17} />
                <span className="visually-hidden">Search applications</span>
                <input onChange={(event) => setSearch(event.target.value)} placeholder="Search company or role..." type="search" value={search} />
                <kbd>⌘ K</kbd>
              </label>
              <span className="results-count">{visibleApplications.length} of {applications.length} applications</span>
            </div>
            <div className="filter-list" aria-label="Filter by status">
              {STATUS_FILTERS.map((filter) => (
                <button aria-pressed={activeFilter === filter} className={`filter-chip${activeFilter === filter ? " selected" : ""}`} key={filter} onClick={() => setActiveFilter(filter)} type="button">
                  {filter}
                  {filter === "All applications" && <span className="filter-count">{applications.length}</span>}
                </button>
              ))}
            </div>
            <div className="application-list">
              {visibleApplications.length ? visibleApplications.map((application) => (
                <article className="application-row" key={application.id}>
                  <div className="company-cell">
                    <div className={`company-avatar company-${application.company.toLowerCase().replaceAll(/[^a-z]/g, "")}`}>{application.company.slice(0, 1)}</div>
                    <div className="company-copy"><span className="company-name">{application.company}</span><span className="job-role">{application.role}</span></div>
                  </div>
                  <div className="application-meta">
                    <span><Icon name="calendar" size={14} /> {formatDate(application.applicationDate)}</span>
                    {application.salary && <span className="salary-label">{application.salary}</span>}
                  </div>
                  <div className="application-actions">
                    <span className={statusClass(application.status)}>{application.status}</span>
                    <button aria-label={`Edit ${application.company} application`} className="icon-button" onClick={() => openEditForm(application)} type="button"><Icon name="edit" size={16} /></button>
                  </div>
                </article>
              )) : (
                <div className="empty-state">
                  <span className="empty-icon"><Icon name="search" size={20} /></span>
                  <h3>No applications found</h3>
                  <p>Try a different search or status filter.</p>
                  <button className="text-link-button" onClick={() => { setSearch(""); setActiveFilter("All applications"); }} type="button">Clear filters</button>
                </div>
              )}
            </div>
          </section>
          {previewMode && <p className="demo-note">This preview uses sample data. Your changes stay in this browser session only.</p>}
        </div>
      </main>

      {isFormOpen && (
        <div className="modal-backdrop" onClick={(event) => { if (event.target === event.currentTarget) closeForm(); }}>
          <section aria-labelledby="application-form-title" aria-modal="true" className="application-modal" role="dialog">
            <div className="modal-heading">
              <div><p className="panel-kicker">{editing ? "UPDATE DETAILS" : "NEW OPPORTUNITY"}</p><h2 id="application-form-title">{editing ? "Edit application" : "Add an application"}</h2></div>
              <button aria-label="Close form" className="icon-button" onClick={closeForm} type="button"><Icon name="close" /></button>
            </div>
            <form className="application-form" onSubmit={saveApplication} ref={applicationFormRef}>
              {formError && <p className="auth-feedback error" role="alert">{formError}</p>}
              <label>Company name<input autoFocus defaultValue={editing?.company} name="company" required /></label>
              <label>Job role<input defaultValue={editing?.role} name="role" required /></label>
              <label>Application date<input defaultValue={editing?.applicationDate} name="applicationDate" required type="date" /></label>
              {previewMode ? (
                <label>Salary <span className="optional-label">Optional</span><input defaultValue={editing?.salary} name="salary" placeholder="e.g. $120k–$150k" /></label>
              ) : (
                <div className="form-row">
                  <label>Salary amount <span className="optional-label">Optional</span><input defaultValue={editing?.salaryAmount} min="0" name="salaryAmount" placeholder="e.g. 120000" step="0.01" type="number" /></label>
                  <label>Currency <span className="optional-label">Optional</span><input autoCapitalize="characters" defaultValue={editing?.salaryCurrency} maxLength={3} name="salaryCurrency" placeholder="USD" /></label>
                </div>
              )}
              <label>Status<select defaultValue={editing?.status ?? "Applied"} name="status">{STATUSES.map((status) => <option key={status}>{status}</option>)}</select></label>
              <label>Job description <span className="optional-label">Optional</span><textarea defaultValue={editing?.description} name="description" rows={3} /></label>
              <div className="ai-summary-actions">
                <button
                  className="ai-summary-button"
                  disabled={isSummarizing || isPending}
                  onClick={summarizeDescription}
                  type="button"
                >
                  {isSummarizing ? "Summarizing…" : "✦ Summarize with AI"}
                </button>
                <span>Only the job description is sent to Google Gemini.</span>
              </div>
              {summaryError && <p className="auth-feedback error" role="alert">{summaryError}</p>}
              {summary && (
                <section aria-live="polite" className="ai-summary-result">
                  <h3>AI summary</h3>
                  <p>{summary}</p>
                  <span>This summary isn&apos;t saved automatically.</span>
                </section>
              )}
              <label>Notes <span className="optional-label">Optional</span><textarea defaultValue={editing?.notes} name="notes" rows={3} /></label>
              <div className="modal-footer">
                {editing ? <button className="delete-button" onClick={deleteApplication} type="button">Delete application</button> : <span />}
                <div className="modal-actions">
                  <button className="cancel-button" onClick={closeForm} type="button">Cancel</button>
                  <button className="primary-button" disabled={isPending} type="submit">{isPending ? "Saving…" : editing ? "Save changes" : "Add application"}</button>
                </div>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
