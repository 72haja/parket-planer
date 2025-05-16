import { MouseEvent, WheelEvent, useCallback, useEffect, useRef, useState } from "react";
import { v4 as uuid } from "uuid";
import type { Flooring } from "@/lib/supabase";
import { Rectangle } from "@/lib/types";

interface UseFloorplanCanvasProps {
    rectangles: Rectangle[];
    setRectangles: (rectangles: Rectangle[]) => void;
    fullscreen: boolean;
    flooring?: Flooring | null;
}

export function useFloorplanCanvas({
    rectangles,
    setRectangles,
    fullscreen,
    flooring,
}: UseFloorplanCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const canvasContainerRef = useRef<HTMLDivElement>(null);
    const fullscreenContainerRef = useRef<HTMLDivElement>(null);
    const [canvasDimensions, setCanvasDimensions] = useState({ width: 800, height: 600 });
    const [isDrawing, setIsDrawing] = useState(false);
    const [isPanning, setIsPanning] = useState(false);
    const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);
    const [lastPanPos, setLastPanPos] = useState<{ x: number; y: number } | null>(null);
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [hoveredRectangleId, setHoveredRectangleId] = useState<string | null>(null);

    // Track flooring drag state
    const [isDraggingFlooring, setIsDraggingFlooring] = useState(false);
    const [flooringDragStart, setFlooringDragStart] = useState<{ x: number; y: number } | null>(
        null
    );
    const [flooringStartPos, setFlooringStartPos] = useState<{ x: number; y: number } | null>(null);

    // Dynamically set canvas size to match container using ResizeObserver
    useEffect(() => {
        let observer: ResizeObserver | null = null;
        function updateCanvasSize() {
            let container: HTMLDivElement | null = null;
            let width = 800;
            let height = 600;
            if (fullscreen && fullscreenContainerRef.current) {
                container = fullscreenContainerRef.current;
                const rect = container.getBoundingClientRect();
                const sidebarWidth = 384;
                const padding = 32 * 2;
                width = Math.floor(rect.width - sidebarWidth - padding);
                height = Math.floor(rect.height - padding);
            } else if (canvasContainerRef.current) {
                container = canvasContainerRef.current;
                const rect = container.getBoundingClientRect();
                width = Math.floor(rect.width);
                height = Math.floor(rect.height);
            }
            setCanvasDimensions({ width: Math.max(width, 200), height: Math.max(height, 200) });
        }
        // Observe the relevant container for size changes
        const container =
            fullscreen && fullscreenContainerRef.current
                ? fullscreenContainerRef.current
                : canvasContainerRef.current;
        if (container && typeof window !== "undefined" && "ResizeObserver" in window) {
            observer = new ResizeObserver(() => {
                updateCanvasSize();
            });
            observer.observe(container);
        }
        // Fallback: update on window resize
        window.addEventListener("resize", updateCanvasSize);
        // Initial update
        updateCanvasSize();
        return () => {
            if (observer && container) observer.unobserve(container);
            window.removeEventListener("resize", updateCanvasSize);
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
        const normalizedX = width < 0 ? x + width : x;
        const normalizedY = height < 0 ? y + height : y;
        const normalizedWidth = Math.abs(width);
        const normalizedHeight = Math.abs(height);
        if (isHighlighted) {
            ctx.strokeStyle = "#3b82f6";
            ctx.lineWidth = 2;
            ctx.fillStyle = "rgba(59, 130, 246, 0.1)";
            ctx.fillRect(x, y, width, height);
        } else {
            ctx.strokeStyle = "black";
            ctx.lineWidth = 1;
        }
        ctx.strokeRect(x, y, width, height);
        ctx.font = "12px Arial";
        ctx.fillStyle = isHighlighted ? "#3b82f6" : "black";
        ctx.textAlign = "center";
        ctx.fillText(
            `${normalizedWidth.toFixed(0)}px`,
            normalizedX + normalizedWidth / 2,
            normalizedY - 5
        );
        ctx.save();
        ctx.translate(normalizedX - 5, normalizedY + normalizedHeight / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.textAlign = "center";
        ctx.fillText(`${normalizedHeight.toFixed(0)}px`, 0, 0);
        ctx.restore();
        ctx.lineWidth = 1;
    };

    // Helper to draw the flooring pattern
    function drawFlooringPattern(
        ctx: CanvasRenderingContext2D,
        flooring: Flooring,
        width: number,
        height: number
    ) {
        const tileW = flooring.tileWidth;
        const tileH = flooring.tileHeight;
        const offset = flooring.offset || 0;
        const startX = flooring.position?.[0] || 0;
        const startY = flooring.position?.[1] || 0;
        ctx.save();
        ctx.globalAlpha = 0.15;
        ctx.strokeStyle = "#8b5cf6";
        ctx.lineWidth = 1;
        let row = 0;
        for (let y = startY; y < height / zoom; y += tileH, row++) {
            let rowOffset = 0;
            if (offset > 0 && offset < 1) {
                rowOffset = (row * tileW * offset) % tileW;
            } else if (offset === -1) {
                // Random offset for each row
                rowOffset = Math.random() * tileW;
            }
            for (let x = startX - rowOffset; x < width / zoom; x += tileW) {
                ctx.strokeRect(x, y, tileW, tileH);
            }
        }
        ctx.restore();
    }

    // Redraw the canvas
    const redrawCanvas = useCallback(() => {
        if (!canvasRef.current) {
            return;
        }
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.save();
            ctx.translate(pan.x, pan.y);
            ctx.scale(zoom, zoom);
            // Draw flooring pattern if present
            if (flooring) {
                drawFlooringPattern(ctx, flooring, canvas.width, canvas.height);
            }
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
            ctx.restore();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [rectangles, zoom, pan, hoveredRectangleId, canvasDimensions, flooring]);

    // Redraw on changes
    useEffect(() => {
        redrawCanvas();
    }, [redrawCanvas, canvasDimensions]);

    // Convert screen coordinates to canvas coordinates considering zoom
    const screenToCanvasCoords = (clientX: number, clientY: number, canvas: HTMLCanvasElement) => {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const x = ((clientX - rect.left) * scaleX - pan.x) / zoom;
        const y = ((clientY - rect.top) * scaleY - pan.y) / zoom;
        return { x, y };
    };

    // Mouse event handlers
    const handleMouseDown = (e: MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) {
            return;
        }
        // Always allow panning with Option/Alt key
        if (e.altKey) {
            setIsPanning(true);
            setLastPanPos({ x: e.clientX, y: e.clientY });
            return;
        }
        // If a flooring is selected, start dragging it
        if (flooring) {
            setIsDraggingFlooring(true);
            setFlooringDragStart({ x: e.clientX, y: e.clientY });
            setFlooringStartPos({
                x: flooring.position?.[0] || 0,
                y: flooring.position?.[1] || 0,
            });
            return;
        }
        const position = screenToCanvasCoords(e.clientX, e.clientY, canvas);
        setIsDrawing(true);
        setStartPos(position);
    };

    const handleMouseMove = (e: MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) {
            return;
        }
        if (isDraggingFlooring && flooring && flooringDragStart && flooringStartPos) {
            // Calculate delta in canvas coordinates
            const deltaX = (e.clientX - flooringDragStart.x) / zoom;
            const deltaY = (e.clientY - flooringDragStart.y) / zoom;
            // Update flooring position (mutate flooring object for live preview)
            flooring.position = [flooringStartPos.x + deltaX, flooringStartPos.y + deltaY];
            redrawCanvas();
            return;
        }
        if (isPanning && lastPanPos) {
            const dx = e.clientX - lastPanPos.x;
            const dy = e.clientY - lastPanPos.y;
            setPan(prevPan => ({ x: prevPan.x + dx, y: prevPan.y + dy }));
            setLastPanPos({ x: e.clientX, y: e.clientY });
            return;
        }
        if (!isDrawing || !startPos) {
            return;
        }
        const currentPos = screenToCanvasCoords(e.clientX, e.clientY, canvas);
        const ctx = canvas.getContext("2d");
        if (ctx) {
            redrawCanvas();
            ctx.save();
            ctx.translate(pan.x, pan.y);
            ctx.scale(zoom, zoom);
            const width = currentPos.x - startPos.x;
            const height = currentPos.y - startPos.y;
            drawRectangleWithLabels(ctx, startPos.x, startPos.y, width, height);
            ctx.restore();
        }
    };

    const handleMouseUp = (e: MouseEvent<HTMLCanvasElement>) => {
        if (isDraggingFlooring) {
            setIsDraggingFlooring(false);
            setFlooringDragStart(null);
            setFlooringStartPos(null);
            return;
        }
        if (isPanning) {
            setIsPanning(false);
            setLastPanPos(null);
            return;
        }
        if (!isDrawing || !startPos || !canvasRef.current) {
            return;
        }
        const canvas = canvasRef.current;
        const endPos = screenToCanvasCoords(e.clientX, e.clientY, canvas);
        const width = endPos.x - startPos.x;
        const height = endPos.y - startPos.y;
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

    const handleWheel = (e: WheelEvent<HTMLCanvasElement>) => {
        if (!canvasRef.current) {
            return;
        }
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const worldX = ((mouseX * canvas.width) / rect.width - pan.x) / zoom;
        const worldY = ((mouseY * canvas.height) / rect.height - pan.y) / zoom;
        const delta = -e.deltaY * 0.001;
        const newZoom = Math.max(0.1, Math.min(5, zoom + delta));
        const newPanX = -worldX * newZoom + (mouseX * canvas.width) / rect.width;
        const newPanY = -worldY * newZoom + (mouseY * canvas.height) / rect.height;
        setZoom(newZoom);
        setPan({ x: newPanX, y: newPanY });
    };

    return {
        canvasRef,
        canvasContainerRef,
        fullscreenContainerRef,
        canvasDimensions,
        isDrawing,
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
    };
}
