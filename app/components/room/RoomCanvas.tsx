import { FC, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { AddButton } from "@/app/components/room/AddButton";
import { useAddRecheckDialog } from "@/app/provider/AddRecheckDialogProvider";
import { useClick } from "@/app/provider/ClickProvider";
import { useRechtecke } from "@/app/provider/RechteckeProvider";
import { cn } from "@/lib/utils";
import { Dot, Rechteck, RechteckDistancesEdge, TooltipRechteck } from "@/types";

interface RoomCanvasProps {
    drawCanvasTrigger: number;
}

export const RoomCanvas: FC<RoomCanvasProps> = ({ drawCanvasTrigger }) => {
    const { rechtecke, setRechtecke, addRechteck } = useRechtecke();
    const { openDialog } = useAddRecheckDialog();
    const { setClickPosition } = useClick();

    const [canvasWidthIncrease, setCanvasWidthIncrease] = useState(0);
    const [redDot, setRedDot] = useState<Dot>({ x: null, y: null });
    const [blueDot, setBlueDot] = useState<Dot>({ x: null, y: null });
    const [tooltipRechteck, setTooltipRechteck] = useState<TooltipRechteck>({
        rechteck: null,
        x: 0,
        y: 0,
    });
    const dragRectangle = useRef<Rechteck | undefined>(undefined);

    const [zoom, setZoom] = useState(1);

    const canvasRef: React.RefObject<HTMLCanvasElement | null> = useRef(null);
    const ctxRef: React.RefObject<CanvasRenderingContext2D | null> = useRef(null);

    // Initialize canvases and add event listeners
    useEffect(() => {
        if (canvasRef.current) {
            ctxRef.current = canvasRef.current.getContext("2d");
            drawCanvas();
            addEventListenersForCanvas();
        }

        return () => {
            // Cleanup event listeners on unmount
            if (canvasRef.current) {
                canvasRef.current.removeEventListener<"mousemove">(
                    "mousemove",
                    handleNormalMouseMove
                );
                canvasRef.current.removeEventListener<"click">("click", handleClickOnCanvas);
                canvasRef.current.removeEventListener<"dblclick">(
                    "dblclick",
                    handleDoubleClickOnCanvas
                );
                canvasRef.current.removeEventListener<"mousedown">(
                    "mousedown",
                    handleMouseDownOnCanvas
                );
                canvasRef.current.removeEventListener<"mouseup">("mouseup", handleMouseUpOnCanvas);
                canvasRef.current.removeEventListener<"mousemove">("mousemove", handleMousemove);
            }
        };
    }, []);

    // Redraw canvas when relevant state changes
    useEffect(() => {
        drawCanvas();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        drawCanvasTrigger,
        rechtecke,
        redDot,
        blueDot,
        tooltipRechteck,
        dragRectangle,
        canvasWidthIncrease,
    ]);

    function drawCanvas() {
        if (!ctxRef.current || !canvasRef.current) return;

        const ctx = ctxRef.current;
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

        drawRechtecke();
        drawRedDot();
        drawBlueDot();
        drawToolTipWithDistanceToX1AndY1();
    }

    function drawRechtecke() {
        if (!ctxRef.current) return;

        const ctx = ctxRef.current;
        rechtecke.forEach(rechteck => {
            ctx.lineWidth = 2;
            const rechtEckIsTheOneWithTheMouse =
                tooltipRechteck.rechteck !== null &&
                tooltipRechteck.rechteck.x1 === rechteck.x1 &&
                tooltipRechteck.rechteck.y1 === rechteck.y1;

            ctx.strokeStyle = rechtEckIsTheOneWithTheMouse ? "red" : "black";
            ctx.beginPath();
            ctx.rect(
                rechteck.x1,
                rechteck.y1,
                rechteck.x2 - rechteck.x1,
                rechteck.y2 - rechteck.y1
            );
            ctx.stroke();
        });
    }

    function getMousePos(canvas: HTMLCanvasElement, evt: MouseEvent) {
        const rect = canvas.getBoundingClientRect();
        const x = ((evt.clientX - rect.left) / rect.width) * sizeOfCanvas * zoom;
        const y = ((evt.clientY - rect.top) / rect.height) * sizeOfCanvas * zoom;

        console.log('scale', ctxRef.current.getScale);

        console.log("x", x, y, zoom);
        return {
            x,
            y,
        };
    }

    function roundToNextHalf(num: number) {
        return Math.round(num * 2) / 2;
    }

    function checkForBlueDot(
        rechteck: Rechteck,
        mouseXOnCanvas: number,
        mouseYOnCanvas: number,
        snapDistanceBlueDot: number
    ) {
        const rechteckDistancesEdge: RechteckDistancesEdge[] = [];

        if (
            Math.abs(rechteck.x1 - mouseXOnCanvas) < snapDistanceBlueDot &&
            Math.abs(rechteck.y1 - mouseYOnCanvas) < snapDistanceBlueDot
        ) {
            rechteckDistancesEdge.push({
                distance:
                    Math.abs(rechteck.x1 - mouseXOnCanvas) + Math.abs(rechteck.y1 - mouseYOnCanvas),
                x1: rechteck.x1,
                y1: rechteck.y1,
                isDragging: rechteck.isDragging,
            });
        }
        if (
            Math.abs(rechteck.x2 - mouseXOnCanvas) < snapDistanceBlueDot &&
            Math.abs(rechteck.y1 - mouseYOnCanvas) < snapDistanceBlueDot
        ) {
            rechteckDistancesEdge.push({
                distance:
                    Math.abs(rechteck.x2 - mouseXOnCanvas) + Math.abs(rechteck.y1 - mouseYOnCanvas),
                x1: rechteck.x2,
                y1: rechteck.y1,
                isDragging: rechteck.isDragging,
            });
        }
        if (
            Math.abs(rechteck.x1 - mouseXOnCanvas) < snapDistanceBlueDot &&
            Math.abs(rechteck.y2 - mouseYOnCanvas) < snapDistanceBlueDot
        ) {
            rechteckDistancesEdge.push({
                distance:
                    Math.abs(rechteck.x1 - mouseXOnCanvas) + Math.abs(rechteck.y2 - mouseYOnCanvas),
                x1: rechteck.x1,
                y1: rechteck.y2,
                isDragging: rechteck.isDragging,
            });
        }
        if (
            Math.abs(rechteck.x2 - mouseXOnCanvas) < snapDistanceBlueDot &&
            Math.abs(rechteck.y2 - mouseYOnCanvas) < snapDistanceBlueDot
        ) {
            rechteckDistancesEdge.push({
                distance:
                    Math.abs(rechteck.x2 - mouseXOnCanvas) + Math.abs(rechteck.y2 - mouseYOnCanvas),
                x1: rechteck.x2,
                y1: rechteck.y2,
                isDragging: rechteck.isDragging,
            });
        }

        return rechteckDistancesEdge;
    }

    function checkForRedDot(
        rechteck: Rechteck,
        mouseXOnCanvas: number,
        mouseYOnCanvas: number,
        snapDistanceRedDot: number
    ) {
        const rechteckDistancesKanten = [];

        if (
            Math.abs(rechteck.x1 - mouseXOnCanvas) < snapDistanceRedDot &&
            mouseYOnCanvas > rechteck.y1 &&
            mouseYOnCanvas < rechteck.y2
        ) {
            rechteckDistancesKanten.push({
                distance: Math.abs(rechteck.x1 - mouseXOnCanvas),
                x: roundToNextHalf(rechteck.x1),
                y: roundToNextHalf(mouseYOnCanvas),
                x1: rechteck.x1,
                y1: rechteck.y1,
                isDragging: rechteck.isDragging,
            });
        }
        if (
            Math.abs(rechteck.x2 - mouseXOnCanvas) < snapDistanceRedDot &&
            mouseYOnCanvas > rechteck.y1 &&
            mouseYOnCanvas < rechteck.y2
        ) {
            rechteckDistancesKanten.push({
                distance: Math.abs(rechteck.x2 - mouseXOnCanvas),
                x: roundToNextHalf(rechteck.x2),
                y: roundToNextHalf(mouseYOnCanvas),
                x1: rechteck.x1,
                y1: rechteck.y1,
                isDragging: rechteck.isDragging,
            });
        }
        if (
            Math.abs(rechteck.y1 - mouseYOnCanvas) < snapDistanceRedDot &&
            mouseXOnCanvas > rechteck.x1 &&
            mouseXOnCanvas < rechteck.x2
        ) {
            rechteckDistancesKanten.push({
                distance: Math.abs(rechteck.y1 - mouseYOnCanvas),
                x: roundToNextHalf(mouseXOnCanvas),
                y: roundToNextHalf(rechteck.y1),
                x1: rechteck.x1,
                y1: rechteck.y1,
                isDragging: rechteck.isDragging,
            });
        }
        if (
            Math.abs(rechteck.y2 - mouseYOnCanvas) < snapDistanceRedDot &&
            mouseXOnCanvas > rechteck.x1 &&
            mouseXOnCanvas < rechteck.x2
        ) {
            rechteckDistancesKanten.push({
                distance: Math.abs(rechteck.y2 - mouseYOnCanvas),
                x: roundToNextHalf(mouseXOnCanvas),
                y: roundToNextHalf(rechteck.y2),
                x1: rechteck.x1,
                y1: rechteck.y1,
                isDragging: rechteck.isDragging,
            });
        }

        return rechteckDistancesKanten;
    }

    function handleRechteckDistancesEdge(
        rechteckDistancesEdge: RechteckDistancesEdge[],
        snapDistanceBlueDot: number
    ) {
        if (rechteckDistancesEdge.length === 0) {
            setBlueDot({ x: null, y: null });
            return;
        }

        const minDistance = Math.min(...rechteckDistancesEdge.map(r => r.distance));
        if (minDistance < snapDistanceBlueDot) {
            const closestRechteck = rechteckDistancesEdge.find(r => r.distance === minDistance);

            if (!closestRechteck) {
                return;
            }

            if (closestRechteck?.isDragging) {
                setBlueDot({ x: null, y: null });
                return;
            }

            setBlueDot({ x: closestRechteck.x1, y: closestRechteck.y1 });
            setRedDot({ x: null, y: null });
            setTooltipRechteck({ rechteck: null, x: 0, y: 0 });
        } else {
            setBlueDot({ x: null, y: null });
        }
    }

    function handleRechteckDistancesKanten(
        rechteckDistancesKanten: RechteckDistancesEdge[],
        snapDistanceRedDot: number,
        mouseXOnCanvas: number,
        mouseYOnCanvas: number
    ) {
        if (rechteckDistancesKanten.length === 0) {
            setRedDot({ x: null, y: null });
            setTooltipRechteck({ rechteck: null, x: 0, y: 0 });
            return;
        }

        const minDistance = Math.min(...rechteckDistancesKanten.map(r => r.distance));
        if (minDistance < snapDistanceRedDot) {
            const closestRechteck = rechteckDistancesKanten.find(r => r.distance === minDistance);

            if (!closestRechteck) {
                return;
            }

            if (closestRechteck.isDragging) {
                setRedDot({ x: null, y: null });
                return;
            }

            setRedDot({ x: closestRechteck.x1, y: closestRechteck.y1 });
            const newTooltipRechteck: Rechteck | null = {
                x1: closestRechteck.x1 || 0,
                y1: closestRechteck.y1 || 0,
                x2: mouseXOnCanvas,
                y2: mouseYOnCanvas,
                isDragging: false,
            };
            setTooltipRechteck({
                rechteck: newTooltipRechteck,
                x: mouseXOnCanvas,
                y: mouseYOnCanvas,
            });
        } else {
            setRedDot({ x: null, y: null });
            setTooltipRechteck({ rechteck: null, x: 0, y: 0 });
        }
    }

    function handleNormalMouseMove(event: MouseEvent) {
        event.stopPropagation();

        if (!canvasRef.current) return;

        const mousePos = getMousePos(canvasRef.current, event);
        const mouseXOnCanvas = mousePos.x;
        const mouseYOnCanvas = mousePos.y;

        const snapDistanceRedDot = 20;
        const snapDistanceBlueDot = 5;

        const rechteckDistancesKanten: RechteckDistancesEdge[] = [];
        const rechteckDistancesEdge: RechteckDistancesEdge[] = [];

        rechtecke.forEach(rechteck => {
            const rechteckDistancesEdgeOfRechteck = checkForBlueDot(
                rechteck,
                mouseXOnCanvas,
                mouseYOnCanvas,
                snapDistanceBlueDot
            );
            rechteckDistancesEdge.push(...rechteckDistancesEdgeOfRechteck);

            const rechteckDistancesKantenOfRechteck = checkForRedDot(
                rechteck,
                mouseXOnCanvas,
                mouseYOnCanvas,
                snapDistanceRedDot
            );
            rechteckDistancesKanten.push(...rechteckDistancesKantenOfRechteck);
        });

        handleRechteckDistancesEdge(rechteckDistancesEdge, snapDistanceBlueDot);
        handleRechteckDistancesKanten(
            rechteckDistancesKanten,
            snapDistanceRedDot,
            mouseXOnCanvas,
            mouseYOnCanvas
        );
    }

    function handleClickOnCanvas(event: MouseEvent) {
        event.stopPropagation();
        if (redDot.x === null && redDot.y === null && blueDot.x === null && blueDot.y === null) {
            return;
        }

        if (blueDot.x !== null && blueDot.y !== null) {
            setClickPosition({ x: blueDot.x, y: blueDot.y });
        } else if (redDot.x !== null && redDot.y !== null) {
            setClickPosition({ x: redDot.x, y: redDot.y });
        }

        toast("Position zum Hinzufügen des Rechtecks gespeichert");
    }

    function handleDoubleClickOnCanvas(event: MouseEvent) {
        handleClickOnCanvas(event);
        openDialog();
    }

    function handleMouseDownOnCanvas(event: MouseEvent) {
        dragRectangle.current = {
            x1: 0,
            y1: 0,
            x2: 0,
            y2: 0,
            isDragging: true,
        };

        const rechteckeHasAlreadyDraggingElement = rechtecke.some(rechteck => rechteck.isDragging);

        if (rechteckeHasAlreadyDraggingElement) {
            return;
        }

        if (!canvasRef.current) return;

        const mousePos = getMousePos(canvasRef.current, event);
        const mouseXOnCanvas = blueDot.x || redDot.x || mousePos.x;
        const mouseYOnCanvas = blueDot.y || redDot.y || mousePos.y;

        const newDragRectangle: Rechteck = {
            x1: roundToNextHalf(mouseXOnCanvas),
            y1: roundToNextHalf(mouseYOnCanvas),
            x2: roundToNextHalf(mouseXOnCanvas),
            y2: roundToNextHalf(mouseYOnCanvas),
            isDragging: true,
        };

        dragRectangle.current = newDragRectangle;
        addRechteck(newDragRectangle);
    }

    function handleMouseUpOnCanvas() {
        console.log("handleMouseUpOnCanvas - dragRectangle", dragRectangle.current);

        if (!dragRectangle.current) {
            return;
        }

        const dragRectangleCopy = { ...dragRectangle.current, isDragging: false };

        setRechtecke(prev => {
            // Remove the dragging rectangle
            const filtered = prev.filter(r => !r.isDragging);

            // Only add it back if it has dimensions
            if (
                dragRectangleCopy.x1 - dragRectangleCopy.x2 !== 0 &&
                dragRectangleCopy.y1 - dragRectangleCopy.y2 !== 0
            ) {
                return [...filtered, dragRectangleCopy];
            }
            return filtered;
        });

        dragRectangle.current = undefined;
        setCanvasWidthIncrease(0);
    }

    function handleMousemove(event: MouseEvent) {
        if (!dragRectangle.current) {
            return;
        }

        event.stopPropagation();
        if (!dragRectangle.current.isDragging || !canvasRef.current) {
            return;
        }

        const mousePos = getMousePos(canvasRef.current, event);
        const mouseXOnCanvas =
            redDot.x && dragRectangle.current.x1 !== redDot.x ? redDot.x : mousePos.x;
        const mouseYOnCanvas =
            redDot.y && dragRectangle.current.y1 !== redDot.y ? redDot.y : mousePos.y;

        if (sizeOfCanvas > 0 && (mouseXOnCanvas > sizeOfCanvas || mouseYOnCanvas > sizeOfCanvas)) {
            return;
        }

        const updatedDragRectangle = {
            ...dragRectangle.current,
            x2: roundToNextHalf(mouseXOnCanvas),
            y2: roundToNextHalf(mouseYOnCanvas),
        };
        dragRectangle.current = updatedDragRectangle;

        // Update the dragging rectangle in the rechtecke array
        setRechtecke(prev => prev.map(r => (r.isDragging ? updatedDragRectangle : r)));

        // Draw dimensions text (this is handled in the draw functions in React through the effect)
        if (ctxRef.current) {
            const ctx = ctxRef.current;
            ctx.fillStyle = "black";
            ctx.font = "16px Arial";
            ctx.fillText(
                `breite: ${Math.abs(updatedDragRectangle.x2 - updatedDragRectangle.x1).toFixed(2)}, hoehe: ${Math.abs(updatedDragRectangle.y2 - updatedDragRectangle.y1).toFixed(2)}`,
                updatedDragRectangle.x2,
                updatedDragRectangle.y2
            );
        }
    }

    function drawRedDot() {
        if (
            redDot.x === null ||
            redDot.y === null ||
            blueDot.x !== null ||
            blueDot.y !== null ||
            !ctxRef.current
        ) {
            return;
        }

        const ctx = ctxRef.current;
        ctx.fillStyle = "red";
        ctx.beginPath();
        ctx.arc(redDot.x, redDot.y, 4, 1, 2 * Math.PI);
        ctx.fill();

        if (!blueDot.x || !blueDot.y) {
            return;
        }

        setClickPosition({ x: blueDot.x, y: blueDot.y });
    }

    function drawBlueDot() {
        if (blueDot.x === null || blueDot.y === null || !ctxRef.current) {
            return;
        }

        const ctx = ctxRef.current;
        ctx.fillStyle = "blue";
        ctx.beginPath();
        ctx.arc(blueDot.x, blueDot.y, 4, 1, 2 * Math.PI);
        ctx.fill();

        setClickPosition({ x: blueDot.x, y: blueDot.y });
    }

    function drawToolTipWithDistanceToX1AndY1() {
        if (
            tooltipRechteck.rechteck === null ||
            (dragRectangle.current && dragRectangle.current.isDragging) ||
            !ctxRef.current ||
            !redDot.x ||
            !redDot.y
        ) {
            return;
        }

        const { rechteck, x, y } = tooltipRechteck;
        const distanceToX1 = Math.abs(rechteck.x1 - redDot.x).toFixed(2);
        const distanceToY1 = Math.abs(rechteck.y1 - redDot.y).toFixed(2);

        const ctx = ctxRef.current;
        ctx.fillStyle = "black";
        ctx.font = "16px Arial";
        ctx.fillText(`x1: ${distanceToX1}, y1: ${distanceToY1}`, x, y);
    }

    const handleZoom = (event: WheelEvent) => {
        event.preventDefault();
        const zoomFactor = 0.01;
        const newZoom = Math.max(
            0.01,
            Math.min(2, zoom + (event.deltaY > 0 ? -zoomFactor : zoomFactor))
        );

        setZoom(newZoom);
        if (ctxRef.current && canvasRef.current) {
            ctxRef.current.scale(newZoom, newZoom);
            ctxRef.current.translate(event.deltaX * (1 - newZoom), event.deltaY * (1 - newZoom));
            ctxRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }

        setTimeout(() => {
            drawCanvas();
        }, 10);
    };

    function addEventListenersForCanvas() {
        if (!canvasRef.current) return;

        canvasRef.current.addEventListener("mousemove", handleNormalMouseMove);
        canvasRef.current.addEventListener("click", handleClickOnCanvas);
        canvasRef.current.addEventListener("dblclick", handleDoubleClickOnCanvas);
        canvasRef.current.addEventListener("mousedown", handleMouseDownOnCanvas);
        canvasRef.current.addEventListener("mouseup", handleMouseUpOnCanvas);
        canvasRef.current.addEventListener("mousemove", handleMousemove);
        canvasRef.current.addEventListener("wheel", handleZoom);
    }

    const sizeOfCanvas = 1000;

    return (
        <div className="grid grid-cols-[minmax(0,1fr)_max-content] grid-rows-[minmax(0,1fr)_max-content] items-center justify-items-center gap-2">
            <div className="max-w-full w-auto aspect-square max-h-[calc(100dvh-40px)] bg-gray-200 rounded-lg shadow-md mt-4 p-4">
                <div>
                    <p>isdragging {dragRectangle.current?.isDragging}</p>
                    <p>{JSON.stringify(dragRectangle)}</p>
                </div>

                <canvas
                    id="raum"
                    ref={canvasRef}
                    width={sizeOfCanvas}
                    height={sizeOfCanvas}
                    className={cn(
                        // sizeOfCanvas ? "h-full" : "h-[50vh]",
                        "h-full w-full bg-gray-200 aspect-square"
                    )}></canvas>
            </div>

            <AddButton
                className="w-max h-max"
                onClick={() => setCanvasWidthIncrease(prev => prev + 50)}
            />
            <AddButton
                className="w-max h-max"
                onClick={() => setCanvasWidthIncrease(prev => prev + 50)}
            />
        </div>
    );
};
