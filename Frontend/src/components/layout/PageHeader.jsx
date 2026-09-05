import React from 'react';

export const PageHeader = ({
  breadcrumb,
  breadcrumbs,
  title,
  subtitle,
  icon: Icon,
  badge,
  action,
  actions,
  className = ''
}) => {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border-subtle/50 mb-6 ${className}`}>
      <div className="space-y-1">
        {Array.isArray(breadcrumbs) && breadcrumbs.length > 0 ? (
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-text-muted mb-1 flex-wrap">
            {breadcrumbs.map((b, i) => (
              <React.Fragment key={i}>
                {i > 0 && <span className="opacity-40">/</span>}
                {b.to ? (
                  <span className="hover:text-accent-blue transition-colors cursor-pointer">
                    {b.label || b}
                  </span>
                ) : (
                  <span>{b.label || b}</span>
                )}
              </React.Fragment>
            ))}
          </div>
        ) : breadcrumb ? (
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-text-muted mb-1">
            {breadcrumb}
          </div>
        ) : null}

        <div className="flex items-center gap-3">
          {Icon && (
            <div className="p-2 rounded-xl bg-surface-2 text-accent-blue border border-border-subtle shadow-card shrink-0">
              {React.isValidElement(Icon) ? Icon : <Icon className="w-5 h-5" />}
            </div>
          )}
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-main">{title}</h1>
            {badge && <div>{badge}</div>}
          </div>
        </div>
        {subtitle && (
          <p className="text-xs sm:text-sm text-text-muted max-w-2xl mt-0.5">
            {subtitle}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2.5 flex-shrink-0 flex-wrap">
        {action}
        {Array.isArray(actions) ? (
          actions.map((act, index) => (
            <button
              key={index}
              onClick={act.onClick}
              className={`px-3.5 py-1.5 rounded-input text-xs sm:text-sm font-medium transition-all ${
                act.primary
                  ? 'bg-accent-blue text-white hover:bg-accent-blue-hover shadow-sm hover:shadow-glow'
                  : 'bg-surface-2 text-text-main border border-border-medium hover:bg-surface-3 shadow-card'
              }`}
            >
              {act.label}
            </button>
          ))
        ) : (
          actions
        )}
      </div>
    </div>
  );
};

export default PageHeader;
