import { ReactNode } from 'react';
import { Pencil, Trash2 } from 'lucide-react';

export interface Column<T> {
  header: string;
  render: (row: T) => ReactNode;
  className?: string;
}

interface Props<T extends { id: number }> {
  columns: Column<T>[];
  data: T[];
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  isLoading?: boolean;
  emptyMessage?: string;
}

export default function DataTable<T extends { id: number }>({
  columns, data, onEdit, onDelete, isLoading, emptyMessage = 'No records found.',
}: Props<T>) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="p-8 text-center text-sm text-slate-400 animate-pulse">Loading…</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {columns.map((col, i) => (
                <th key={i} className={`px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap ${col.className ?? ''}`}>
                  {col.header}
                </th>
              ))}
              {(onEdit || onDelete) && (
                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.length === 0 ? (
              <tr><td colSpan={columns.length + 1} className="px-4 py-10 text-center text-slate-400">{emptyMessage}</td></tr>
            ) : data.map((row) => (
              <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                {columns.map((col, i) => (
                  <td key={i} className={`px-4 py-3 text-slate-700 ${col.className ?? ''}`}>{col.render(row)}</td>
                ))}
                {(onEdit || onDelete) && (
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      {onEdit && (
                        <button onClick={() => onEdit(row)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => { if (window.confirm('Delete this record?')) onDelete(row); }}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
