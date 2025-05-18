import type { FC } from "react";

interface InfoTooltipButtonProps {
    show: boolean;
    setShow: (show: boolean) => void;
}

export const InfoTooltipButton: FC<InfoTooltipButtonProps> = ({ show, setShow }) => {
    return (
        <div className="relative grid place-items-center">
            <span
                className="pi pi-info-circle text-[#6366f1]"
                aria-label="Canvas controls information"
                onMouseEnter={() => setShow(true)}
                onMouseLeave={() => setShow(false)}
            />
            {show && (
                <div className="absolute left-0 bottom-full mb-2 p-3 w-64 bg-white rounded shadow-lg z-10 text-xs">
                    <h3 className="font-semibold text-sm mb-1">Canvas Controls:</h3>
                    <ul className="space-y-1">
                        <li>
                            <span className="font-medium">Draw:</span> Click and drag if flooring is not shown
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
                        <li>
                            <span className="font-medium">Show Flooring:</span> Select flooring in the list on the left
                        </li>
                    </ul>
                </div>
            )}
        </div>
    );
};
