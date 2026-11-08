import type { ReactNode } from "react";
import Link from "next/link";

export function AuthCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <main className="auth-page">
      <section className="auth-card">
        <Link className="auth-brand" href="/" aria-label="Careerly home">
          <span className="brand-mark">✳</span>
          <span>careerly</span>
        </Link>
        <p className="panel-kicker">YOUR CAREER, IN MOTION</p>
        <h1>{title}</h1>
        <p className="auth-description">{description}</p>
        {children}
      </section>
    </main>
  );
}
