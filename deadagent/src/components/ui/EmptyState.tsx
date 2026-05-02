import React from 'react';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description: string;
  ctaLabel?: string;
  ctaHref?: string;
  onCta?: () => void;
}

export function EmptyState({ icon = 'inbox', title, description, ctaLabel, ctaHref, onCta }: EmptyStateProps) {
  const Wrapper = ctaHref ? 'a' : 'button';

  return (
    <div className="flex flex-col items-center justify-center py-20 gap-6">
      <div className="w-20 h-20 rounded-sm border border-[#c9a84c]/15 bg-[#c9a84c]/5 flex items-center justify-center">
        <span className="material-symbols-outlined text-[#c9a84c]/40 text-[32px]">{icon}</span>
      </div>
      <div className="text-center flex flex-col gap-2 max-w-sm">
        <h3 className="font-serif text-[20px] text-[#e4e2e1]">{title}</h3>
        <p className="font-sans text-[12px] text-[#99907e] leading-relaxed">{description}</p>
      </div>
      {ctaLabel && (
        <Wrapper
          {...(ctaHref ? { href: ctaHref } : {})}
          onClick={onCta}
          className="border border-[#c9a84c]/30 text-[#c9a84c] px-8 py-2.5 rounded-sm text-[10px] uppercase tracking-[0.2em] hover:bg-[#c9a84c]/10 transition-colors"
        >
          {ctaLabel}
        </Wrapper>
      )}
    </div>
  );
}
