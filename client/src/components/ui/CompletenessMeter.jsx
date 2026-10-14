import React from 'react';
import { Sparkles, CheckCircle2 } from 'lucide-react';

export function CompletenessMeter({ score = 50, tips = [] }) {
  const percentage = Math.min(100, Math.max(0, score));

  let colorClass = 'bg-red-500';
  let textClass = 'text-red-700';
  let tierLabel = 'Needs Details';

  if (percentage >= 80) {
    colorClass = 'bg-brand-green';
    textClass = 'text-brand-green';
    tierLabel = 'Great Quality';
  } else if (percentage >= 50) {
    colorClass = 'bg-amber-500';
    textClass = 'text-amber-700';
    tierLabel = 'Moderate';
  }

  return (
    <div className="p-4 bg-background-secondary/60 rounded-2xl border border-border-subtle">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-brand-green" />
          <span className="text-xs font-bold text-text-primary uppercase tracking-wider">
            Listing Completeness
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-semibold ${textClass}`}>{tierLabel}</span>
          <span className="text-sm font-extrabold text-text-primary">{percentage}%</span>
        </div>
      </div>

      {/* Progress Track */}
      <div className="w-full bg-border-subtle rounded-full h-2 overflow-hidden">
        <div
          className={`h-full ${colorClass} transition-all duration-500 rounded-full`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {tips && tips.length > 0 && (
        <div className="mt-3 space-y-1">
          {tips.map((tip, idx) => (
            <div key={idx} className="flex items-start gap-1.5 text-xs text-text-muted">
              <CheckCircle2 className="w-3.5 h-3.5 text-brand-green shrink-0 mt-0.5" />
              <span>{tip}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
