import { useEffect, useState } from "react";
import type { FC } from "react";
import clsx from "clsx";
import { useFloorplanCanvas } from "@/lib/hooks/useFloorplanCanvas";
import type { Flooring } from "@/lib/supabase";
import { Rectangle } from "@/lib/types";
import { CanvasSettingsBar } from "./CanvasSettingsBar";
import { RectangleList } from "./RectangleList";

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

    const {
        canvasRef,
        canvasContainerRef,
        fullscreenContainerRef,
        canvasDimensions,
        isPanning,
        hoveredRectangleId,
        setHoveredRectangleId,
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
        fullscreen,
        flooring,
        snapIsEnabled,
        setSnapIsEnabled,
    });

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && fullscreen) {
                setFullscreen(false);
                return;
            }
            if ((e.key === "z" || e.key === "Z") && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                if (rectangles.length > 0) {
                    const newRectangles = [...rectangles];
                    newRectangles.pop();
                    setRectangles(newRectangles);
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
    }, [fullscreen, rectangles, setRectangles, isPanning, setPan, pan.x, pan.y]);

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
            <CanvasSettingsBar
                zoom={zoom}
                resetZoom={resetZoom}
                showControlsTooltip={showControlsTooltip}
                setShowControlsTooltip={setShowControlsTooltip}
                fullscreen={fullscreen}
                setFullscreen={setFullscreen}
                snapEnabled={snapIsEnabled}
                setSnapEnabled={setSnapIsEnabled}
            />
            <div
                className={clsx(
                    "flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-6",
                    "flex-1 h-0 min-h-0"
                )}>
                <div ref={canvasContainerRef} style={{ position: "relative", minHeight: 200 }}>
                    <canvas
                        ref={canvasRef}
                        width={canvasDimensions.width}
                        height={canvasDimensions.height}
                        className={clsx(
                            "w-full h-full border border-gray-200 rounded-md shadow-sm bg-white",
                            isPanning ? "cursor-move" : "cursor-crosshair",
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
                <div className={fullscreen ? "w-full md:w-96 max-w-xs" : "w-full md:w-72"}>
                    <RectangleList
                        rectangles={rectangles}
                        onDeleteRectangle={(id: string) => {
                            const newRectangles = rectangles.filter(rect => rect.id !== id);
                            setRectangles(newRectangles);
                        }}
                        setHoveredRectangleId={setHoveredRectangleId}
                        hoveredRectangleId={hoveredRectangleId}
                    />
                </div>
            </div>
        </div>
    );
};
