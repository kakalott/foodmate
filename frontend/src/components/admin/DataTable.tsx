import React, { useState } from 'react';
import { ChevronUp, ChevronDown, Search } from 'lucide-react';
import { Input } from '../ui/Input';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { EmptyState } from '../ui/EmptyState';
import { Button } from '../ui/Button';

export interface Column<T> {
  key: keyof T | string;
  label: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  total?: number;
  page?: number;
  limit?: number;
  loading?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  onPageChange?: (page: number) => void;
  onSearch?: (q: string) => void;
  emptyMessage?: string;
  keyField?: keyof T;
}

export function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
  total = 0,
  page = 1,
  limit = 20,
  loading = false,
  searchable = false,
  searchPlaceholder = 'Tìm kiếm...',
  onPageChange,
  onSearch,
  emptyMessage = 'Không có dữ liệu',
  keyField = 'id' as keyof T,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string>('');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="bg-white rounded-card shadow-soft border border-gray-100 overflow-hidden">
      {/* Search */}
      {searchable && (
        <div className="p-4 border-b border-gray-100">
          <Input
            placeholder={searchPlaceholder}
            leftIcon={<Search size={16} />}
            onChange={(e) => onSearch?.(e.target.value)}
          />
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50/80">
            <tr>
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  className={[
                    'px-4 py-3 text-left font-semibold text-fm-text/70',
                    col.sortable ? 'cursor-pointer hover:bg-gray-100 select-none' : '',
                    col.width ? `w-[${col.width}]` : '',
                  ].join(' ')}
                  onClick={() => col.sortable && handleSort(String(col.key))}
                >
                  <div className="flex items-center gap-1">
                    {col.label}
                    {col.sortable && (
                      <span className="text-fm-text/30">
                        {sortKey === col.key ? (
                          sortDir === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                        ) : (
                          <ChevronDown size={14} />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="py-16 text-center">
                  <LoadingSpinner className="mx-auto" />
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length}>
                  <EmptyState title={emptyMessage} />
                </td>
              </tr>
            ) : (
              data.map((item, idx) => (
                <tr
                  key={String(item[keyField]) || idx}
                  className="hover:bg-fm-bg/50 transition-colors"
                >
                  {columns.map((col) => (
                    <td key={String(col.key)} className="px-4 py-3 text-fm-text">
                      {col.render
                        ? col.render(item)
                        : String(item[col.key as keyof T] ?? '-')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
          <p className="text-sm text-fm-text/50">
            {total} kết quả — trang {page}/{totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={page <= 1}
              onClick={() => onPageChange?.(page - 1)}
            >
              Trước
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={page >= totalPages}
              onClick={() => onPageChange?.(page + 1)}
            >
              Sau
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
