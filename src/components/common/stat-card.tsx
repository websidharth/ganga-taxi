import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '../ui/card';

type StatCardProps = {
  title: string;
  value: string | number;
  subtext?: string;
  icon: LucideIcon;
  iconBgClass: string;
  iconTextClass: string;
  iconBorderClass: string;
  valueColorClass?: string;
  loading?: boolean;
};

export default function StatCard({
  title,
  value,
  subtext,
  icon: Icon,
  iconBgClass,
  iconTextClass,
  iconBorderClass,
  valueColorClass,
  loading = false,
}: StatCardProps) {
  return (
    <Card className="border p-1 border-slate-100 shadow-[0_4px_25px_rgba(0,0,0,0.015)] hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 rounded-3xl bg-white overflow-hidden">
      <CardContent className="p-1 flex items-center justify-between h-full">
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            {title}
          </span>
          <div className={`text-2xl font-black tracking-tight flex items-baseline gap-1 ${valueColorClass || 'text-slate-900'}`}>
            {loading ? (
              <span className="text-slate-300 animate-pulse">...</span>
            ) : (
              value
            )}
            {subtext && !loading && (
              <span className="text-[10px] font-semibold text-slate-400 ml-0.5">
                {subtext}
              </span>
            )}
          </div>
        </div>
        <div
          className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 border ${iconBgClass} ${iconTextClass} ${iconBorderClass}`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
}
