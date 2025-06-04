import { MouseEvent, WheelEvent, useCallback, useEffect, useRef, useState } from "react";
import { v4 as uuid } from "uuid";
import type { Flooring } from "@/lib/supabase";
import { DrawingTool, Line, Rectangle } from "@/lib/types";

interface UseFloorplanCanvasProps {
    rectangles: Rectangle[];
    setRectangles: (rectangles: Rectangle[]) => void;
    lines: Line[];
    setLines: (lines: Line[]) => void;
    fullscreen: boolean;
    flooring?: Flooring | null;
    snapIsEnabled: boolean;
    setSnapIsEnabled: (enabled: boolean) => void;
    selectedTool: DrawingTool;
}

export function useFloorplanCanvas({
    rectangles,
    setRectangles,
    lines,
    setLines,
    fullscreen,
    flooring,
    snapIsEnabled,
    setSnapIsEnabled,
    selectedTool,
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
    const [hoveredItemForDeletion, setHoveredItemForDeletion] = useState<{
        type: "rectangle" | "line";
        id: string;
    } | null>(null);

    // Track flooring drag state
    const [isDraggingFlooring, setIsDraggingFlooring] = useState(false);
    const [flooringDragStart, setFlooringDragStart] = useState<{ x: number; y: number } | null>(
        null
    );
    const [flooringStartPos, setFlooringStartPos] = useState<{ x: number; y: number } | null>(null);

    // Snap point state
    const [snapPoint, setSnapPoint] = useState<{ x: number; y: number } | null>(null);

    // Extension line guide state
    const [extensionGuide, setExtensionGuide] = useState<{
        x1: number;
        y1: number;
        x2: number;
        y2: number;
        isActive: boolean;
    } | null>(null);

    // Store the last preview end position for stable preview rendering
    const [previewEnd, setPreviewEnd] = useState<{ x: number; y: number } | null>(null);

    // Dynamically set canvas size to match container using ResizeObserver
    useEffect(() => {
        let observer: ResizeObserver | null = null;
        const updateCanvasSize = () => {
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
        };
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
        isHighlighted: boolean = false,
        isDeleteMode: boolean = false
    ) => {
        const normalizedX = width < 0 ? x + width : x;
        const normalizedY = height < 0 ? y + height : y;
        const normalizedWidth = Math.abs(width);
        const normalizedHeight = Math.abs(height);
        if (isHighlighted) {
            if (isDeleteMode) {
                ctx.strokeStyle = "#ef4444";
                ctx.lineWidth = 2;
                ctx.fillStyle = "rgba(239, 68, 68, 0.1)";
                ctx.fillRect(x, y, width, height);
            } else {
                ctx.strokeStyle = "#3b82f6";
                ctx.lineWidth = 2;
                ctx.fillStyle = "rgba(59, 130, 246, 0.1)";
                ctx.fillRect(x, y, width, height);
            }
        } else {
            ctx.strokeStyle = "black";
            ctx.lineWidth = 1;
        }
        ctx.strokeRect(x, y, width, height);
        ctx.font = "12px Arial";
        ctx.fillStyle = isHighlighted ? (isDeleteMode ? "#ef4444" : "#3b82f6") : "black";
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

    // Helper function to draw a line with labels
    const drawLineWithLabels = (
        ctx: CanvasRenderingContext2D,
        x1: number,
        y1: number,
        x2: number,
        y2: number,
        isHighlighted: boolean = false,
        isDeleteMode: boolean = false
    ) => {
        // Calculate length of line
        const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));

        // Set styles based on highlight status
        if (isHighlighted) {
            if (isDeleteMode) {
                ctx.strokeStyle = "#ef4444";
                ctx.lineWidth = 2;
            } else {
                ctx.strokeStyle = "#3b82f6";
                ctx.lineWidth = 2;
            }
        } else {
            ctx.strokeStyle = "black";
            ctx.lineWidth = 1;
        }

        // Draw the line
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        // Add length label
        ctx.font = "12px Arial";
        ctx.fillStyle = isHighlighted ? (isDeleteMode ? "#ef4444" : "#3b82f6") : "black";

        // Position the label slightly above the middle of the line
        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2;

        // Calculate the angle of the line
        const angle = Math.atan2(y2 - y1, x2 - x1);

        // Draw the text rotated to match the line angle
        ctx.save();
        ctx.translate(midX, midY);
        ctx.rotate(angle);
        ctx.translate(0, -10); // Offset above the line
        ctx.textAlign = "center";
        ctx.fillText(`${length.toFixed(0)}px`, 0, 0);
        ctx.restore();
    };

    // Helper to draw the flooring pattern
    const drawFlooringPattern = useCallback(
        (ctx: CanvasRenderingContext2D, flooring: Flooring, width: number, height: number) => {
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
        },
        [zoom]
    );

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

            // Draw rectangles
            rectangles.forEach(rect => {
                const isHighlighted = false;
                const isDeleteMode = selectedTool === DrawingTool.Delete;
                drawRectangleWithLabels(
                    ctx,
                    rect.x,
                    rect.y,
                    rect.width,
                    rect.height,
                    isHighlighted,
                    isDeleteMode
                );
            });

            // Draw lines
            lines.forEach(line => {
                const isHighlighted = false;
                const isDeleteMode = selectedTool === DrawingTool.Delete;
                drawLineWithLabels(
                    ctx,
                    line.x1,
                    line.y1,
                    line.x2,
                    line.y2,
                    isHighlighted,
                    isDeleteMode
                );
            });

            // Draw snap point if present
            if (snapPoint) {
                ctx.save();
                ctx.beginPath();
                ctx.arc(snapPoint.x, snapPoint.y, 6, 0, 2 * Math.PI);
                ctx.fillStyle = "#f59e42";
                ctx.strokeStyle = "#b45309";
                ctx.lineWidth = 2;
                ctx.shadowColor = "#fff";
                ctx.shadowBlur = 2;
                ctx.fill();
                ctx.stroke();
                ctx.restore();
            }

            // Draw extension guide if present
            if (extensionGuide && extensionGuide.isActive) {
                drawExtensionGuide(
                    ctx,
                    extensionGuide.x1,
                    extensionGuide.y1,
                    extensionGuide.x2,
                    extensionGuide.y2
                );
            }

            // Draw preview based on the selected tool
            if (isDrawing && startPos && previewEnd) {
                ctx.save();
                if (selectedTool === DrawingTool.Rectangle) {
                    const width = previewEnd.x - startPos.x;
                    const height = previewEnd.y - startPos.y;
                    drawRectangleWithLabels(
                        ctx,
                        startPos.x,
                        startPos.y,
                        width,
                        height,
                        false,
                        false
                    );
                } else if (selectedTool === DrawingTool.Line) {
                    drawLineWithLabels(
                        ctx,
                        startPos.x,
                        startPos.y,
                        previewEnd.x,
                        previewEnd.y,
                        false,
                        false
                    );
                }
                ctx.restore();
            }
            ctx.restore();
        }
    }, [
        rectangles,
        lines,
        zoom,
        pan,
        flooring,
        snapPoint,
        extensionGuide,
        drawFlooringPattern,
        isDrawing,
        startPos,
        previewEnd,
        selectedTool,
    ]);

    // Redraw on changes
    useEffect(() => {
        redrawCanvas();
    }, [redrawCanvas, canvasDimensions]);

    // Helper function to calculate distance from point to line
    const distanceFromPointToLine = (
        point: { x: number; y: number },
        lineStart: { x: number; y: number },
        lineEnd: { x: number; y: number }
    ): number => {
        const A = point.x - lineStart.x;
        const B = point.y - lineStart.y;
        const C = lineEnd.x - lineStart.x;
        const D = lineEnd.y - lineStart.y;

        const dot = A * C + B * D;
        const lengthSq = C * C + D * D;

        if (lengthSq === 0) {
            return Math.hypot(A, B);
        }

        const param = dot / lengthSq;
        const xx = lineStart.x + param * C;
        const yy = lineStart.y + param * D;

        const dx = point.x - xx;
        const dy = point.y - yy;
        return Math.hypot(dx, dy);
    };

    // Helper function to find extension line guides from rectangles
    const findExtensionLineGuide = (
        mousePos: { x: number; y: number },
        canvasWidth: number,
        canvasHeight: number
    ): {
        x1: number;
        y1: number;
        x2: number;
        y2: number;
        distance: number;
    } | null => {
        const SNAP_TOLERANCE = 10;
        let closestGuide: {
            x1: number;
            y1: number;
            x2: number;
            y2: number;
            distance: number;
        } | null = null;
        let minDistance = Infinity;

        rectangles.forEach(rect => {
            // Calculate normalized rectangle bounds
            const normalizedX = rect.width < 0 ? rect.x + rect.width : rect.x;
            const normalizedY = rect.height < 0 ? rect.y + rect.height : rect.y;
            const normalizedWidth = Math.abs(rect.width);
            const normalizedHeight = Math.abs(rect.height);

            // Define the four edges of the rectangle
            const edges = [
                // Top edge
                {
                    start: { x: normalizedX, y: normalizedY },
                    end: { x: normalizedX + normalizedWidth, y: normalizedY },
                    isHorizontal: true
                },
                // Right edge
                {
                    start: { x: normalizedX + normalizedWidth, y: normalizedY },
                    end: { x: normalizedX + normalizedWidth, y: normalizedY + normalizedHeight },
                    isHorizontal: false
                },
                // Bottom edge
                {
                    start: { x: normalizedX + normalizedWidth, y: normalizedY + normalizedHeight },
                    end: { x: normalizedX, y: normalizedY + normalizedHeight },
                    isHorizontal: true
                },
                // Left edge
                {
                    start: { x: normalizedX, y: normalizedY + normalizedHeight },
                    end: { x: normalizedX, y: normalizedY },
                    isHorizontal: false
                }
            ];

            edges.forEach(edge => {
                let extendedLine: { x1: number; y1: number; x2: number; y2: number };

                if (edge.isHorizontal) {
                    // Horizontal line - extend left and right across canvas
                    const y = edge.start.y;
                    extendedLine = {
                        x1: -canvasWidth / zoom,
                        y1: y,
                        x2: canvasWidth / zoom,
                        y2: y
                    };
                } else {
                    // Vertical line - extend up and down across canvas
                    const x = edge.start.x;
                    extendedLine = {
                        x1: x,
                        y1: -canvasHeight / zoom,
                        x2: x,
                        y2: canvasHeight / zoom
                    };
                }

                // Calculate distance from mouse to this extended line
                const distance = distanceFromPointToLine(
                    mousePos,
                    { x: extendedLine.x1, y: extendedLine.y1 },
                    { x: extendedLine.x2, y: extendedLine.y2 }
                );

                if (distance <= SNAP_TOLERANCE && distance < minDistance) {
                    minDistance = distance;
                    closestGuide = {
                        ...extendedLine,
                        distance
                    };
                }
            });
        });

        return closestGuide;
    };

    // Helper function to draw dotted extension guide line
    const drawExtensionGuide = (
        ctx: CanvasRenderingContext2D,
        x1: number,
        y1: number,
        x2: number,
        y2: number
    ) => {
        ctx.save();
        ctx.strokeStyle = "#10b981";
        ctx.lineWidth = 1.5;
        ctx.setLineDash([5, 5]); // 5 pixels on, 5 pixels off
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.setLineDash([]); // Reset line dash
        ctx.restore();
    };

    // Convert screen coordinates to canvas coordinates considering zoom
    const screenToCanvasCoords = (clientX: number, clientY: number, canvas: HTMLCanvasElement) => {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const x = ((clientX - rect.left) * scaleX - pan.x) / zoom;
        const y = ((clientY - rect.top) * scaleY - pan.y) / zoom;
        return { x, y };
    };

    // Collision detection helpers
    const isPointInRectangle = (point: { x: number; y: number }, rect: Rectangle): boolean => {
        const normalizedX = rect.width < 0 ? rect.x + rect.width : rect.x;
        const normalizedY = rect.height < 0 ? rect.y + rect.height : rect.y;
        const normalizedWidth = Math.abs(rect.width);
        const normalizedHeight = Math.abs(rect.height);

        return (
            point.x >= normalizedX &&
            point.x <= normalizedX + normalizedWidth &&
            point.y >= normalizedY &&
            point.y <= normalizedY + normalizedHeight
        );
    };

    const isPointNearLine = (
        point: { x: number; y: number },
        line: Line,
        threshold: number = 5
    ): boolean => {
        const A = point.x - line.x1;
        const B = point.y - line.y1;
        const C = line.x2 - line.x1;
        const D = line.y2 - line.y1;

        const dot = A * C + B * D;
        const lengthSq = C * C + D * D;

        if (lengthSq === 0) {
            return Math.hypot(A, B) <= threshold;
        }

        const param = dot / lengthSq;

        let xx, yy;
        if (param < 0) {
            xx = line.x1;
            yy = line.y1;
        } else if (param > 1) {
            xx = line.x2;
            yy = line.y2;
        } else {
            xx = line.x1 + param * C;
            yy = line.y1 + param * D;
        }

        const dx = point.x - xx;
        const dy = point.y - yy;
        return Math.hypot(dx, dy) <= threshold;
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

        // Handle delete mode clicks
        if (selectedTool === DrawingTool.Delete && hoveredItemForDeletion) {
            if (hoveredItemForDeletion.type === "rectangle") {
                const newRectangles = rectangles.filter(
                    rect => rect.id !== hoveredItemForDeletion.id
                );
                setRectangles(newRectangles);
            } else if (hoveredItemForDeletion.type === "line") {
                const newLines = lines.filter(line => line.id !== hoveredItemForDeletion.id);
                setLines(newLines);
            }
            setHoveredItemForDeletion(null);
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
        // Use snapPoint as start position if present and snapping is enabled
        let position;
        if (snapIsEnabled && snapPoint) {
            position = { ...snapPoint };
        } else {
            position = screenToCanvasCoords(e.clientX, e.clientY, canvas);
        }
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
        // Snap point logic (snap to nearest point on any side, not just center)
        let snapActive = false;
        let nearest: { x: number; y: number } | null = null;
        let minDist = Infinity;
        const mousePos = screenToCanvasCoords(e.clientX, e.clientY, canvas);

        // Update extension guide based on mouse position
        if (snapIsEnabled) {
            const guide = findExtensionLineGuide(mousePos, canvas.width, canvas.height);
            if (guide) {
                setExtensionGuide({
                    x1: guide.x1,
                    y1: guide.y1,
                    x2: guide.x2,
                    y2: guide.y2,
                    isActive: true
                });
            } else {
                setExtensionGuide(null);
            }
        } else {
            setExtensionGuide(null);
        }

        if (snapIsEnabled) {
            // Snap to rectangle corners and sides
            rectangles.forEach(rect => {
                const corners = [
                    { x: rect.x, y: rect.y },
                    { x: rect.x + rect.width, y: rect.y },
                    { x: rect.x + rect.width, y: rect.y + rect.height },
                    { x: rect.x, y: rect.y + rect.height },
                ];
                // Sides: [top, right, bottom, left]
                const sides = [
                    [corners[0], corners[1]], // top
                    [corners[1], corners[2]], // right
                    [corners[2], corners[3]], // bottom
                    [corners[3], corners[0]], // left
                ];
                sides.forEach(([a, b]) => {
                    if (!a || !b) return;
                    // Project mousePos onto segment ab
                    const abx = b.x - a.x;
                    const aby = b.y - a.y;
                    const apx = mousePos.x - a.x;
                    const apy = mousePos.y - a.y;
                    const abLenSq = abx * abx + aby * aby;
                    let t = abLenSq === 0 ? 0 : (apx * abx + apy * aby) / abLenSq;
                    t = Math.max(0, Math.min(1, t));
                    const proj = { x: a.x + t * abx, y: a.y + t * aby };
                    const dist = Math.hypot(proj.x - mousePos.x, proj.y - mousePos.y);
                    if (dist < minDist) {
                        minDist = dist;
                        nearest = proj;
                    }
                });
            });

            // Snap to line endpoints
            lines.forEach(line => {
                const endpoints = [
                    { x: line.x1, y: line.y1 },
                    { x: line.x2, y: line.y2 },
                ];

                endpoints.forEach(point => {
                    const dist = Math.hypot(point.x - mousePos.x, point.y - mousePos.y);
                    if (dist < minDist) {
                        minDist = dist;
                        nearest = point;
                    }
                });

                // Also snap to points along the line
                const a = { x: line.x1, y: line.y1 };
                const b = { x: line.x2, y: line.y2 };
                const abx = b.x - a.x;
                const aby = b.y - a.y;
                const apx = mousePos.x - a.x;
                const apy = mousePos.y - a.y;
                const abLenSq = abx * abx + aby * aby;
                let t = abLenSq === 0 ? 0 : (apx * abx + apy * aby) / abLenSq;
                t = Math.max(0, Math.min(1, t));
                const proj = { x: a.x + t * abx, y: a.y + t * aby };
                const dist = Math.hypot(proj.x - mousePos.x, proj.y - mousePos.y);
                if (dist < minDist) {
                    minDist = dist;
                    nearest = proj;
                }
            });

            // Also snap to points along the extension guide if it's active
            if (extensionGuide && extensionGuide.isActive) {
                const guideStart = { x: extensionGuide.x1, y: extensionGuide.y1 };
                const guideEnd = { x: extensionGuide.x2, y: extensionGuide.y2 };
                
                // Project mouse position onto the extension guide line
                const abx = guideEnd.x - guideStart.x;
                const aby = guideEnd.y - guideStart.y;
                const apx = mousePos.x - guideStart.x;
                const apy = mousePos.y - guideStart.y;
                const abLenSq = abx * abx + aby * aby;
                
                if (abLenSq > 0) {
                    const t = (apx * abx + apy * aby) / abLenSq;
                    // Don't clamp t - allow snapping anywhere along the infinite extension line
                    const proj = { x: guideStart.x + t * abx, y: guideStart.y + t * aby };
                    const dist = Math.hypot(proj.x - mousePos.x, proj.y - mousePos.y);
                    
                    if (dist < minDist) {
                        minDist = dist;
                        nearest = proj;
                    }
                }
            }

            if (nearest && minDist < 20) {
                setSnapPoint(nearest);
                snapActive = true;
            } else {
                setSnapPoint(null);
            }
        } else {
            setSnapPoint(null);
        }

        // Handle delete mode - check for hovering over rectangles/lines
        if (selectedTool === DrawingTool.Delete) {
            const mousePos = screenToCanvasCoords(e.clientX, e.clientY, canvas);
            let foundHoveredItem: { type: "rectangle" | "line"; id: string } | null = null;

            // Check rectangles first
            for (const rect of rectangles) {
                if (isPointInRectangle(mousePos, rect)) {
                    foundHoveredItem = { type: "rectangle", id: rect.id };
                    break;
                }
            }

            // If no rectangle found, check lines
            if (!foundHoveredItem) {
                for (const line of lines) {
                    if (isPointNearLine(mousePos, line, 10)) {
                        foundHoveredItem = { type: "line", id: line.id };
                        break;
                    }
                }
            }

            setHoveredItemForDeletion(foundHoveredItem);
        }

        // Drawing preview: use local nearest if snapping, else mouse
        if (!isDrawing || !startPos) {
            setPreviewEnd(null);
            return;
        }

        let currentPos;
        if (snapIsEnabled && snapActive && nearest) {
            currentPos = nearest;
        } else {
            currentPos = mousePos;
        }
        setPreviewEnd(currentPos);
    };

    const handleMouseUp = (e: MouseEvent<HTMLCanvasElement>) => {
        if (isDraggingFlooring) {
            setIsDraggingFlooring(false);
            setFlooringDragStart(null);
            setFlooringStartPos(null);
            setPreviewEnd(null);
            return;
        }
        if (isPanning) {
            setIsPanning(false);
            setLastPanPos(null);
            setPreviewEnd(null);
            return;
        }
        if (!isDrawing || !startPos || !canvasRef.current) {
            setPreviewEnd(null);
            return;
        }

        const canvas = canvasRef.current;
        // Use snapPoint as end position if present and snapping is enabled
        let endPos;
        if (snapIsEnabled && snapPoint) {
            endPos = { ...snapPoint };
        } else {
            endPos = screenToCanvasCoords(e.clientX, e.clientY, canvas);
        }

        if (selectedTool === DrawingTool.Rectangle) {
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
                setRectangles([...rectangles, newRectangle]);
            }
        } else if (selectedTool === DrawingTool.Line) {
            // Don't create lines that are too short
            const dx = endPos.x - startPos.x;
            const dy = endPos.y - startPos.y;
            const length = Math.sqrt(dx * dx + dy * dy);

            if (length > 5) {
                // Minimum length to avoid accidental clicks
                const newLine: Line = {
                    id: uuid(),
                    x1: startPos.x,
                    y1: startPos.y,
                    x2: endPos.x,
                    y2: endPos.y,
                };
                setLines([...lines, newLine]);
            }
        }

        setIsDrawing(false);
        setStartPos(null);
        setPreviewEnd(null);
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
        hoveredItemForDeletion,
        handleMouseDown,
        handleMouseMove,
        handleMouseUp,
        handleWheel,
        zoom,
        setZoom,
        pan,
        setPan,
        snapPoint,
        extensionGuide,
        snapIsEnabled,
        setSnapIsEnabled,
    };
}
