import { ReactNode } from 'react';

interface FormSectionProps {
  id?: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}

/** Card-style section for long admin forms — consistent hierarchy and scroll targets. */
export function FormSection({ id, title, subtitle, children, className = '' }: FormSectionProps) {
  return (
    <section
      id={id}
      className={`scroll-mt-[11rem] rounded-2xl border border-slate-200/90 bg-white shadow-sm shadow-slate-900/5 ring-1 ring-slate-900/[0.04] sm:scroll-mt-[11.5rem] ${className}`}
    >
      <header className="border-b border-slate-100 bg-gradient-to-br from-slate-50/95 via-white to-white px-5 py-4 sm:px-6 sm:py-5">
        <h2 className="text-base font-semibold tracking-tight text-slate-900 sm:text-lg">{title}</h2>
        {subtitle ? (
          <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{subtitle}</p>
        ) : null}
      </header>
      <div className="space-y-5 p-5 sm:p-6">{children}</div>
    </section>
  );
}
