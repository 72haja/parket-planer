import { FC } from "react";
import clsx from "clsx";
import { ProgressSpinner } from "primereact/progressspinner";

interface PrimeLoadingProps {
    message?: string;
    className?: string;
}

export const PrimeLoading: FC<PrimeLoadingProps> = ({ message, className }) => {
    return (
        <div className={clsx(`flex flex-col items-center p-5`, className)}>
            <ProgressSpinner
                pt={{
                    root: { className: "w-12 h-12" },
                }}
            />
            {message && <p className="mt-4">{message}</p>}
        </div>
    );
};
