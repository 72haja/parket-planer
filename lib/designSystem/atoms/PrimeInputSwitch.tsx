import type { FC } from "react";
import clsx from "clsx";
import { InputSwitch, InputSwitchProps } from "primereact/inputswitch";
import { v4 as uuid } from "uuid";

export interface PrimeInputSwitchProps extends InputSwitchProps {
    checked: boolean;
    onChange: (e: { value: boolean }) => void;
    className?: string;
    wrapperClassName?: string;
    label?: string;
}

export const PrimeInputSwitch: FC<PrimeInputSwitchProps> = ({ className, label, wrapperClassName, ...props }) => {
    const id = props.id || uuid();

    return (
        <div className={clsx("flex items-center gap-2", wrapperClassName)}>
            {label && <label htmlFor={id}>{label}</label>}
            <InputSwitch id={id} {...props} className={className} />
        </div>
    );
};
