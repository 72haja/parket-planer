import React, { useEffect, useState } from "react";
import { Rechteck } from "@/types";

interface AddRechteckDialogProps {
    showDialog: boolean;
    xPosition: number;
    yPosition: number;
    onSave: (rechteck: Rechteck) => void;
    onClose: () => void;
}

export const AddRechteckDialog = ({
    showDialog,
    xPosition,
    yPosition,
    onSave,
    onClose,
}: AddRechteckDialogProps) => {
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
        onSave(newRechteck);
        onClose();
    };

    useEffect(() => {
        setPosX(xPosition);
    }, [xPosition]);

    useEffect(() => {
        setPosY(yPosition);
    }, [yPosition]);

    if (!showDialog) return null;

    return (
        <div className="fixed top-0 left-0 w-full h-full bg-gray-800 bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-md p-4 w-1/2">
                <h2 className="text-lg font-bold mb-4">Rechteck hinzufügen</h2>
                <form onSubmit={handleSave}>
                    <label className="block text-lg font-medium mb-2">
                        Höhe
                        <input
                            type="number"
                            step="0.1"
                            value={hoehe}
                            onChange={e => setHoehe(parseFloat(e.target.value))}
                            className="w-full p-2 pl-10 text-lg border border-gray-400 rounded-lg focus:outline-none focus:ring focus:ring-blue-500"
                        />
                    </label>
                    <label className="block text-lg font-medium mb-2">
                        Breite
                        <input
                            type="number"
                            step="0.1"
                            value={breite}
                            onChange={e => setBreite(parseFloat(e.target.value))}
                            className="w-full p-2 pl-10 text-lg border border-gray-400 rounded-lg focus:outline-none focus:ring focus:ring-blue-500"
                        />
                    </label>
                    <label className="block text-lg font-medium mb-2">
                        X Position
                        <input
                            type="number"
                            step="0.1"
                            value={posX}
                            onChange={e => setPosX(parseFloat(e.target.value))}
                            className="w-full p-2 pl-10 text-lg border border-gray-400 rounded-lg focus:outline-none focus:ring focus:ring-blue-500"
                        />
                    </label>
                    <label className="block text-lg font-medium mb-2">
                        Y Position
                        <input
                            type="number"
                            step="0.1"
                            value={posY}
                            onChange={e => setPosY(parseFloat(e.target.value))}
                            className="w-full p-2 pl-10 text-lg border border-gray-400 rounded-lg focus:outline-none focus:ring focus:ring-blue-500"
                        />
                    </label>
                    <button
                        type="submit"
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg mt-4"
                        onClick={handleSave}>
                        Speichern
                    </button>
                    <button
                        onClick={close}
                        className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg mt-4 ml-4">
                        Abbrechen
                    </button>
                </form>
            </div>
        </div>
    );
};
