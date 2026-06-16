"use client";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

interface FAQsTableData {
  title?: string;
  faqs: FAQItem[];
}

export function FAQsTableRenderer({ data }: { data: FAQsTableData }) {
  const faqs = data?.faqs ?? [];
  if (faqs.length === 0) {
    return (
      <div className="rounded-xl border border-primary/10 bg-primary/[0.02] p-6 text-center">
        <p className="text-sm text-muted">No FAQ entries found in the database.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-primary/10 bg-white divide-y divide-primary/5">
      {data.title && (
        <div className="px-4 py-3 border-b border-primary/10">
          <h3 className="text-sm font-semibold text-primary">{data.title}</h3>
        </div>
      )}
      {faqs.map((faq) => (
        <details key={faq.id} className="group">
          <summary className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-primary/[0.02] transition-colors text-sm font-medium text-foreground [&::-webkit-details-marker]:hidden">
            <span>{faq.question}</span>
            <svg
              className="w-4 h-4 text-muted shrink-0 transition-transform group-open:rotate-180"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </summary>
          <div className="px-4 pb-3 text-sm text-muted leading-relaxed">
            {faq.answer}
          </div>
        </details>
      ))}
    </div>
  );
}
