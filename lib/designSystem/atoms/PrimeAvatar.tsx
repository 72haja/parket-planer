import type { FC } from "react";
import { Avatar as PrimeAvatarPrimitive } from "primereact/avatar";

export interface PrimeAvatarProps {
    label: string;
    className?: string;
    shape?: "circle" | "square";
}

export const PrimeAvatar: FC<PrimeAvatarProps> = ({ label, className, shape }) => {
    return <PrimeAvatarPrimitive label={label} className={className} shape={shape} />;
};
