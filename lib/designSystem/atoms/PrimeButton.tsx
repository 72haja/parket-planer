import type { ButtonHTMLAttributes, FC } from "react";
import { ButtonProps, Button as PrimeButtonPrimitive } from "primereact/button";
import { IconType } from "primereact/utils";

export interface PrimeButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    label: string;
    icon?: IconType<ButtonProps> | undefined;
    className?: string;
}

export const PrimeButton: FC<PrimeButtonProps> = ({ label, icon, className, ...props }) => {
    return <PrimeButtonPrimitive label={label} icon={icon} className={className} {...props} />;
};
