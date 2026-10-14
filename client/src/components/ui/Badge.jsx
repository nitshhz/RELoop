import React from 'react';

export function Badge({ children, variant = 'default', size = 'sm', className = '' }) {
  const base = 'inline-flex items-center font-semibold rounded-full select-none';

  const sizes = {
    sm: 'text-xs px-2.5 py-0.5',
    md: 'text-xs px-3 py-1',
    lg: 'text-sm px-3.5 py-1.5',
  };

  const variants = {
    default: 'bg-background-secondary text-text-primary border border-border-subtle',
    green: 'bg-brand-green-soft text-brand-green border border-emerald-200',
    terracotta: 'bg-orange-50 text-terracotta border border-orange-200',
    blue: 'bg-blue-50 text-blue-700 border border-blue-200',
    amber: 'bg-amber-50 text-amber-700 border border-amber-200',
    red: 'bg-red-50 text-red-700 border border-red-200',
    purple: 'bg-purple-50 text-purple-700 border border-purple-200',
  };

  return (
    <span className={`${base} ${sizes[size]} ${variants[variant] || variants.default} ${className}`}>
      {children}
    </span>
  );
}

export function ConditionBadge({ condition }) {
  const map = {
    NEW: { label: 'Brand New', variant: 'green' },
    LIKE_NEW: { label: 'Like New', variant: 'green' },
    GOOD: { label: 'Good', variant: 'blue' },
    FAIR: { label: 'Fair', variant: 'amber' },
    POOR: { label: 'Needs Care', variant: 'red' },
  };

  const info = map[condition] || { label: condition, variant: 'default' };
  return <Badge variant={info.variant}>{info.label}</Badge>;
}

export function StatusBadge({ status }) {
  const map = {
    ACTIVE: { label: 'Live', variant: 'green' },
    PENDING_REVIEW: { label: 'Pending Review', variant: 'amber' },
    RESERVED: { label: 'Reserved', variant: 'purple' },
    SOLD: { label: 'Sold', variant: 'default' },
    REJECTED: { label: 'Rejected', variant: 'red' },
    REMOVED: { label: 'Removed', variant: 'red' },
    DRAFT: { label: 'Draft', variant: 'default' },
    EXPIRED: { label: 'Expired', variant: 'default' },
  };

  const info = map[status] || { label: status, variant: 'default' };
  return <Badge variant={info.variant}>{info.label}</Badge>;
}
