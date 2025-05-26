import { useState } from "react";
import type { FC } from "react";
import { Line } from "@/lib/types";

interface LineListProps {
    lines: Line[];
    onDeleteLine: (id: string) => void;
    setHoveredLineId: (id: string | null) => void;
    hoveredLineId: string | null;
}

export const LineList: FC<LineListProps> = ({
    lines,
    onDeleteLine,
    setHoveredLineId,
    hoveredLineId,
}) => {
    const [expanded, setExpanded] = useState(true);

    return (
        <div className="border border-gray-200 rounded-md p-4 h-full">
            <div
                className="flex justify-between items-center cursor-pointer"
                onClick={() => setExpanded(!expanded)}>
                <h2 className="text-lg font-medium mb-0">Lines ({lines.length})</h2>
                <button className="text-gray-500">
                    {expanded ? (
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor">
                            <path
                                fillRule="evenodd"
                                d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z"
                                clipRule="evenodd"
                            />
                        </svg>
                    ) : (
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor">
                            <path
                                fillRule="evenodd"
                                d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                                clipRule="evenodd"
                            />
                        </svg>
                    )}
                </button>
            </div>
            {expanded && (
                <div className="mt-4 space-y-2 max-h-[calc(100vh-16rem)] overflow-y-auto">
                    {lines.length > 0 ? (
                        lines.map(line => {
                            const length = Math.sqrt(
                                Math.pow(line.x2 - line.x1, 2) + Math.pow(line.y2 - line.y1, 2)
                            );

                            return (
                                <div
                                    key={line.id}
                                    className={`p-2 border rounded-md ${
                                        hoveredLineId === line.id
                                            ? "border-blue-400 bg-blue-50"
                                            : "border-gray-200"
                                    }`}
                                    onMouseEnter={() => setHoveredLineId(line.id)}
                                    onMouseLeave={() => setHoveredLineId(null)}>
                                    <div className="flex justify-between items-center">
                                        <div className="flex flex-col">
                                            <span className="text-sm">
                                                Length: {length.toFixed(0)}px
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                ({line.x1.toFixed(0)}, {line.y1.toFixed(0)}) to (
                                                {line.x2.toFixed(0)}, {line.y2.toFixed(0)})
                                            </span>
                                        </div>
                                        <button
                                            onClick={() => onDeleteLine(line.id)}
                                            className="ml-2 text-gray-400 hover:text-gray-600 focus:outline-none p-0 bg-transparent border-none"
                                            aria-label="Delete line">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-5 w-5"
                                                viewBox="0 0 20 20"
                                                fill="currentColor">
                                                <path
                                                    fillRule="evenodd"
                                                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="text-gray-500 text-center py-4">
                            No lines added yet. Use the Line tool to draw lines.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
