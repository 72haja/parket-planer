import type { FC } from "react";
import { PrimeButton } from "@/lib/designSystem/atoms/PrimeButton";
import { PrimeInputSwitch } from "@/lib/designSystem/atoms/PrimeInputSwitch";
import { InfoTooltipButton } from "./InfoTooltipButton";

interface CanvasSettingsBarProps {
    zoom: number;
    resetZoom: () => void;
    showControlsTooltip: boolean;
    setShowControlsTooltip: (show: boolean) => void;
    fullscreen: boolean;
    setFullscreen: (f: (prev: boolean) => boolean) => void;
    snapEnabled: boolean;
    setSnapEnabled: (enabled: boolean) => void;
}

export const CanvasSettingsBar: FC<CanvasSettingsBarProps> = ({
    zoom,
    resetZoom,
    showControlsTooltip,
    setShowControlsTooltip,
    fullscreen,
    setFullscreen,
    snapEnabled,
    setSnapEnabled,
}) => {
    return (
        <div className="flex items-center mb-2 justify-between">
            <div className="flex items-center">
                <span className="mr-2">Zoom: {(zoom * 100).toFixed(0)}%</span>
                <PrimeButton
                    label="Reset"
                    className="p-1 px-2 border rounded bg-gray-100 hover:bg-gray-200 text-xs mr-4"
                    onClick={resetZoom}
                />
                <PrimeInputSwitch
                    checked={snapEnabled}
                    onChange={e => setSnapEnabled(e.value)}
                    className="mr-2"
                />
                <span className="mr-4">Snap</span>
                <InfoTooltipButton show={showControlsTooltip} setShow={setShowControlsTooltip} />
            </div>
            <PrimeButton
                label={fullscreen ? "Exit Fullscreen" : "Fullscreen"}
                className="p-1 px-2 border rounded bg-gray-100 hover:bg-gray-200 text-xs"
                onClick={() => setFullscreen(f => !f)}
            />
        </div>
    );
};
