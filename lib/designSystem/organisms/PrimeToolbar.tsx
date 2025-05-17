import type { FC, ReactNode } from "react";
import { Toolbar } from "primereact/toolbar";

export interface PrimeToolbarProps {
    start?: ReactNode;
    end?: ReactNode;
    className?: string;
}

export const PrimeToolbar: FC<PrimeToolbarProps> = ({ start, end, className }) => {
    return <Toolbar start={start} end={end} className={className} />;
};
