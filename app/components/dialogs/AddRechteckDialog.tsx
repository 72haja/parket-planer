"use client";

import { useEffect, useState } from "react";
import { useAddRecheckDialog } from "@/app/provider/AddRecheckDialogProvider";
import { useClick } from "@/app/provider/ClickProvider";
import { useRechtecke } from "@/app/provider/RechteckeProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Rechteck } from "@/types";

export const AddRechteckDialog = () => {
    const { addRechteck } = useRechtecke();
    const { showDialog, closeDialog } = useAddRecheckDialog();
    const {
        clickPosition: { x: xPosition, y: yPosition },
    } = useClick();

    const [hoehe, setHoehe] = useState(0);
    const [breite, setBreite] = useState(0);
    const [posX, setPosX] = useState(0);
    const [posY, setPosY] = useState(0);

    const handleSave = () => {
        const newRechteck: Rechteck = {
            isDragging: false,
            x1: posX,
            x2: posX + breite,
            y1: posY,
            y2: posY + hoehe,
        };
        addRechteck(newRechteck);
        handleCloseDialog();
    };

    const handleCloseDialog = () => {
        setHoehe(0);
        setBreite(0);
        setPosX(0);
        setPosY(0);

        closeDialog();
    };

    useEffect(() => {
        setPosX(xPosition);
    }, [xPosition]);

    useEffect(() => {
        setPosY(yPosition);
    }, [yPosition]);

    if (!showDialog) return null;

    return (
        <div className="fixed top-0 left-0 w-full h-full bg-gray-800/25 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-md p-4 w-1/2">
                <h2 className="text-lg font-bold mb-4">Rechteck hinzufügen</h2>
                <form onSubmit={handleSave}>
                    <label className="block text-lg font-medium mb-2">
                        Höhe
                        <Input
                            type="number"
                            step="0.1"
                            value={hoehe}
                            onChange={e => setHoehe(parseFloat(e.target.value))}
                        />
                    </label>
                    <label className="block text-lg font-medium mb-2">
                        Breite
                        <Input
                            type="number"
                            step="0.1"
                            value={breite}
                            onChange={e => setBreite(parseFloat(e.target.value))}
                        />
                    </label>
                    <label className="block text-lg font-medium mb-2">
                        X Position
                        <Input
                            type="number"
                            step="0.1"
                            value={posX}
                            onChange={e => setPosX(parseFloat(e.target.value))}
                        />
                    </label>
                    <label className="block text-lg font-medium mb-2">
                        Y Position
                        <Input
                            type="number"
                            step="0.1"
                            value={posY}
                            onChange={e => setPosY(parseFloat(e.target.value))}
                        />
                    </label>
                    <Button type="submit" onClick={handleSave}>
                        Speichern
                    </Button>
                    <Button onClick={handleCloseDialog}>Abbrechen</Button>
                </form>
            </div>
        </div>
    );
};
