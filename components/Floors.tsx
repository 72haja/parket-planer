"use client";

import { FC, useState } from "react";
import { confirmDialog } from "primereact/confirmdialog";
import { Panel } from "primereact/panel";
import { v4 as uuid } from "uuid";
import { PrimeButton } from "@/lib/designSystem/atoms/PrimeButton";
import { PrimeInputText } from "@/lib/designSystem/atoms/PrimeInputText";
import type { Floor } from "@/lib/supabase";

interface FloorsProps {
    floors: Floor[];
    selectedFloorIndex: number;
    onSelectFloor: (index: number) => void;
    onUpdateFloor: (floor: Floor) => void;
    onAddFloor: (floor: Floor) => void;
    onDeleteFloor: (floorId: string) => void;
}

export const Floors: FC<FloorsProps> = ({
    floors,
    selectedFloorIndex,
    onSelectFloor,
    onUpdateFloor,
    onAddFloor,
    onDeleteFloor,
}) => {
    const [editingFloorId, setEditingFloorId] = useState<string | null>(null);
    const [newFloorName, setNewFloorName] = useState<string>("Neues Stockwerk");
    const [editedName, setEditedName] = useState<string>("");

    // Handle selecting a floor
    const handleSelectFloor = (index: number) => {
        onSelectFloor(index);
    };

    // Handle updating a floor name
    const handleUpdateName = (floor: Floor) => {
        if (editedName.trim() === "") {
            return;
        }

        onUpdateFloor({
            ...floor,
            name: editedName.trim(),
        });
        setEditingFloorId(null);
    };

    // Start editing a floor name
    const startEditing = (floor: Floor) => {
        setEditingFloorId(floor.id);
        setEditedName(floor.name);
    };

    // Cancel editing a floor name
    const cancelEditing = () => {
        setEditingFloorId(null);
    };

    // Add a new floor
    const handleAddFloor = () => {
        if (newFloorName.trim() === "") {
            return;
        }

        const newFloor: Floor = {
            id: uuid(),
            name: newFloorName.trim(),
            rooms: [],
            doors: [],
        };

        onAddFloor(newFloor);
        setNewFloorName("");
    };

    // Delete a floor with confirmation
    const confirmDeleteFloor = (floor: Floor) => {
        confirmDialog({
            message: `Sind Sie sicher, dass Sie "${floor.name}" löschen möchten?`,
            header: "Stockwerk löschen",
            icon: "pi pi-exclamation-triangle",
            acceptClassName: "p-button-danger",
            accept: () => onDeleteFloor(floor.id),
            reject: () => {},
        });
    };

    return (
        <Panel header="Stockwerke" className="mb-4">
            <div className="mb-4">
                <ul className="list-none p-0 m-0">
                    {floors.map((floor, index) => (
                        <li key={floor.id} className="mb-2">
                            <div
                                className={`p-2 border ${selectedFloorIndex === index ? "bg-blue-50 border-blue-300" : "border-gray-300"} rounded-lg flex justify-between items-center`}>
                                <div
                                    className="flex-grow cursor-pointer"
                                    onClick={() => handleSelectFloor(index)}>
                                    {editingFloorId === floor.id ? (
                                        <div className="flex items-center gap-2">
                                            <PrimeInputText
                                                value={editedName}
                                                onChange={e => setEditedName(e.target.value)}
                                                className="w-full p-2"
                                                autoFocus
                                            />
                                            <PrimeButton
                                                label=""
                                                icon="pi pi-check"
                                                className="p-button-sm p-button-success"
                                                onClick={() => handleUpdateName(floor)}
                                            />
                                            <PrimeButton
                                                label=""
                                                icon="pi pi-times"
                                                className="p-button-sm p-button-secondary"
                                                onClick={cancelEditing}
                                            />
                                        </div>
                                    ) : (
                                        <span className="font-medium">{floor.name}</span>
                                    )}
                                </div>

                                {editingFloorId !== floor.id && (
                                    <div className="flex gap-2">
                                        <PrimeButton
                                            label=""
                                            icon="pi pi-pencil"
                                            className="p-button-sm p-button-outlined"
                                            onClick={e => {
                                                e.stopPropagation();
                                                startEditing(floor);
                                            }}
                                        />
                                        <PrimeButton
                                            label=""
                                            icon="pi pi-trash"
                                            className="p-button-sm p-button-danger p-button-outlined"
                                            onClick={e => {
                                                e.stopPropagation();
                                                confirmDeleteFloor(floor);
                                            }}
                                            disabled={floors.length <= 1}
                                            title={
                                                floors.length <= 1
                                                    ? "Mindestens ein Stockwerk muss existieren"
                                                    : "Stockwerk löschen"
                                            }
                                        />
                                    </div>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="grid grid-cols-[minmax(0,1fr)_max-content] gap-2 items-center w-full">
                <PrimeInputText
                    value={newFloorName}
                    onChange={e => setNewFloorName(e.target.value)}
                    placeholder="Stockwerkname"
                    className="flex-grow"
                />
                <PrimeButton label="" icon="pi pi-plus" onClick={handleAddFloor} />
            </div>
        </Panel>
    );
};
