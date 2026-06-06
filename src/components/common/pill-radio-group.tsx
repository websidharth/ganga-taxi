'use client';

import type { LucideIcon } from 'lucide-react';

import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';

export type PillRadioOption = {
    id: string;
    value: string;
    label: string;
    icon?: LucideIcon;
};

type PillRadioGroupProps = {
    value: string;
    onValueChange: (value: string) => void;
    options: PillRadioOption[];
    className?: string;
    optionClassName?: string;
};

export function PillRadioGroup({
    value,
    onValueChange,
    options,
    className,
    optionClassName,
}: PillRadioGroupProps) {
    return (
        <div className="space-y-2 rounded-xl border border-[#dce7f7] bg-[#f8fbff] p-2">
            <RadioGroup value={value} onValueChange={onValueChange} className={cn('flex flex-wrap gap-2', className)}>
                {options.map((opt) => {
                    const Icon = opt.icon;
                    return (
                        <label
                            key={opt.id}
                            htmlFor={opt.id}
                            className={cn(
                                'inline-flex cursor-pointer items-center gap-2 rounded-xl border border-border/70 bg-background/80 px-3 py-2 text-sm font-medium text-foreground transition-all hover:bg-background',
                                value === opt.value && 'border-primary/60 bg-primary/10 text-primary',
                                optionClassName,
                            )}
                        >
                            <RadioGroupItem value={opt.value} id={opt.id} />
                            {Icon && <Icon size={16} />}
                            <span>{opt.label}</span>
                        </label>
                    );
                })}
            </RadioGroup>
        </div>
    );
}
