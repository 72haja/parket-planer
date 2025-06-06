import type { FC } from "react";
import { PrimeButton } from "@/lib/designSystem/atoms/PrimeButton";
import { PrimeDivider } from "@/lib/designSystem/atoms/PrimeDivider";
import { PrimeInputSwitch } from "@/lib/designSystem/atoms/PrimeInputSwitch";
import { XIcon } from "@/lib/designSystem/icons";
import { DrawingTool } from "@/lib/types";
import { InfoTooltipButton } from "./InfoTooltipButton";

interface CanvasSettingsBarProps {
    zoom: number;
    resetZoom: () => void;
    showControlsTooltip: boolean;
    setShowControlsTooltip: (show: boolean) => void;
    snapEnabled: boolean;
    setSnapEnabled: (enabled: boolean) => void;
    selectedTool: DrawingTool;
    setSelectedTool: (tool: DrawingTool) => void;
}

export const CanvasSettingsBar: FC<CanvasSettingsBarProps> = ({
    zoom,
    resetZoom,
    showControlsTooltip,
    setShowControlsTooltip,
    snapEnabled,
    setSnapEnabled,
    selectedTool,
    setSelectedTool,
}) => {
    return (
        <div className="flex items-center mb-2 justify-between gap-4 w-full flex-wrap">
            <div className="flex items-center gap-2 flex-wrap w-full">
                <InfoTooltipButton show={showControlsTooltip} setShow={setShowControlsTooltip} />
                <span className="w-[100px]">Zoom: {(zoom * 100).toFixed(0)}%</span>
                <PrimeButton
                    label="Reset Zoom"
                    size="small"
                    className="p-1 px-2 border rounded bg-gray-100 hover:bg-gray-200 text-xs mr-4"
                    onClick={resetZoom}
                />
                <PrimeDivider layout="vertical" />
                <div className="flex items-center gap-2">
                    <span className="text-xs">Tool:</span>
                    <PrimeButton
                        label="Rectangle"
                        size="small"
                        className={`p-1 px-2 border rounded text-xs ${
                            selectedTool === DrawingTool.Rectangle
                                ? "bg-blue-100 border-blue-300"
                                : "bg-gray-100 hover:bg-gray-200"
                        }`}
                        onClick={() => setSelectedTool(DrawingTool.Rectangle)}
                    />
                    <PrimeButton
                        label="Line"
                        size="small"
                        className={`p-1 px-2 border rounded text-xs ${
                            selectedTool === DrawingTool.Line
                                ? "bg-blue-100 border-blue-300"
                                : "bg-gray-100 hover:bg-gray-200"
                        }`}
                        onClick={() => setSelectedTool(DrawingTool.Line)}
                    />
                    <PrimeButton
                        label="Delete"
                        size="small"
                        className={`p-1 px-2 border rounded text-xs ${
                            selectedTool === DrawingTool.Delete
                                ? "bg-red-100 border-red-300"
                                : "bg-gray-100 hover:bg-gray-200"
                        }`}
                        onClick={() => setSelectedTool(DrawingTool.Delete)}
                        icon={<XIcon />}
                    />
                </div>
                <PrimeDivider layout="vertical" />
                <PrimeInputSwitch
                    label="Snap"
                    tooltip="Smart snap (points, angles & edges)"
                    checked={snapEnabled}
                    onChange={e => setSnapEnabled(e.value)}
                    className="mr-2"
                />
            </div>
        </div>
    );
};
