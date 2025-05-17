import type { FC } from "react";
import { InputNumber, InputNumberProps } from "primereact/inputnumber";

export interface PrimeInputNumberProps extends InputNumberProps {
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
