import type { FC } from "react";
import { PrimeButton } from "@/lib/designSystem/atoms/PrimeButton";

interface InfoTooltipButtonProps {
    show: boolean;
    setShow: (show: boolean) => void;
}

export const InfoTooltipButton: FC<InfoTooltipButtonProps> = ({ show, setShow }) => {
    return (
        <div className="relative inline-block">
            <PrimeButton
                label=""
                icon={
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="16" x2="12" y2="12" />
                        <circle cx="12" y="8.5" r="1" />
                    </svg>
                }
                className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700 p-0 border-none"
                aria-label="Canvas controls information"
                onMouseEnter={() => setShow(true)}
                onMouseLeave={() => setShow(false)}
            />
            {show && (
                <div className="absolute left-0 bottom-full mb-2 p-3 w-64 bg-white rounded shadow-lg z-10 text-xs">
                    <h3 className="font-semibold text-sm mb-1">Canvas Controls:</h3>
                    <ul className="space-y-1">
                        <li>
                            <span className="font-medium">Draw:</span> Click and drag
                        </li>
                        <li>
                            <span className="font-medium">Pan:</span> Hold Option/Alt + drag
                        </li>
                        <li>
                            <span className="font-medium">Zoom:</span> Mouse wheel
                        </li>
                        <li>
                            <span className="font-medium">Undo:</span> Cmd+Z / Ctrl+Z
                        </li>
                    </ul>
                </div>
            )}
        </div>
    );
};
