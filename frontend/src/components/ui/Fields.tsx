import { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

const base = 'w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:bg-slate-50 disabled:text-slate-500';

interface Common { label: string; required?: boolean; className?: string; }

export function InputField({ label, required, className, ...p }: Common & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={className}>
      <label className="block text-xs font-medium text-slate-600 mb-1">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <input className={base} {...p} />
    </div>
  );
}

export function SelectField({ label, required, className, children, ...p }: Common & SelectHTMLAttributes<HTMLSelectElement> & { children: React.ReactNode }) {
  return (
    <div className={className}>
      <label className="block text-xs font-medium text-slate-600 mb-1">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <select className={cn(base, 'cursor-pointer')} {...p}>{children}</select>
    </div>
  );
}

export function TextareaField({ label, required, className, ...p }: Common & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <div className={className}>
      <label className="block text-xs font-medium text-slate-600 mb-1">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <textarea className={cn(base, 'resize-y')} rows={3} {...p} />
    </div>
  );
}

export function CheckboxField({ label, className, ...p }: Omit<Common, 'required'> & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className={cn('flex items-center gap-2 cursor-pointer', className)}>
      <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" {...p} />
      <span className="text-sm text-slate-700">{label}</span>
    </label>
  );
}

export function SectionHeader({ title }: { title: string }) {
  return <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider col-span-full border-b pb-1 mt-2">{title}</p>;
}
