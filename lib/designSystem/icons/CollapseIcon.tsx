import type { FC } from "react";

interface CollapseIconProps {
    className?: string;
}

export const CollapseIcon: FC<CollapseIconProps> = ({ className = "h-5 w-5" }) => (
    <svg viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path
            d="M13 13L9 9M9 9V13M9 9H13M1 9H5M5 9V13M5 9L1 13M13 1L9 5M9 5V1M9 5H13M1 5H5M5 5V1M5 5L1 1"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);
