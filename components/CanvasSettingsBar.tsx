import React from "react";
import InfoTooltipButton from "./InfoTooltipButton";

const CanvasSettingsBar: React.FC<{
    zoom: number;
    resetZoom: () => void;
    showControlsTooltip: boolean;
    setShowControlsTooltip: (show: boolean) => void;
    fullscreen: boolean;
    setFullscreen: (f: (prev: boolean) => boolean) => void;
}> = ({
    zoom,
    resetZoom,
    showControlsTooltip,
    setShowControlsTooltip,
    fullscreen,
    setFullscreen,
}) => (
    <div className="flex items-center mb-2 justify-between">
        <div>
            <span className="mr-2">Zoom: {(zoom * 100).toFixed(0)}%</span>
            <button
                onClick={resetZoom}
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition-colors mr-2">
                Reset View
            </button>
            <InfoTooltipButton show={showControlsTooltip} setShow={setShowControlsTooltip} />
        </div>
        <button
            onClick={() => setFullscreen(f => !f)}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1 rounded text-sm transition-colors flex items-center"
            aria-label={fullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}>
            {fullscreen ? (
                <>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 13H5v6h6v-4m6-6h4V5h-6v4m0 6v4h6v-6h-4m-6-6V5H5v6h4"
                        />
                    </svg>
                    Exit Fullscreen
                </>
            ) : (
                <>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 8V4h4M20 16v4h-4M4 16v4h4m12-12V4h-4"
                        />
                    </svg>
                    Fullscreen
                </>
            )}
        </button>
    </div>
);

export default CanvasSettingsBar;
