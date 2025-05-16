import React, { FC } from "react";

interface InfoTooltipButtonProps {
    show: boolean;
    setShow: (v: boolean) => void;
}

const InfoTooltipButton: FC<InfoTooltipButtonProps> = ({ show, setShow }) => (
    <div className="relative inline-block">
        <button
            onMouseEnter={() => setShow(true)}
            onMouseLeave={() => setShow(false)}
            className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700"
            aria-label="Canvas controls information">
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
                <circle cx="12" cy="8.5" r="1" />
            </svg>
        </button>
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

export default InfoTooltipButton;
