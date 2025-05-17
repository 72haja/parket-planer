import type { FC, InputHTMLAttributes } from "react";
import { InputText as PrimeInputTextPrimitive } from "primereact/inputtext";

export interface PrimeInputTextProps extends InputHTMLAttributes<HTMLInputElement> {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    className?: string;
}

export const PrimeInputText: FC<PrimeInputTextProps> = ({
    value,
    onChange,
    className,
    ...props
}) => {
    return (
        <PrimeInputTextPrimitive
            value={value}
            onChange={onChange}
            className={className}
            {...props}
        />
    );
};
