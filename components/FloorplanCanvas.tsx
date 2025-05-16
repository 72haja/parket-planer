import React, { FC, useEffect, useState } from "react";
import clsx from "clsx";
import { Rectangle } from "@/lib/types";
import InfoTooltipButton from "./InfoTooltipButton";
import RectangleList from "./RectangleList";
import { useFloorplanCanvas } from "./useFloorplanCanvas";

interface FloorplanCanvasProps {
    rectangles: Rectangle[];
    setRectangles: (rectangles: Rectangle[]) => void;
}

const FloorplanCanvas: FC<FloorplanCanvasProps> = ({ rectangles, setRectangles }) => {
    const [fullscreen, setFullscreen] = useState(false);
    const [showControlsTooltip, setShowControlsTooltip] = useState(false);

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
    } = useFloorplanCanvas({ rectangles, setRectangles, fullscreen });

    // Keyboard shortcuts and scroll lock remain in the component
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
            <div className="flex items-center mb-2 justify-between">
                <div>
                    <span className="mr-2">Zoom: {(zoom * 100).toFixed(0)}%</span>
                    <button
                        onClick={resetZoom}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition-colors mr-2">
                        Reset View
                    </button>
                    <InfoTooltipButton
                        show={showControlsTooltip}
                        setShow={setShowControlsTooltip}
                    />
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
            <div
                className={clsx(
                    "flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-6",
                    "flex-1 h-0 min-h-0"
                )}>
                <div
                    ref={canvasContainerRef}
                    className={fullscreen ? "flex-1 flex items-center justify-center" : "flex-1"}
                    style={{ position: "relative", minHeight: 200 }}>
                    <canvas
                        ref={canvasRef}
                        width={canvasDimensions.width}
                        height={canvasDimensions.height}
                        className={clsx(
                            "w-full h-full border border-gray-200 rounded-md shadow-sm bg-white",
                            isPanning ? "cursor-move" : "cursor-crosshair",
                            fullscreen && "max-h-full max-w-full"
                        )}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={() => {
                            if (isPanning) {
                                setPan({ x: pan.x, y: pan.y });
                            }
                            // No need to call setIsDrawing/setStartPos here, as these are now internal to the hook
                            // The hook will handle cleanup/redraw as needed
                        }}
                        onWheel={handleWheel}
                    />
                </div>
                <div className={fullscreen ? "w-full md:w-96 max-w-xs" : "w-full md:w-72"}>
                    <RectangleList
                        rectangles={rectangles}
                        onDeleteRectangle={id => {
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

export default FloorplanCanvas;
