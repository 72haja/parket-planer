import type { FC } from "react";
import { InputNumber } from "primereact/inputnumber";

export interface PrimeInputNumberProps {
    value: number;
    onValueChange: (e: { value: number | null }) => void;
    min?: number;
    max?: number;
    step?: number;
    className?: string;
}

export const PrimeInputNumber: FC<PrimeInputNumberProps> = ({
    value,
    onValueChange,
    min,
    max,
    step,
    className,
}) => {
    return (
        <InputNumber
            value={value}
            onValueChange={onValueChange}
            min={min}
            max={max}
            step={step}
            className={className}
        />
    );
};
