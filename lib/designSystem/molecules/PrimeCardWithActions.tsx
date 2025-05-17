import type { FC, ReactNode } from "react";
import { Card as PrimeCard } from "primereact/card";

export interface PrimeCardWithActionsProps {
    title: string;
    children: ReactNode;
    actions?: ReactNode;
    className?: string;
}

export const PrimeCardWithActions: FC<PrimeCardWithActionsProps> = ({
    title,
    children,
    actions,
    className,
}) => {
    return (
        <PrimeCard title={title} className={className}>
            <div>{children}</div>
            {actions && <div className="mt-4 flex gap-2">{actions}</div>}
        </PrimeCard>
    );
};
