import React, { useEffect, useRef, useState } from "react";
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
    const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);
    const [zoom, setZoom] = useState(1); // Zoom level, 1 = 100%
    const [pan, setPan] = useState({ x: 0, y: 0 }); // For future panning implementation
    const [hoveredRectangleId, setHoveredRectangleId] = useState<string | null>(null);

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
    const redrawCanvas = () => {
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
            rectangles.forEach((rect) => {
                const isHighlighted = rect.id === hoveredRectangleId;
                drawRectangleWithLabels(ctx, rect.x, rect.y, rect.width, rect.height, isHighlighted);
            });

            // Restore context to original state
            ctx.restore();
        }
    };

    // Handle zooming with mouse wheel
    const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
        e.preventDefault();

        // Calculate zoom delta based on wheel direction
        const delta = -e.deltaY * 0.001; // Adjust sensitivity as needed
        const newZoom = Math.max(0.1, Math.min(5, zoom + delta)); // Limit zoom between 10% and 500%

        setZoom(newZoom);
    };

    // Redraw canvas whenever rectangles array, zoom, pan or hoveredRectangleId changes
    useEffect(() => {
        redrawCanvas();
    }, [rectangles, zoom, pan, hoveredRectangleId]);

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

        const position = screenToCanvasCoords(e.clientX, e.clientY, canvas);
        setIsDrawing(true);
        setStartPos(position);
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing || !startPos || !canvasRef.current) return;

        const canvas = canvasRef.current;
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
        if (!isDrawing || !startPos || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const endPos = screenToCanvasCoords(e.clientX, e.clientY, canvas);

        const newRectangle: Rectangle = {
            id: uuid(),
            x: startPos.x,
            y: startPos.y,
            width: endPos.x - startPos.x,
            height: endPos.y - startPos.y,
        };

        const newRectangles = [...rectangles, newRectangle];
        setRectangles(newRectangles);
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
        <div className="flex flex-col space-y-4">
            <div className="flex items-center mb-2">
                <span className="mr-2">Zoom: {(zoom * 100).toFixed(0)}%</span>
                <button
                    onClick={resetZoom}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition-colors">
                    Reset View
                </button>
            </div>
            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-6">
                <div className="flex-1">
                    <canvas
                        ref={canvasRef}
                        width={800}
                        height={600}
                        className="w-full border border-gray-200 rounded-md shadow-sm"
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onWheel={handleWheel}
                    />
                </div>
                <div className="w-full md:w-72">
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
