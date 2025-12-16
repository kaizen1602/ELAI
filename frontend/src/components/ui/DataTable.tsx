import React from 'react';
import { ChevronLeft, ChevronRight, Database } from 'lucide-react';

interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  pagination?: {
    page: number;
    totalPages: number;
    total: number;
    onPageChange: (page: number) => void;
  };
  onRowClick?: (item: T) => void;
}

function DataTable<T extends { id: string }>({
  data,
  columns,
  loading,
  pagination,
  onRowClick,
}: DataTableProps<T>) {
  const getValue = (item: T, key: string): React.ReactNode => {
    const keys = key.split('.');
    let value: unknown = item;
    for (const k of keys) {
      value = (value as Record<string, unknown>)?.[k];
    }
    return value as React.ReactNode;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="animate-pulse">
          <div className="h-14 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 border-b border-gray-100 flex items-center px-6 space-x-4">
              <div className="h-4 bg-gray-200 rounded-full w-1/4"></div>
              <div className="h-4 bg-gray-200 rounded-full w-1/4"></div>
              <div className="h-4 bg-gray-200 rounded-full w-1/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-xl">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
            <tr>
              {columns.map((col, index) => (
                <th
                  key={String(col.key)}
                  className={`px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider ${
                    index === 0 ? 'rounded-tl-2xl' : ''
                  } ${index === columns.length - 1 ? 'rounded-tr-2xl' : ''}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center justify-center text-gray-400">
                    <Database className="w-12 h-12 mb-3 opacity-50" />
                    <p className="text-lg font-medium">No hay datos disponibles</p>
                    <p className="text-sm mt-1">Agrega nuevos registros para comenzar</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((item, rowIndex) => (
                <tr
                  key={item.id}
                  onClick={() => onRowClick?.(item)}
                  className={`${onRowClick ? 'cursor-pointer' : ''} hover:bg-blue-50/50 transition-colors duration-200 animate-fade-in`}
                  style={{ animationDelay: `${rowIndex * 0.03}s` }}
                >
                  {columns.map((col) => (
                    <td key={String(col.key)} className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {col.render ? col.render(item) : getValue(item, String(col.key))}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 flex items-center justify-between border-t border-gray-200">
          <div className="text-sm text-gray-600 font-medium">
            Página <span className="text-blue-600">{pagination.page}</span> de{' '}
            <span className="text-blue-600">{pagination.totalPages}</span>
            <span className="text-gray-400 ml-2">({pagination.total} registros)</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="p-2 rounded-xl border border-gray-200 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white hover:shadow-md hover:border-blue-200 transition-all duration-200"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                let pageNum;
                if (pagination.totalPages <= 5) {
                  pageNum = i + 1;
                } else if (pagination.page <= 3) {
                  pageNum = i + 1;
                } else if (pagination.page >= pagination.totalPages - 2) {
                  pageNum = pagination.totalPages - 4 + i;
                } else {
                  pageNum = pagination.page - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => pagination.onPageChange(pageNum)}
                    className={`w-9 h-9 rounded-xl text-sm font-medium transition-all duration-200 ${
                      pagination.page === pageNum
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25'
                        : 'text-gray-600 hover:bg-white hover:shadow-md'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              className="p-2 rounded-xl border border-gray-200 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white hover:shadow-md hover:border-blue-200 transition-all duration-200"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataTable;
