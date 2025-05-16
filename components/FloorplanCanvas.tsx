import React, { useCallback, useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { v4 as uuid } from "uuid";
import { Rectangle } from "@/lib/types";
import RectangleList from "./RectangleList";

interface FloorplanCanvasProps {
    rectangles: Rectangle[];
    setRectangles: (rectangles: Rectangle[]) => void;
}

const FloorplanCanvas: React.FC<FloorplanCanvasProps> = ({ rectangles, setRectangles }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [isPanning, setIsPanning] = useState(false);
    const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);
    const [lastPanPos, setLastPanPos] = useState<{ x: number; y: number } | null>(null);
    const [zoom, setZoom] = useState(1); // Zoom level, 1 = 100%
    const [pan, setPan] = useState({ x: 0, y: 0 }); // For panning implementation
    const [hoveredRectangleId, setHoveredRectangleId] = useState<string | null>(null);
    const [fullscreen, setFullscreen] = useState(false);
    const fullscreenContainerRef = useRef<HTMLDivElement>(null);
    const [showControlsTooltip, setShowControlsTooltip] = useState(false);

    // Handle keyboard shortcuts and key states
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Handle Escape key for fullscreen
            if (e.key === "Escape" && fullscreen) {
                setFullscreen(false);
                return;
            }

            // Handle Cmd+Z (Mac) or Ctrl+Z (Windows/Linux) to undo last rectangle
            if ((e.key === "z" || e.key === "Z") && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                // Remove the last added rectangle
                if (rectangles.length > 0) {
                    const newRectangles = [...rectangles];
                    newRectangles.pop(); // Remove the last element
                    setRectangles(newRectangles);
                }
            }
        };

        // Handle Alt/Option key release
        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.key === "Alt" && isPanning) {
                setIsPanning(false);
                setLastPanPos(null);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
        };
    }, [fullscreen, rectangles, setRectangles, isPanning]);

    // Scroll lock when fullscreen
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

    // Helper function to draw a rectangle with consistent label placement
    const drawRectangleWithLabels = (
        ctx: CanvasRenderingContext2D,
        x: number,
        y: number,
        width: number,
        height: number,
        isHighlighted: boolean = false
    ) => {
        // Calculate normalized coordinates for drawing
        const normalizedX = width < 0 ? x + width : x;
        const normalizedY = height < 0 ? y + height : y;
        const normalizedWidth = Math.abs(width);
        const normalizedHeight = Math.abs(height);

        // Draw rectangle
        if (isHighlighted) {
            ctx.strokeStyle = "#3b82f6"; // Blue highlight color
            ctx.lineWidth = 2;

            // Draw a semi-transparent fill for the highlighted rectangle
            ctx.fillStyle = "rgba(59, 130, 246, 0.1)";
            ctx.fillRect(x, y, width, height);
        } else {
            ctx.strokeStyle = "black";
            ctx.lineWidth = 1;
        }

        ctx.strokeRect(x, y, width, height);

        // Draw width text at top of rectangle
        ctx.font = "12px Arial";
        ctx.fillStyle = isHighlighted ? "#3b82f6" : "black";
        ctx.textAlign = "center";
        ctx.fillText(
            `${normalizedWidth.toFixed(0)}px`,
            normalizedX + normalizedWidth / 2,
            normalizedY - 5
        );

        // Draw height text to the left of rectangle
        ctx.save();
        ctx.translate(normalizedX - 5, normalizedY + normalizedHeight / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.textAlign = "center";
        ctx.fillText(`${normalizedHeight.toFixed(0)}px`, 0, 0);
        ctx.restore();

        // Reset line width
        ctx.lineWidth = 1;
    };

    // Function to redraw the canvas with current zoom level
    const redrawCanvas = useCallback(() => {
        if (!canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        if (ctx) {
            // Clear the canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Save context state
            ctx.save();

            // Apply zoom transformation (from center)
            ctx.translate(pan.x, pan.y);
            ctx.scale(zoom, zoom);

            // Draw all rectangles with the current zoom level
            rectangles.forEach(rect => {
                const isHighlighted = rect.id === hoveredRectangleId;
                drawRectangleWithLabels(
                    ctx,
                    rect.x,
                    rect.y,
                    rect.width,
                    rect.height,
                    isHighlighted
                );
            });

            // Restore context to original state
            ctx.restore();
        }
    }, [rectangles, zoom, pan, hoveredRectangleId]);

    // Handle zooming with mouse wheel
    const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
        e.preventDefault();

        if (!canvasRef.current) return;
        const canvas = canvasRef.current;

        // Get the mouse position relative to the canvas
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // Convert mouse position to world coordinates before zoom
        const worldX = ((mouseX * canvas.width) / rect.width - pan.x) / zoom;
        const worldY = ((mouseY * canvas.height) / rect.height - pan.y) / zoom;

        // Calculate zoom delta based on wheel direction
        const delta = -e.deltaY * 0.001; // Adjust sensitivity as needed
        const newZoom = Math.max(0.1, Math.min(5, zoom + delta)); // Limit zoom between 10% and 500%

        // Calculate new pan position to zoom at the mouse position
        const newPanX = -worldX * newZoom + (mouseX * canvas.width) / rect.width;
        const newPanY = -worldY * newZoom + (mouseY * canvas.height) / rect.height;

        setZoom(newZoom);
        setPan({ x: newPanX, y: newPanY });
    };

    // Redraw canvas whenever rectangles array, zoom, pan or hoveredRectangleId changes
    useEffect(() => {
        redrawCanvas();
    }, [redrawCanvas]);

    // Convert screen coordinates to canvas coordinates considering zoom
    const screenToCanvasCoords = (clientX: number, clientY: number, canvas: HTMLCanvasElement) => {
        const rect = canvas.getBoundingClientRect();

        // Calculate scaling factor between canvas display size and internal size
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        // Calculate coordinates in canvas space
        const x = ((clientX - rect.left) * scaleX - pan.x) / zoom;
        const y = ((clientY - rect.top) * scaleY - pan.y) / zoom;

        return { x, y };
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Check if Option/Alt key is pressed for panning
        if (e.altKey) {
            setIsPanning(true);
            setLastPanPos({ x: e.clientX, y: e.clientY });
            return;
        }

        // Regular drawing behavior
        const position = screenToCanvasCoords(e.clientX, e.clientY, canvas);
        setIsDrawing(true);
        setStartPos(position);
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Handle panning
        if (isPanning && lastPanPos) {
            const dx = e.clientX - lastPanPos.x;
            const dy = e.clientY - lastPanPos.y;

            setPan(prevPan => ({
                x: prevPan.x + dx,
                y: prevPan.y + dy,
            }));

            setLastPanPos({ x: e.clientX, y: e.clientY });
            return;
        }

        // Handle drawing
        if (!isDrawing || !startPos) return;

        const currentPos = screenToCanvasCoords(e.clientX, e.clientY, canvas);
        const ctx = canvas.getContext("2d");

        if (ctx) {
            // Redraw the canvas
            redrawCanvas();

            // Draw the rectangle being currently created
            ctx.save();
            ctx.translate(pan.x, pan.y);
            ctx.scale(zoom, zoom);

            const width = currentPos.x - startPos.x;
            const height = currentPos.y - startPos.y;

            drawRectangleWithLabels(ctx, startPos.x, startPos.y, width, height);
            ctx.restore();
        }
    };

    const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
        // Handle end of panning
        if (isPanning) {
            setIsPanning(false);
            setLastPanPos(null);
            return;
        }

        // Handle end of drawing
        if (!isDrawing || !startPos || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const endPos = screenToCanvasCoords(e.clientX, e.clientY, canvas);

        const width = endPos.x - startPos.x;
        const height = endPos.y - startPos.y;

        // Only add rectangle if width and height are both greater than 0
        if (Math.abs(width) > 0 && Math.abs(height) > 0) {
            const newRectangle: Rectangle = {
                id: uuid(),
                x: startPos.x,
                y: startPos.y,
                width,
                height,
            };
            const newRectangles = [...rectangles, newRectangle];
            setRectangles(newRectangles);
        } else {
            redrawCanvas();
        }
        setIsDrawing(false);
        setStartPos(null);
    };

    const handleDeleteRectangle = (id: string) => {
        const newRectangles = rectangles.filter(rect => rect.id !== id);
        setRectangles(newRectangles);
    };

    // Function to reset zoom
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
                    <div className="relative inline-block">
                        <button
                            onMouseEnter={() => setShowControlsTooltip(true)}
                            onMouseLeave={() => setShowControlsTooltip(false)}
                            className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700"
                            aria-label="Canvas controls information">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                        </button>
                        {showControlsTooltip && (
                            <div className="absolute left-0 bottom-full mb-2 p-3 w-64 bg-white rounded shadow-lg z-10 text-xs">
                                <h3 className="font-semibold text-sm mb-1">Canvas Controls:</h3>
                                <ul className="space-y-1">
                                    <li>
                                        <span className="font-medium">Draw:</span> Click and drag
                                    </li>
                                    <li>
                                        <span className="font-medium">Pan:</span> Hold Option/Alt +
                                        drag
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
                    // fullscreen && "flex-1 h-0 min-h-0"
                    "flex-1 h-0 min-h-0"
                )}>
                <div className={fullscreen ? "flex-1 flex items-center justify-center" : "flex-1"}>
                    <canvas
                        ref={canvasRef}
                        width={fullscreen ? window.innerWidth - 400 : 800}
                        height={window.innerHeight - 100}
                        className={clsx(
                            "w-full h-full border border-gray-200 rounded-md shadow-sm bg-white",
                            isPanning ? "cursor-move" : "cursor-crosshair",
                            fullscreen && "max-h-full max-w-full"
                        )}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={() => {
                            // Clean up if mouse leaves the canvas
                            if (isPanning) {
                                setIsPanning(false);
                                setLastPanPos(null);
                            }
                            if (isDrawing) {
                                setIsDrawing(false);
                                setStartPos(null);
                                redrawCanvas();
                            }
                        }}
                        onWheel={handleWheel}
                    />
                </div>
                <div className={fullscreen ? "w-full md:w-96 max-w-xs" : "w-full md:w-72"}>
                    <RectangleList
                        rectangles={rectangles}
                        onDeleteRectangle={handleDeleteRectangle}
                        setHoveredRectangleId={setHoveredRectangleId}
                        hoveredRectangleId={hoveredRectangleId}
                    />
                </div>
            </div>
        </div>
    );
};

export default FloorplanCanvas;
