import React, { useState } from 'react';
import { EmptyState } from './EmptyState';
import { ChevronUp, ChevronDown } from 'lucide-react';

const Table = ({
  columns = [],
  data = [],
  loading = false,
  emptyMessage = 'No data available',
  pagination,
  onSort,
  sortKey,
  sortDirection,
  onRowClick,
  rowActions = [],
  children,
  className = ''
}) => {
  const [activeDropdown, setActiveDropdown] = useState(null);

  const handleActionClick = (e, action, row) => {
    e.stopPropagation();
    action.onClick(row);
    setActiveDropdown(null);
  };

  const toggleDropdown = (e, index) => {
    e.stopPropagation();
    setActiveDropdown(activeDropdown === index ? null : index);
  };

  if (children) {
    return (
      <div className={`w-full bg-surface-2 border border-border-subtle rounded-card overflow-hidden shadow-card flex flex-col ${className}`}>
        <div className="overflow-x-auto relative">
          <table className="w-full text-sm text-left text-text-secondary">
            {children}
          </table>
        </div>
      </div>
    );
  }

  const tableData = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []);

  if (!loading && tableData.length === 0) {
    return <EmptyState title="No Records" description={emptyMessage} />;
  }

  return (
    <div className={`w-full bg-surface-2 border border-border-subtle rounded-card overflow-hidden shadow-card flex flex-col ${className}`}>
      <div className="overflow-x-auto relative">
        <table className="w-full text-sm text-left text-text-secondary border-collapse">
          <thead className="text-xs font-semibold text-text-muted uppercase tracking-wider bg-surface-1 border-b border-border-subtle sticky top-0 z-10">
            <tr>
              {columns.map((col, idx) => {
                const key = col.key || col.accessor || idx;
                const label = col.label || col.header || '';
                const isSorted = sortKey === key;
                return (
                  <th 
                    key={key} 
                    scope="col"
                    className={`px-5 py-3.5 font-medium select-none ${col.sortable ? 'cursor-pointer hover:text-text-main' : ''} ${col.align === 'right' ? 'text-right' : 'text-left'}`}
                    onClick={() => col.sortable && onSort && onSort(key)}
                  >
                    <div className={`inline-flex items-center gap-1.5 ${col.align === 'right' ? 'justify-end w-full' : ''}`}>
                      <span>{label}</span>
                      {col.sortable && (
                        <span className="text-text-muted/60">
                          {isSorted && sortDirection === 'asc' ? (
                            <ChevronUp className="w-3.5 h-3.5 text-accent-blue" />
                          ) : isSorted && sortDirection === 'desc' ? (
                            <ChevronDown className="w-3.5 h-3.5 text-accent-blue" />
                          ) : (
                            <span className="opacity-0 group-hover:opacity-100 text-[10px]">↕</span>
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
              {rowActions.length > 0 && (
                <th scope="col" className="px-5 py-3.5 text-right font-medium">Actions</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {loading ? (
              Array.from({ length: 5 }).map((_, rIdx) => (
                <tr key={rIdx} className="animate-pulse">
                  {columns.map((_, cIdx) => (
                    <td key={cIdx} className="px-5 py-4">
                      <div className="h-4 bg-surface-3 rounded w-3/4"></div>
                    </td>
                  ))}
                  {rowActions.length > 0 && (
                    <td className="px-5 py-4 text-right">
                      <div className="h-4 bg-surface-3 rounded w-8 ml-auto"></div>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              tableData.map((row, rowIdx) => (
                <tr 
                  key={row.id || rowIdx}
                  onClick={() => onRowClick && onRowClick(row)}
                  className={`border-b border-border-subtle/50 transition-colors ${
                    onRowClick ? 'cursor-pointer hover:bg-surface-3/60' : 'hover:bg-surface-3/30'
                  }`}
                >
                  {columns.map((col, colIdx) => {
                    const key = col.key || col.accessor || colIdx;
                    const val = row[col.accessor || col.key];
                    return (
                      <td 
                        key={key} 
                        className={`px-5 py-3.5 text-text-main ${col.align === 'right' ? 'text-right' : 'text-left'} ${col.className || ''}`}
                      >
                        {col.render ? col.render(row, val) : (val !== undefined && val !== null ? String(val) : '—')}
                      </td>
                    );
                  })}
                  {rowActions.length > 0 && (
                    <td className="px-5 py-3.5 text-right relative">
                      <button
                        type="button"
                        onClick={(e) => toggleDropdown(e, rowIdx)}
                        aria-label="Row actions menu"
                        aria-haspopup="menu"
                        aria-expanded={activeDropdown === rowIdx}
                        className="p-1.5 rounded-md text-text-muted hover:text-text-main hover:bg-surface-3 transition-colors min-w-[32px] min-h-[32px] inline-flex items-center justify-center focus-visible:ring-2 focus-visible:ring-accent-blue/40"
                      >
                        •••
                      </button>
                      {activeDropdown === rowIdx && (
                        <>
                          <div 
                            className="fixed inset-0 z-10" 
                            onClick={(e) => { e.stopPropagation(); setActiveDropdown(null); }} 
                            aria-hidden="true" 
                          />
                          <div 
                            className="absolute right-4 mt-1 w-36 bg-surface-3 border border-border-medium rounded-lg shadow-dropdown py-1 z-20 animate-fade-in"
                            role="menu"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {rowActions.map((action, actIdx) => (
                              <button
                                key={actIdx}
                                role="menuitem"
                                onClick={(e) => handleActionClick(e, action, row)}
                                className={`w-full text-left px-3 py-1.5 text-xs flex items-center gap-2 hover:bg-surface-2 transition-colors ${
                                  action.danger ? 'text-accent-rose' : 'text-text-main'
                                }`}
                              >
                                {action.icon && <action.icon className="w-3.5 h-3.5" />}
                                {action.label}
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination && (
        <div className="px-5 py-3 border-t border-border-subtle bg-surface-1 flex items-center justify-between text-xs text-text-muted">
          <div>
            Showing <span className="font-semibold text-text-main">{(pagination.page - 1) * pagination.limit + 1}</span> to{' '}
            <span className="font-semibold text-text-main">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of{' '}
            <span className="font-semibold text-text-main">{pagination.total}</span> records
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="px-2.5 py-1 rounded bg-surface-2 border border-border-subtle text-text-main disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface-3 transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              disabled={pagination.page * pagination.limit >= pagination.total}
              className="px-2.5 py-1 rounded bg-surface-2 border border-border-subtle text-text-main disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface-3 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Sub-components for compound Table usage
Table.Header = ({ children, className = '' }) => (
  <thead className={`text-xs font-semibold text-text-muted uppercase tracking-wider bg-surface-1 border-b border-border-subtle ${className}`}>
    {children}
  </thead>
);

Table.Body = ({ children, className = '' }) => (
  <tbody className={`divide-y divide-border-subtle ${className}`}>
    {children}
  </tbody>
);

Table.Row = ({ children, onClick, className = '' }) => (
  <tr 
    onClick={onClick} 
    className={`border-b border-border-subtle/50 transition-colors ${onClick ? 'cursor-pointer hover:bg-surface-3/60' : 'hover:bg-surface-3/30'} ${className}`}
  >
    {children}
  </tr>
);

Table.Head = ({ children, className = '', align = 'left' }) => (
  <th scope="col" className={`px-5 py-3.5 font-medium select-none text-${align} ${className}`}>
    {children}
  </th>
);

Table.Cell = ({ children, className = '', align = 'left' }) => (
  <td className={`px-5 py-3.5 text-text-main text-${align} ${className}`}>
    {children}
  </td>
);

export { Table };
export default Table;
