import React from 'react';

/**
 * Spendora Core UI Components
 * 
 * Rules:
 * - Uses global theme tokens only (defined in index.css)
 * - No inline styling
 * - Reusable across all pages
 */

export const PrimaryButton = ({ children, onClick, disabled, className = '', ...props }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        px-[var(--space-md)] py-[var(--space-sm)]
        bg-[var(--color-primary)] text-white
        rounded-[var(--radius-btn)] font-[var(--weight-semibold)]
        text-[var(--text-body)] transition-all duration-200 ease-in-out
        hover:opacity-90 hover:scale-[1.02] hover:shadow-lg
        active:scale-[0.98] active:opacity-100
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
        flex items-center justify-center gap-[var(--space-xs)]
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
};

export const SecondaryButton = ({ children, onClick, disabled, className = '', ...props }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        px-[var(--space-md)] py-[var(--space-sm)]
        bg-transparent text-[var(--color-text-main)]
        border border-[var(--color-border)]
        rounded-[var(--radius-btn)] font-[var(--weight-semibold)]
        text-[var(--text-body)] transition-all duration-200 ease-in-out
        hover:bg-[var(--color-bg)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]
        active:scale-[0.95]
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-[var(--color-border)]
        flex items-center justify-center gap-[var(--space-xs)]
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
};

export const Card = ({ children, padding, className = '', ...props }) => {
  // Use responsive padding if none is provided
  const cardPadding = padding || 'p-[var(--space-sm)] sm:p-[var(--space-md)]';
  
  return (
    <div
      className={`
        bg-[var(--color-surface)]
        border border-[var(--color-border)]
        rounded-[var(--radius-card)]
        transition-all duration-300
        ${typeof cardPadding === 'string' && cardPadding.startsWith('p-') ? cardPadding : ''}
        ${className}
      `}
      style={!cardPadding.startsWith('p-') ? { padding: cardPadding } : {}}
      {...props}
    >
      {children}
    </div>
  );
};

export const SectionHeader = ({ title, actionLabel, onActionClick, className = '' }) => {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-[var(--space-xs)] sm:gap-[var(--space-md)] mb-[var(--space-lg)] ${className}`}>
      <h2 className="text-[var(--text-section-title)] font-[var(--weight-semibold)] text-[var(--color-text-main)] m-0 tracking-tight">
        {title}
      </h2>
      {actionLabel && (
        <button
          onClick={onActionClick}
          className="text-left sm:text-right text-[var(--text-muted)] text-[var(--color-text-muted)] font-[var(--weight-regular)] bg-transparent border-none cursor-pointer hover:text-[var(--color-primary)] transition-colors hover:translate-x-1"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export const EmptyState = ({ message, ctaLabel, onCtaClick, className = '' }) => {
  return (
    <div className={`flex flex-col items-center justify-center py-[var(--space-xl)] text-center animate-fade-in ${className}`}>
      <p className="text-[var(--text-body)] text-[var(--color-text-muted)] mb-[var(--space-lg)] max-w-xs mx-auto leading-relaxed">
        {message}
      </p>
      {ctaLabel && (
        <PrimaryButton onClick={onCtaClick} className="shadow-md">
          {ctaLabel}
        </PrimaryButton>
      )}
    </div>
  );
};

export const ProgressBar = ({ value, color = 'var(--color-primary)', className = '' }) => {
  const percentage = Math.min(Math.max(value, 0), 100);
  
  return (
    <div className={`w-full h-[var(--space-xs)] bg-[var(--color-border)] rounded-full overflow-hidden ${className}`}>
      <div 
        className="h-full transition-all duration-500 ease-out"
        style={{ 
          width: `${percentage}%`,
          backgroundColor: color
        }}
      />
    </div>
  );
};

export const Input = ({ label, className = '', prefix, ...props }) => {
  return (
    <div>
      {label && (
        <label className="block text-[var(--text-body)] font-[var(--weight-bold)] text-[var(--color-text-main)] mb-[var(--space-xs)]">
          {label}
        </label>
      )}
      <div className="relative">
        {prefix && (
          <span className="absolute left-[var(--space-md)] top-1/2 -translate-y-1/2 font-[var(--weight-bold)] text-[var(--color-text-muted)]">
            {prefix}
          </span>
        )}
        <input
          className={`
            w-full 
            py-[var(--space-sm)] 
            bg-[var(--color-bg)] 
            border border-[var(--color-border)] 
            rounded-[var(--radius-btn)] 
            focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] 
            transition-all 
            text-[var(--color-text-main)]
            ${prefix ? 'pl-[var(--space-xl)] pr-[var(--space-md)]' : 'px-[var(--space-md)]'}
            ${className}
          `}
          {...props}
        />
      </div>
    </div>
  );
};

export const Select = ({ label, options, className = '', placeholder = 'Select an option', ...props }) => {
  return (
    <div>
      {label && (
        <label className="block text-[var(--text-body)] font-[var(--weight-bold)] text-[var(--color-text-main)] mb-[var(--space-xs)]">
          {label}
        </label>
      )}
      <select
        className={`
          w-full 
          px-[var(--space-md)] 
          py-[var(--space-sm)] 
          bg-[var(--color-bg)] 
          border border-[var(--color-border)] 
          rounded-[var(--radius-btn)] 
          focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] 
          transition-all 
          appearance-none 
          text-[var(--color-text-main)]
          ${className}
        `}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export const Toggle = ({ checked, onChange, className = '' }) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={(e) => onChange({ target: { checked: !checked } })}
      className={`
        relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent 
        transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2
        ${checked ? 'bg-[var(--color-primary)]' : 'bg-slate-200'}
        ${className}
      `}
    >
      <span
        aria-hidden="true"
        className={`
          pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 
          transition duration-200 ease-in-out
          ${checked ? 'translate-x-5' : 'translate-x-0'}
        `}
      />
    </button>
  );
};
