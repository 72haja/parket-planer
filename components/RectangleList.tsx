import React, { FC } from "react";
import { Rectangle } from "@/lib/types";

interface RectangleListProps {
    rectangles: Rectangle[];
    onDeleteRectangle: (id: string) => void;
    setHoveredRectangleId: (id: string | null) => void;
    hoveredRectangleId: string | null;
}

const RectangleList: FC<RectangleListProps> = ({
    rectangles,
    onDeleteRectangle,
    setHoveredRectangleId,
    hoveredRectangleId,
}) => {
    // Create a function to shorten UUIDs for display
    const shortenId = (id: string) => {
        return id.substring(0, 8);
    };

    return (
        <div className="h-full bg-white rounded-md p-5 shadow-sm grid grid-cols-1 grid-rows-[max-content_minmax(0,1fr)]">
            <h2 className="text-lg font-semibold mb-4">Rectangles</h2>
            {rectangles.length === 0 ? (
                <p className="text-gray-500 text-sm">No rectangles added yet</p>
            ) : (
                <div className="overflow-y-auto">
                    <div className="space-y-2">
                        {rectangles.map(rect => (
                            <div
                                key={rect.id}
                                className={`flex items-center justify-between p-3 rounded-md transition-colors
                                    ${
                                        rect.id === hoveredRectangleId
                                            ? "bg-blue-50 border border-blue-200"
                                            : "bg-gray-50"
                                    }`}
                                onMouseEnter={() => setHoveredRectangleId(rect.id)}
                                onMouseLeave={() => setHoveredRectangleId(null)}>
                                <div>
                                    <div className="flex items-center">
                                        <span
                                            className={`text-sm mr-2 ${rect.id === hoveredRectangleId ? "text-blue-600" : "text-gray-700"}`}>
                                            Rectangle {shortenId(rect.id)}
                                        </span>
                                    </div>
                                    <span className="text-xs text-gray-500">
                                        {Math.abs(rect.width).toFixed(0)}×
                                        {Math.abs(rect.height).toFixed(0)}px
                                    </span>
                                </div>
                                <button
                                    onClick={() => onDeleteRectangle(rect.id)}
                                    className="ml-2 text-gray-400 hover:text-gray-600 focus:outline-none"
                                    aria-label="Delete rectangle">
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
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default RectangleList;
