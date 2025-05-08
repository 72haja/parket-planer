"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "primereact/button";
import type { Door, Floor, Flooring, Wall } from "@/lib/supabase";

interface FloorplanCanvasProps {
    floor: Floor;
    floorings?: Flooring[];
    scale?: number; // scale in pixels per cm
    editable?: boolean;
    onFloorUpdate?: (floor: Floor) => void;
    onFlooringPositionUpdate?: (flooring: Flooring, position: [number, number]) => void;
}

export default function FloorplanCanvas({
    floor,
    floorings = [],
    scale = 0.5,
    editable = true,
    onFloorUpdate,
    onFlooringPositionUpdate,
}: FloorplanCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [currentTool, setCurrentTool] = useState<"wall" | "door" | "select" | "move">("select");

    // Zustand für das aktuelle Zeichnen einer Wand
    const [drawingWall, setDrawingWall] = useState<{
        id: string;
        points: [number, number][];
    } | null>(null);

    // Zustand für das Verschieben von Elementen (Drag & Drop)
    const [dragItem, setDragItem] = useState<{
        type: "flooring" | "wall" | "door";
        id: string;
        startPos: [number, number];
        offset: [number, number];
    } | null>(null);

    // Canvas neu zeichnen, wenn sich die Props ändern
    useEffect(() => {
        drawFloorplan();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [floor, floorings, scale, currentTool]);

    // Zeichnet den Grundriss auf den Canvas
    const drawFloorplan = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Canvas zurücksetzen
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Raster zeichnen
        drawGrid(ctx, canvas.width, canvas.height, 20 * scale); // 20cm Raster

        // Bodenbeläge zeichnen (zuerst, damit sie im Hintergrund sind)
        floorings
            .filter(f => f.floorId === floor.id)
            .forEach(flooring => {
                drawFlooring(ctx, flooring);
            });

        // Wände zeichnen
        floor.walls.forEach(wall => {
            drawWall(ctx, wall);
        });

        // Türen zeichnen
        floor.doors.forEach(door => {
            drawDoor(ctx, door);
        });

        // Wand beim Zeichnen anzeigen
        if (drawingWall && drawingWall.points.length > 0 && drawingWall.points[0] !== undefined) {
            ctx.beginPath();
            ctx.lineWidth = 10; // Standarddicke beim Zeichnen
            ctx.strokeStyle = "#33a";

            ctx.moveTo(drawingWall.points[0][0] * scale, drawingWall.points[0][1] * scale);

            for (let i = 1; i < drawingWall.points.length; i++) {
                const drawingWallPoint = drawingWall.points[i];
                if (drawingWallPoint === undefined) {
                    continue;
                }
                ctx.lineTo(drawingWallPoint[0] * scale, drawingWallPoint[1] * scale);
            }

            ctx.stroke();
        }
    };

    // Hilfsfunktion zum Zeichnen eines Rasters
    const drawGrid = (
        ctx: CanvasRenderingContext2D,
        width: number,
        height: number,
        gridSize: number
    ) => {
        ctx.beginPath();
        ctx.strokeStyle = "#eee";
        ctx.lineWidth = 1;

        // Vertikale Linien
        for (let x = 0; x <= width; x += gridSize) {
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
        }

        // Horizontale Linien
        for (let y = 0; y <= height; y += gridSize) {
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
        }

        ctx.stroke();
    };

    // Hilfsfunktion zum Zeichnen einer Wand
    const drawWall = (ctx: CanvasRenderingContext2D, wall: Wall) => {
        if (wall.points.length < 2 || wall.points[0] === undefined) {
            return;
        }

        ctx.beginPath();
        ctx.lineWidth = wall.thickness * scale;
        ctx.strokeStyle = "#555";
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        ctx.moveTo(wall.points[0][0] * scale, wall.points[0][1] * scale);

        for (let i = 1; i < wall.points.length; i++) {
            const wallPoint = wall.points[i];
            if (wallPoint === undefined) {
                continue;
            }
            ctx.lineTo(wallPoint[0] * scale, wallPoint[1] * scale);
        }

        ctx.stroke();
    };

    // Hilfsfunktion zum Zeichnen einer Tür
    const drawDoor = (ctx: CanvasRenderingContext2D, door: Door) => {
        ctx.save();
        ctx.translate(door.position[0] * scale, door.position[1] * scale);
        ctx.rotate((door.rotation * Math.PI) / 180);

        // Türöffnung (Bogen)
        ctx.beginPath();
        ctx.strokeStyle = "#333";
        ctx.lineWidth = 2;
        ctx.arc(0, 0, (door.width * scale) / 2, 0, Math.PI, false);
        ctx.stroke();

        // Türrahmen
        ctx.beginPath();
        ctx.rect((-door.width * scale) / 2, -5 * scale, door.width * scale, 10 * scale);
        ctx.strokeStyle = "#333";
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.restore();
    };

    // Hilfsfunktion zum Zeichnen eines Bodenbelags
    const drawFlooring = (ctx: CanvasRenderingContext2D, flooring: Flooring) => {
        const tileWidthPx = flooring.tileWidth * scale;
        const tileHeightPx = flooring.tileHeight * scale;
        const xOffset = flooring.position[0] * scale;
        const yOffset = flooring.position[1] * scale;

        // Berechne Versatz pro Reihe
        const rowOffset = flooring.offset * tileWidthPx;

        ctx.save();

        // Bestimme das Zeichenfeld basierend auf dem sichtbaren Bereich
        const canvas = canvasRef.current!;
        const visibleTilesX = Math.ceil(canvas.width / tileWidthPx) + 1;
        const visibleTilesY = Math.ceil(canvas.height / tileHeightPx) + 1;

        // Zeichne die Kacheln
        for (let y = -1; y < visibleTilesY; y++) {
            for (let x = -1; x < visibleTilesX; x++) {
                // Berechne die Position jeder Kachel
                const tileXPos = xOffset + x * tileWidthPx + (y % 2 !== 0 ? rowOffset : 0);
                const tileYPos = yOffset + y * tileHeightPx;

                // Zeichne die Kachelumrisse
                ctx.beginPath();
                ctx.rect(tileXPos, tileYPos, tileWidthPx, tileHeightPx);
                ctx.strokeStyle = "#999";
                ctx.lineWidth = 0.5;
                ctx.stroke();
            }
        }

        // Zeichne einen hervorgehobenen Rahmen um den Bodenbelag
        ctx.beginPath();
        ctx.rect(xOffset, yOffset, visibleTilesX * tileWidthPx, visibleTilesY * tileHeightPx);
        ctx.strokeStyle = "#0066cc";
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.stroke();

        ctx.restore();
    };

    // Event-Handler für Mausklicks
    const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!editable) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        // Berechne die Position im Canvas-Koordinatensystem
        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) / scale;
        const y = (e.clientY - rect.top) / scale;

        switch (currentTool) {
            case "wall":
                handleWallDrawing(x, y);
                break;
            case "door":
                handleDoorPlacement(x, y);
                break;
            case "select":
                handleSelection(x, y);
                break;
            case "move":
                // Wird durch mousedown/move/up events behandelt
                break;
        }
    };

    // Handler für das Zeichnen von Wänden
    const handleWallDrawing = (x: number, y: number) => {
        // Wenn noch keine Wand gezeichnet wird, eine neue erstellen
        if (!drawingWall) {
            const newWall = {
                id: crypto.randomUUID(),
                points: [[Math.round(x), Math.round(y)]] as [number, number][],
            };
            setDrawingWall(newWall);
            return;
        }

        // Punkt zur aktuellen Wand hinzufügen
        const updatedWall = {
            ...drawingWall,
            points: [...drawingWall.points, [Math.round(x), Math.round(y)] as [number, number]],
        };
        setDrawingWall(updatedWall);

        // Nach dem dritten Punkt oder bei Doppelklick die Wand fertigstellen
        if (updatedWall.points.length > 2) {
            const newWall: Wall = {
                id: drawingWall.id,
                points: drawingWall.points,
                thickness: 10, // Standarddicke, könnte anpassbar sein
            };

            const updatedFloor = {
                ...floor,
                walls: [...floor.walls, newWall],
            };

            if (onFloorUpdate) {
                onFloorUpdate(updatedFloor);
            }

            setDrawingWall(null);
        }
    };

    // Handler für das Platzieren von Türen
    const handleDoorPlacement = (x: number, y: number) => {
        const newDoor: Door = {
            id: crypto.randomUUID(),
            position: [Math.round(x), Math.round(y)],
            width: 80, // Standardbreite 80cm
            rotation: 0, // Standard-Rotation
        };

        const updatedFloor = {
            ...floor,
            doors: [...floor.doors, newDoor],
        };

        if (onFloorUpdate) {
            onFloorUpdate(updatedFloor);
        }
    };

    // Handler für die Auswahl von Elementen
    const handleSelection = (x: number, y: number) => {
        // Hier könnte eine Logik zur Elementauswahl implementiert werden
        // Z.B. um Elemente zu markieren oder zum Bearbeiten auszuwählen
        console.log("Element ausgewählt bei:", x, y);
    };

    // Handler für den Beginn des Drag & Drop
    const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!editable || currentTool !== "move") return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) / scale;
        const y = (e.clientY - rect.top) / scale;

        // Hier könnte eine Logik implementiert werden, um festzustellen,
        // welches Element angeklickt wurde (Wand, Tür oder Bodenbelag)

        // Beispiel: Prüfe, ob ein Bodenbelag angeklickt wurde
        const clickedFlooring = floorings.find(flooring => {
            const xPos = flooring.position[0];
            const yPos = flooring.position[1];
            const width = flooring.tileWidth * 5; // Vereinfachte Breite für Klickerkennung
            const height = flooring.tileHeight * 5; // Vereinfachte Höhe für Klickerkennung

            return x >= xPos && x <= xPos + width && y >= yPos && y <= yPos + height;
        });

        if (clickedFlooring) {
            setDragItem({
                type: "flooring",
                id: clickedFlooring.id,
                startPos: [...clickedFlooring.position] as [number, number],
                offset: [x - clickedFlooring.position[0], y - clickedFlooring.position[1]] as [
                    number,
                    number,
                ],
            });
        }
    };

    // Handler für die Bewegung während des Drag & Drop
    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!dragItem) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) / scale;
        const y = (e.clientY - rect.top) / scale;

        if (dragItem.type === "flooring") {
            const flooring = floorings.find(f => f.id === dragItem.id);
            if (flooring && onFlooringPositionUpdate) {
                const newX = Math.round(x - dragItem.offset[0]);
                const newY = Math.round(y - dragItem.offset[1]);
                onFlooringPositionUpdate(flooring, [newX, newY]);
            }
        }
    };

    // Handler für das Ende des Drag & Drop
    const handleMouseUp = () => {
        setDragItem(null);
    };

    return (
        <div className="relative">
            {editable && (
                <div className="flex flex-wrap gap-2 mb-4">
                    <Button
                        icon="pi pi-arrows-alt"
                        className={`${currentTool === "move" ? "p-button-info" : "p-button-secondary"}`}
                        onClick={() => setCurrentTool("move")}
                        tooltip="Element verschieben"
                    />
                    <Button
                        icon="pi pi-pencil"
                        className={`${currentTool === "wall" ? "p-button-info" : "p-button-secondary"}`}
                        onClick={() => setCurrentTool("wall")}
                        tooltip="Wand zeichnen"
                    />
                    <Button
                        icon="pi pi-sign-in"
                        className={`${currentTool === "door" ? "p-button-info" : "p-button-secondary"}`}
                        onClick={() => setCurrentTool("door")}
                        tooltip="Tür platzieren"
                    />
                    <Button
                        icon="pi pi-search"
                        className={`${currentTool === "select" ? "p-button-info" : "p-button-secondary"}`}
                        onClick={() => setCurrentTool("select")}
                        tooltip="Element auswählen"
                    />
                </div>
            )}

            <canvas
                ref={canvasRef}
                width={800}
                height={600}
                className="border border-gray-300 bg-white"
                onClick={handleCanvasClick}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            />

            <div className="mt-2 text-sm text-gray-500">
                Aktuelles Werkzeug:{" "}
                {currentTool === "move"
                    ? "Verschieben"
                    : currentTool === "wall"
                      ? "Wand zeichnen"
                      : currentTool === "door"
                        ? "Tür platzieren"
                        : "Element auswählen"}
            </div>
        </div>
    );
}
