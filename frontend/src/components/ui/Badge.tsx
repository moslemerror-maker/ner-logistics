import { cn } from '@/lib/utils';

type Color = 'green' | 'red' | 'yellow' | 'blue' | 'slate' | 'purple' | 'orange';

const colors: Record<Color, string> = {
  green: 'bg-green-100 text-green-700',
  red: 'bg-red-100 text-red-700',
  yellow: 'bg-yellow-100 text-yellow-700',
  blue: 'bg-blue-100 text-blue-700',
  slate: 'bg-slate-100 text-slate-600',
  purple: 'bg-purple-100 text-purple-700',
  orange: 'bg-orange-100 text-orange-700',
};

interface Props { label: string; color?: Color; className?: string; }

export default function Badge({ label, color = 'slate', className }: Props) {
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium', colors[color], className)}>
      {label}
    </span>
  );
}
