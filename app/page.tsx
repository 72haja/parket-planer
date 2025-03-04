"use client";

import { useEffect, useRef, useState } from "react";
import { AddButton } from "@/app/components/AddButton";
import { AddRechteckDialog } from "@/app/components/AddRechteckDialog";
import { Rooms } from "@/app/components/Rooms";
import { Snackbar } from "@/app/components/Snackbar";
import { Dot, Position, Rechteck, RechteckDistancesEdge, TooltipRechteck } from "@/types";

// Assume these components are imported from elsewhere
// import AddRechteckDialog from './components/AddRechteckDialog';
// import CloseButton from './components/CloseButton';
// import Snackbar from './components/Snackbar';
// import AddButton from './components/AddButton';
// import Rooms from './components/Rooms';

export default function VinylPlattenRechner() {
    const [snackbarText, setSnackbarText] = useState("");
    const [plattenLaenge, setPlattenLaenge] = useState(63.6);
    const [plattenBreite, setPlattenBreite] = useState(31.9);
    const [clickPosition, setClickPosition] = useState<Position>({ x: 0, y: 0 });
    const [rechtecke, setRechtecke] = useState<Rechteck[]>([]);
    const [versatz, setVersatz] = useState(0.5);
    const [canvasWidthIncrease, setCanvasWidthIncrease] = useState(0);
    const [showAddRechteckDialog, setShowAddRechteckDialog] = useState(false);
    const [redDot, setRedDot] = useState<Dot>({ x: null, y: null });
    const [blueDot, setBlueDot] = useState<Dot>({ x: null, y: null });
    const [tooltipRechteck, setTooltipRechteck] = useState<TooltipRechteck>({
        rechteck: null,
        x: 0,
        y: 0,
    });
    const [dragRectangle, setDragRectangle] = useState<Rechteck>({
        x1: 0,
        y1: 0,
        x2: 0,
        y2: 0,
        isDragging: false,
    });

    const canvasRef: React.RefObject<HTMLCanvasElement | null> = useRef(null);
    const canvasPlattenRef: React.RefObject<HTMLCanvasElement | null> = useRef(null);
    const ctxRef: React.RefObject<CanvasRenderingContext2D | null> = useRef(null);
    const ctxPlattenRef: React.RefObject<CanvasRenderingContext2D | null> = useRef(null);

    const maxXOfRechtecke =
        Math.max(
            ...rechtecke
                .filter(rechteck => !rechteck.isDragging)
                .flatMap(rechteck => [rechteck.x1, rechteck.x2]),
            0
        ) + canvasWidthIncrease;

    const maxYOfRechtecke =
        Math.max(
            ...rechtecke
                .filter(rechteck => !rechteck.isDragging)
                .flatMap(rechteck => [rechteck.y1, rechteck.y2]),
            0
        ) + canvasWidthIncrease;

    const widthOfCanvas = (Math.max(maxXOfRechtecke, maxYOfRechtecke) + canvasWidthIncrease) * 1.1;

    // Initialize canvases and add event listeners
    useEffect(() => {
        if (canvasRef.current && canvasPlattenRef.current) {
            ctxRef.current = canvasRef.current.getContext("2d");
            ctxPlattenRef.current = canvasPlattenRef.current.getContext("2d");
            drawCanvas();
            addEventListenersForCanvas();
        }

        return () => {
            // Cleanup event listeners on unmount
            if (canvasRef.current) {
                canvasRef.current.removeEventListener("mousemove", handleNormalMouseMove);
                canvasRef.current.removeEventListener("click", handleClickOnCanvas);
                canvasRef.current.removeEventListener("dblclick", handleDoubleClickOnCanvas);
                canvasRef.current.removeEventListener("mousedown", handleMouseDownOnCanvas);
                canvasRef.current.removeEventListener("mouseup", handleMouseUpOnCanvas);
                canvasRef.current.removeEventListener("mousemove", handleMousemove);
            }
        };
    }, []);

    // Redraw canvas when relevant state changes
    useEffect(() => {
        drawCanvas();
    }, [
        rechtecke,
        redDot,
        blueDot,
        tooltipRechteck,
        dragRectangle,
        versatz,
        plattenBreite,
        plattenLaenge,
        canvasWidthIncrease,
    ]);

    function drawCanvas() {
        drawRaumCanvas();
        drawPlattenCanvas();
    }

    function drawRaumCanvas() {
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

    function drawPlattenCanvas() {
        if (!ctxPlattenRef.current || !canvasPlattenRef.current) return;

        const ctx = ctxPlattenRef.current;
        ctx.clearRect(0, 0, canvasPlattenRef.current.width, canvasPlattenRef.current.height);
        drawVinylPlatten();
    }

    const abstandX = 20;
    const abstandY = 20;

    function drawVinylPlatten() {
        if (!ctxPlattenRef.current) return;

        const ctx = ctxPlattenRef.current;
        const amountOfPlattenX = Math.floor(widthOfCanvas / plattenLaenge);
        const amountOfPlattenY = Math.floor(widthOfCanvas / plattenBreite);

        for (let i = 0; i < amountOfPlattenX; i++) {
            for (let j = 0; j < amountOfPlattenY; j++) {
                ctx.lineWidth = 1;
                ctx.strokeStyle = "gray";
                ctx.beginPath();
                const versatzValue = j % 2 === 1 ? versatz * plattenLaenge : 0;
                ctx.rect(
                    abstandX + i * plattenLaenge + versatzValue,
                    abstandY + j * plattenBreite,
                    plattenLaenge,
                    plattenBreite
                );
                ctx.stroke();
            }
        }
    }

    function handleRoomSelect(rooms: Rechteck[]) {
        setRechtecke(rooms);
    }

    function openAddRechteckDialog() {
        setShowAddRechteckDialog(true);
    }

    function closeAddRechteckDialog() {
        setShowAddRechteckDialog(false);
    }

    function addRechteck(rechteck: Rechteck) {
        if (rechteck.x1 - rechteck.x2 === 0 || rechteck.y1 - rechteck.y2 === 0) {
            setSnackbarText("Breite und Höhe müssen größer als 0 sein");
            return;
        }

        setRechtecke(prev => [...prev, rechteck]);
        closeAddRechteckDialog();
    }

    function removeRechteck(index: number) {
        setRechtecke(prev => prev.filter((_, i) => i !== index));
    }

    function getMousePos(canvas: HTMLCanvasElement, evt: MouseEvent) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        return {
            x: (evt.clientX - rect.left) * scaleX,
            y: (evt.clientY - rect.top) * scaleY,
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

        setSnackbarText("Position zum Hinzufügen des Rechtecks gespeichert");
    }

    function handleDoubleClickOnCanvas(event: MouseEvent) {
        handleClickOnCanvas(event);
        openAddRechteckDialog();
    }

    function handleMouseDownOnCanvas(event: MouseEvent) {
        setDragRectangle(prev => ({ ...prev, isDragging: true }));

        const rechteckeHasAlreadyDraggingElement = rechtecke.some(rechteck => rechteck.isDragging);
        if (rechteckeHasAlreadyDraggingElement) {
            return;
        }

        if (!canvasRef.current) return;

        const mousePos = getMousePos(canvasRef.current, event);
        const mouseXOnCanvas = blueDot.x || redDot.x || mousePos.x;
        const mouseYOnCanvas = blueDot.y || redDot.y || mousePos.y;

        const newDragRectangle = {
            x1: roundToNextHalf(mouseXOnCanvas),
            y1: roundToNextHalf(mouseYOnCanvas),
            x2: roundToNextHalf(mouseXOnCanvas),
            y2: roundToNextHalf(mouseYOnCanvas),
            isDragging: true,
        };

        setDragRectangle(newDragRectangle);
        setRechtecke(prev => [...prev, newDragRectangle]);
    }

    function handleMouseUpOnCanvas() {
        const dragRectangleCopy = { ...dragRectangle, isDragging: false };

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

        setDragRectangle({ x1: 0, y1: 0, x2: 0, y2: 0, isDragging: false });
        setCanvasWidthIncrease(0);
    }

    function handleMousemove(event: MouseEvent) {
        event.stopPropagation();

        if (!dragRectangle.isDragging || !canvasRef.current) return;

        const mousePos = getMousePos(canvasRef.current, event);
        const mouseXOnCanvas = redDot.x && dragRectangle.x1 !== redDot.x ? redDot.x : mousePos.x;
        const mouseYOnCanvas = redDot.y && dragRectangle.y1 !== redDot.y ? redDot.y : mousePos.y;

        if (mouseXOnCanvas > widthOfCanvas || mouseYOnCanvas > widthOfCanvas) return;

        const updatedDragRectangle = {
            ...dragRectangle,
            x2: roundToNextHalf(mouseXOnCanvas),
            y2: roundToNextHalf(mouseYOnCanvas),
        };

        setDragRectangle(updatedDragRectangle);

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
            dragRectangle.isDragging ||
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

    function getBreite(rechteck: Rechteck) {
        return Math.abs(rechteck.x2 - rechteck.x1);
    }

    function handleUpdateBreite(rechteck: Rechteck, breite: string) {
        setRechtecke(prev =>
            prev.map(r => {
                if (r.x1 === rechteck.x1 && r.y1 === rechteck.y1) {
                    return { ...r, x2: parseFloat(r.x1.toString()) + parseFloat(breite) };
                }
                return r;
            })
        );
    }

    function getHoehe(rechteck: Rechteck) {
        return Math.abs(rechteck.y2 - rechteck.y1);
    }

    function handleUpdateHoehe(rechteck: Rechteck, hoehe: string) {
        setRechtecke(prev =>
            prev.map(r => {
                if (r.x1 === rechteck.x1 && r.y1 === rechteck.y1) {
                    return { ...r, y2: parseFloat(r.y1.toString()) + parseFloat(hoehe) };
                }
                return r;
            })
        );
    }

    function addEventListenersForCanvas() {
        if (!canvasRef.current) return;

        canvasRef.current.addEventListener("mousemove", handleNormalMouseMove);
        canvasRef.current.addEventListener("click", handleClickOnCanvas);
        canvasRef.current.addEventListener("dblclick", handleDoubleClickOnCanvas);
        canvasRef.current.addEventListener("mousedown", handleMouseDownOnCanvas);
        canvasRef.current.addEventListener("mouseup", handleMouseUpOnCanvas);
        canvasRef.current.addEventListener("mousemove", handleMousemove);
    }

    return (
        <div className="p-10">
            <div className="max-w-screen-2xl mx-auto p-4 md:p-6 lg:p-8 bg-white rounded-lg shadow-md">
                <Rooms onUpdateSelectedRoom={handleRoomSelect} />

                <h1 className="text-3xl font-bold mb-4">Vinyl-Platten-Rechner</h1>
                <form className="flex flex-col">
                    <div className="w-full grid gap-2">
                        <label className="block text-lg font-medium">
                            Länge der Vinyl-Platte:
                            <input
                                type="number"
                                value={plattenLaenge}
                                onChange={e => setPlattenLaenge(Number(e.target.value))}
                                className="w-full p-2 pl-10 text-lg border border-gray-400 rounded-lg focus:outline-none focus:ring focus:ring-blue-500"
                            />
                        </label>
                        <label className="block text-lg font-medium">
                            Breite der Vinyl-Platte:
                            <input
                                type="number"
                                value={plattenBreite}
                                onChange={e => setPlattenBreite(Number(e.target.value))}
                                className="w-full p-2 pl-10 text-lg border border-gray-400 rounded-lg focus:outline-none focus:ring focus:ring-blue-500"
                            />
                        </label>
                    </div>
                </form>

                <p className="text-lg font-medium mt-8">Raum</p>

                <div className="grid grid-cols-[minmax(0,1fr)_max-content] grid-rows-[minmax(0,1fr)_max-content] items-center justify-items-center gap-2">
                    <div className="max-w-full w-auto aspect-square max-h-[calc(100dvh-40px)] bg-gray-200 rounded-lg shadow-md mt-4 p-4">
                        <canvas
                            id="raum"
                            ref={canvasRef}
                            width={widthOfCanvas}
                            height={widthOfCanvas}
                            className="w-full h-full bg-gray-200 aspect-square"></canvas>
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

                <button
                    onClick={openAddRechteckDialog}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg mt-4">
                    Rechteck hinzufügen
                </button>

                <div className="grid gap-2 p-4">
                    {rechtecke.map((rechteck, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <span>Rechteck {index}</span>
                            <label className="block text-lg font-medium">
                                Breite:
                                <input
                                    type="number"
                                    step="0.5"
                                    value={getBreite(rechteck)}
                                    className="w-full p-2 pl-10 text-lg border border-gray-400 rounded-lg focus:outline-none focus:ring focus:ring-blue-500"
                                    onChange={event => {
                                        handleUpdateBreite(rechteck, event.target.value);
                                        drawCanvas();
                                    }}
                                />
                            </label>
                            <label className="block text-lg font-medium">
                                Höhe:
                                <input
                                    type="number"
                                    step="0.5"
                                    value={getHoehe(rechteck)}
                                    className="w-full p-2 pl-10 text-lg border border-gray-400 rounded-lg focus:outline-none focus:ring focus:ring-blue-500"
                                    onChange={event => {
                                        handleUpdateHoehe(rechteck, event.target.value);
                                        drawCanvas();
                                    }}
                                />
                            </label>
                            {/* <CloseButton onClick={() => removeRechteck(index)} /> */}
                            <button onClick={() => removeRechteck(index)}>X</button>
                        </div>
                    ))}
                </div>

                <p className="text-lg font-medium mt-8">Platten</p>

                <label className="block text-lg font-medium">
                    Versatz:
                    <input
                        type="number"
                        step="0.01"
                        value={versatz}
                        onChange={e => setVersatz(Number(e.target.value))}
                        className="w-full p-2 pl-10 text-lg border border-gray-400 rounded-lg focus:outline-none focus:ring focus:ring-blue-500"
                    />
                </label>

                <div className="max-w-full w-auto aspect-square max-h-[calc(100dvh-40px)] bg-gray-200 rounded-lg shadow-md mt-4 p-4">
                    <canvas
                        id="platten"
                        ref={canvasPlattenRef}
                        width={widthOfCanvas}
                        height={widthOfCanvas}
                        className="w-full h-full bg-gray-200"></canvas>
                </div>

                <AddRechteckDialog
                    showDialog={showAddRechteckDialog}
                    xPosition={clickPosition.x}
                    yPosition={clickPosition.y}
                    onSave={addRechteck}
                    onClose={closeAddRechteckDialog}
                />
            </div>

            <Snackbar text={snackbarText} onClose={() => setSnackbarText("")} />
        </div>
    );
}
