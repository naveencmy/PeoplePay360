import React, { useState } from 'react';
import { EmptyState } from './EmptyState';

const Table = ({
  columns = [],
  data = [],
  loading = false,
  emptyMessage = 'No data available',
  pagination,
  onSort,
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
      <div className={`w-full bg-[#161B22] border border-[rgba(255,255,255,0.08)] rounded-lg overflow-hidden flex flex-col ${className}`}>
        <div className="overflow-x-auto relative">
          <table className="w-full text-sm text-left text-gray-300">
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
    <div className="w-full bg-[#161B22] border border-[rgba(255,255,255,0.08)] rounded-lg overflow-hidden flex flex-col">
      <div className="overflow-x-auto relative">
        <table className="w-full text-sm text-left text-gray-300">
          <thead className="text-xs text-gray-400 uppercase bg-[#0B0D10] sticky top-0 z-10 border-b border-[rgba(255,255,255,0.08)]">
            <tr>
              {columns.map((col, idx) => {
                const key = col.key || col.accessor || idx;
                const label = col.label || col.header || '';
                return (
                  <th 
                    key={key} 
                    className={`px-6 py-3 font-medium tracking-wider ${col.sortable ? 'cursor-pointer hover:text-white' : ''}`}
                    onClick={() => col.sortable && onSort && onSort(key)}
                  >
                    <div className="flex items-center gap-1">
                      {label}
                      {col.sortable && <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" /></svg>}
                    </div>
                  </th>
                );
              })}
              {rowActions.length > 0 && <th className="px-6 py-3 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, rIdx) => (
                <tr key={rIdx} className="border-b border-[rgba(255,255,255,0.08)]">
                  {columns.map((_, cIdx) => (
                    <td key={cIdx} className="px-6 py-4">
                      <div className="h-4 bg-gray-700 rounded animate-pulse w-3/4"></div>
                    </td>
                  ))}
                  {rowActions.length > 0 && <td className="px-6 py-4"></td>}
                </tr>
              ))
            ) : (
              tableData.map((row, rIdx) => (
                <tr 
                  key={row.id || rIdx} 
                  className={`border-b border-[rgba(255,255,255,0.08)] hover:bg-gray-800 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
                  onClick={() => onRowClick && onRowClick(row)}
                >
                  {columns.map((col, cIdx) => {
                    const key = col.key || col.accessor;
                    return (
                      <td key={cIdx} className="px-6 py-4 whitespace-nowrap">
                        {col.render ? col.render(row) : (key ? row[key] : null)}
                      </td>
                    );
                  })}
                  
                  {rowActions.length > 0 && (
                    <td className="px-6 py-4 whitespace-nowrap text-right relative">
                      <button 
                        className="text-gray-400 hover:text-white p-1 rounded hover:bg-gray-700"
                        onClick={(e) => toggleDropdown(e, rIdx)}
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                        </svg>
                      </button>
                      {activeDropdown === rIdx && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={(e) => { e.stopPropagation(); setActiveDropdown(null); }}></div>
                          <div className="absolute right-6 mt-1 w-40 bg-[#161B22] border border-[rgba(255,255,255,0.08)] rounded shadow-lg z-20 py-1">
                            {rowActions.map((action, aIdx) => (
                              <button
                                key={aIdx}
                                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-800 ${action.danger ? 'text-red-500' : 'text-gray-200'}`}
                                onClick={(e) => handleActionClick(e, action, row)}
                              >
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
        <div className="px-6 py-3 border-t border-[rgba(255,255,255,0.08)] bg-[#0B0D10] flex items-center justify-between text-sm">
          <div className="text-gray-400">
            Showing <span className="font-medium text-white">{((pagination.page - 1) * pagination.limit) + 1}</span> to <span className="font-medium text-white">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of <span className="font-medium text-white">{pagination.total}</span> results
          </div>
          <div className="flex gap-2">
            <button 
              disabled={pagination.page === 1}
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              className="px-3 py-1 bg-[#161B22] border border-[rgba(255,255,255,0.08)] text-gray-300 rounded hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button 
              disabled={pagination.page * pagination.limit >= pagination.total}
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              className="px-3 py-1 bg-[#161B22] border border-[rgba(255,255,255,0.08)] text-gray-300 rounded hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const TableHeader = ({ children, className = '' }) => (
  <thead className={`text-xs text-gray-400 uppercase bg-[#0B0D10] sticky top-0 z-10 border-b border-[rgba(255,255,255,0.08)] ${className}`}>
    {children}
  </thead>
);

const TableBody = ({ children, className = '' }) => (
  <tbody className={`divide-y divide-[rgba(255,255,255,0.08)] ${className}`}>
    {children}
  </tbody>
);

const TableRow = ({ children, className = '', onClick }) => (
  <tr 
    className={`border-b border-[rgba(255,255,255,0.08)] hover:bg-gray-800/50 transition-colors ${onClick ? 'cursor-pointer' : ''} ${className}`}
    onClick={onClick}
  >
    {children}
  </tr>
);

const TableHead = ({ children, className = '' }) => (
  <th className={`px-6 py-3 font-medium tracking-wider text-left ${className}`}>
    {children}
  </th>
);

const TableCell = ({ children, className = '' }) => (
  <td className={`px-6 py-4 whitespace-nowrap text-sm text-gray-300 ${className}`}>
    {children}
  </td>
);

Table.Header = TableHeader;
Table.Body = TableBody;
Table.Row = TableRow;
Table.Head = TableHead;
Table.Cell = TableCell;

export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell };

export default Table;
