import React, { useEffect, useRef, useState } from "react";
import { IconUtils } from "primereact/utils";

interface Rectangle {
    id: number;
    x: number;
    y: number;
    width: number;
    height: number;
}

const FloorplanCanvas: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);
    const [rectangles, setRectangles] = useState<Rectangle[]>([]);

    // Helper function to draw a rectangle with consistent label placement
    const drawRectangleWithLabels = (
        ctx: CanvasRenderingContext2D,
        x: number,
        y: number,
        width: number,
        height: number
    ) => {
        // Calculate normalized coordinates for drawing
        const normalizedX = width < 0 ? x + width : x;
        const normalizedY = height < 0 ? y + height : y;
        const normalizedWidth = Math.abs(width);
        const normalizedHeight = Math.abs(height);

        // Draw rectangle
        ctx.strokeStyle = "black";
        ctx.strokeRect(x, y, width, height);

        // Draw width text at top of rectangle
        ctx.font = "12px Arial";
        ctx.fillStyle = "black";
        ctx.textAlign = "center";
        ctx.fillText(`${normalizedWidth}px`, normalizedX + normalizedWidth / 2, normalizedY - 5);

        // Draw height text to the left of rectangle
        ctx.save();
        ctx.translate(normalizedX - 5, normalizedY + normalizedHeight / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.textAlign = "center";
        ctx.fillText(`${normalizedHeight}px`, 0, 0);
        ctx.restore();
    };

    // Redraw canvas whenever rectangles array changes
    useEffect(() => {
        if (!canvasRef.current) return;

        const ctx = canvasRef.current.getContext("2d");
        if (ctx) {
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            rectangles.forEach(({ x, y, width, height }) => {
                drawRectangleWithLabels(ctx, x, y, width, height);
            });
        }
    }, [rectangles]);

    const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const rect = canvasRef.current?.getBoundingClientRect();
        if (rect) {
            setIsDrawing(true);
            setStartPos({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
            });
        }
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing || !startPos || !canvasRef.current) return;

        const rect = canvasRef.current.getBoundingClientRect();
        const ctx = canvasRef.current.getContext("2d");
        if (ctx) {
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

            // Draw existing rectangles
            rectangles.forEach(({ x, y, width, height }) => {
                drawRectangleWithLabels(ctx, x, y, width, height);
            });

            // Draw rectangle being created
            const currentPos = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
            };

            const width = currentPos.x - startPos.x;
            const height = currentPos.y - startPos.y;

            drawRectangleWithLabels(ctx, startPos.x, startPos.y, width, height);
        }
    };

    const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing || !startPos || !canvasRef.current) return;

        const rect = canvasRef.current.getBoundingClientRect();
        const endPos = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        };

        const newRectangle: Rectangle = {
            id: Date.now(),
            x: startPos.x,
            y: startPos.y,
            width: endPos.x - startPos.x,
            height: endPos.y - startPos.y,
        };

        setRectangles(prev => [...prev, newRectangle]);
        setIsDrawing(false);
        setStartPos(null);
    };

    const handleDeleteRectangle = (id: number) => {
        setRectangles(prev => prev.filter(rect => rect.id !== id));
    };

    return (
        <div style={{ display: "flex" }}>
            <div>
                <canvas
                    ref={canvasRef}
                    width={800}
                    height={600}
                    style={{ border: "1px solid black" }}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                />
            </div>
            <div style={{ marginLeft: "20px" }}>
                <h3>Rectangles</h3>
                <ul>
                    {rectangles.map(rect => (
                        <li key={rect.id}>
                            Rectangle {rect.id} - {Math.abs(rect.width)}×{Math.abs(rect.height)}px
                            <button onClick={() => handleDeleteRectangle(rect.id)}>
                                <i className="pi pi-times" style={{ fontSize: "1.5rem" }}></i>
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default FloorplanCanvas;
