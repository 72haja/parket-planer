import { useEffect, useState } from "react";
import type { FC } from "react";
import clsx from "clsx";
import { PrimeButton } from "@/lib/designSystem/atoms/PrimeButton";
import { CollapseIcon, ExpandIcon } from "@/lib/designSystem/icons";
import { useFloorplanCanvas } from "@/lib/hooks/useFloorplanCanvas";
import type { Flooring } from "@/lib/supabase";
import { DrawingTool, Line, Rectangle } from "@/lib/types";
import { CanvasSettingsBar } from "./CanvasSettingsBar";

interface FloorplanCanvasProps {
    rectangles: Rectangle[];
    setRectangles: (rectangles: Rectangle[]) => void;
    flooring?: Flooring | null;
}

export const FloorplanCanvas: FC<FloorplanCanvasProps> = ({
    rectangles,
    setRectangles,
    flooring,
}) => {
    const [fullscreen, setFullscreen] = useState(false);
    const [showControlsTooltip, setShowControlsTooltip] = useState(false);
    const [snapIsEnabled, setSnapIsEnabled] = useState(true);
    const [selectedTool, setSelectedTool] = useState<DrawingTool>(DrawingTool.Rectangle);
    const [lines, setLines] = useState<Line[]>([]);

    const {
        canvasRef,
        canvasContainerRef,
        fullscreenContainerRef,
        canvasDimensions,
        isPanning,
        hoveredItemForDeletion,
        handleMouseDown,
        handleMouseMove,
        handleMouseUp,
        handleWheel,
        zoom,
        setZoom,
        pan,
        setPan,
    } = useFloorplanCanvas({
        rectangles,
        setRectangles,
        lines,
        setLines,
        fullscreen,
        flooring,
        snapIsEnabled,
        setSnapIsEnabled,
        selectedTool,
    });

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && fullscreen) {
                setFullscreen(false);
                return;
            }
            if ((e.key === "z" || e.key === "Z") && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                if (selectedTool === DrawingTool.Rectangle && rectangles.length > 0) {
                    const newRectangles = [...rectangles];
                    newRectangles.pop();
                    setRectangles(newRectangles);
                } else if (selectedTool === DrawingTool.Line && lines.length > 0) {
                    const newLines = [...lines];
                    newLines.pop();
                    setLines(newLines);
                }
            }
        };
        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.key === "Alt" && isPanning) {
                setPan({ x: pan.x, y: pan.y });
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
        };
    }, [
        fullscreen,
        rectangles,
        setRectangles,
        lines,
        setLines,
        isPanning,
        setPan,
        pan.x,
        pan.y,
        selectedTool,
    ]);

    useEffect(() => {
        if (fullscreen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [fullscreen]);

    const resetZoom = () => {
        setZoom(1);
        setPan({ x: 0, y: 0 });
    };

    return (
        <div
            ref={fullscreenContainerRef}
            className={clsx(
                "flex flex-col space-y-4 h-full",
                fullscreen &&
                    "h-screen w-screen fixed inset-0 z-50 bg-white p-4 md:p-8 transition-all duration-300"
            )}>
            {" "}
            <CanvasSettingsBar
                zoom={zoom}
                resetZoom={resetZoom}
                showControlsTooltip={showControlsTooltip}
                setShowControlsTooltip={setShowControlsTooltip}
                snapEnabled={snapIsEnabled}
                setSnapEnabled={setSnapIsEnabled}
                selectedTool={selectedTool}
                setSelectedTool={setSelectedTool}
            />
            <div className="flex flex-col md:flex-row flex-1 h-0 min-h-0">
                <div ref={canvasContainerRef} className="relative min-h-[200px] w-full">
                    {/* Fullscreen Button */}
                    <div className="absolute top-2 right-2 z-10">
                        <PrimeButton
                            icon={fullscreen ? <CollapseIcon /> : <ExpandIcon />}
                            size="small"
                            className="p-2 border rounded bg-white hover:bg-gray-50 shadow-sm"
                            onClick={() => setFullscreen(f => !f)}
                            tooltip={fullscreen ? "Exit Fullscreen" : "Fullscreen"}
                        />
                    </div>
                    <canvas
                        ref={canvasRef}
                        width={canvasDimensions.width}
                        height={canvasDimensions.height}
                        className={clsx(
                            "w-full h-full border border-gray-200 rounded-md shadow-sm bg-white",
                            isPanning
                                ? "cursor-move"
                                : selectedTool === DrawingTool.Delete
                                  ? hoveredItemForDeletion
                                      ? "cursor-delete"
                                      : "cursor-default"
                                  : "cursor-crosshair",
                            fullscreen && "max-h-full max-w-full"
                        )}
                        onMouseEnter={() => {
                            const docElement = document.documentElement;
                            docElement.style.overflow = "hidden";
                        }}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={() => {
                            if (isPanning) {
                                setPan({ x: pan.x, y: pan.y });
                            }
                            const docElement = document.documentElement;
                            docElement.style.overflow = "";
                        }}
                        onWheel={handleWheel}
                    />
                </div>
            </div>
        </div>
    );
};
