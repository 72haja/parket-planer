import type { FC } from "react";

interface MinusIconProps {
    className?: string;
}

export const MinusIcon: FC<MinusIconProps> = ({ className = "h-5 w-5" }) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            viewBox="0 0 20 20"
            fill="currentColor">
            <path
                fillRule="evenodd"
                d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z"
                clipRule="evenodd"
            />
        </svg>
    );
};
