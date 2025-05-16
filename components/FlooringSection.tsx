import React, { FC, useEffect, useState } from "react";
import clsx from "clsx";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { TabPanel, TabView } from "primereact/tabview";
import { v4 as uuid } from "uuid";
import FlooringConfigurator from "@/components/FlooringConfigurator";
import { Floor, Flooring } from "@/lib/supabase";

interface FlooringSectionProps {
    currentFloor: Floor | undefined;
    currentFloorFloorings: Flooring[];
    selectedFlooringId: string | null;
    setSelectedFlooringId: (id: string | null) => void;
    handleDeleteFlooring: (id: string) => void;
    handleAddFlooring: (flooring: Omit<Flooring, "id">) => void;
    optimisticFloorings: Flooring[];
    setOptimisticFloorings: React.Dispatch<React.SetStateAction<Flooring[]>>;
    handleUpdateFlooring: (flooring: Flooring) => void;
}

const FlooringSection: FC<FlooringSectionProps> = ({
    currentFloor,
    currentFloorFloorings,
    selectedFlooringId,
    setSelectedFlooringId,
    handleDeleteFlooring,
    handleAddFlooring,
    optimisticFloorings,
    setOptimisticFloorings,
    handleUpdateFlooring,
}) => {
    const [isCreating, setIsCreating] = useState(false);
    const [editingFlooringId, setEditingFlooringId] = useState<string | null>(null);
    const [originFlooring, setOriginFlooring] = useState<Flooring | null>(null);

    useEffect(() => {
        setOriginFlooring(currentFloorFloorings.find(f => f.id === editingFlooringId) || null);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editingFlooringId]);

    // Add optimistic flooring when creating a new one
    const handleStartCreate = () => {
        if (!currentFloor) {
            return;
        }
        setIsCreating(true);
        const tempId = "optimistic-" + uuid();
        const newFlooring: Flooring = {
            id: tempId,
            name: "Neuer Bodenbelag",
            tileWidth: 60,
            tileHeight: 30,
            offset: 0,
            position: [0, 0],
            floorId: currentFloor.id,
        };
        setOptimisticFloorings([...optimisticFloorings, newFlooring]);
        setSelectedFlooringId(tempId);
    };

    const handleFlooringChanged = (flooring: Flooring) => {
        const flooringDoesAlreadyExist = currentFloorFloorings.some(f => f.id === flooring.id);
        if (flooringDoesAlreadyExist) {
            handleUpdateFlooring(flooring);
            return;
        }

        setOptimisticFloorings(floorings =>
            floorings.map(f => (f.id === flooring.id ? flooring : f))
        );
    };

    // Remove optimistic flooring if creation is cancelled
    const handleCancelCreate = () => {
        setIsCreating(false);
        setOptimisticFloorings(floorings => floorings.filter(f => !f.id.startsWith("optimistic-")));
        setSelectedFlooringId(null);
    };

    // When saving, replace optimistic with real
    const handleSaveFlooring = (flooring: Omit<Flooring, "id">) => {
        handleAddFlooring(flooring);
        setIsCreating(false);
        setOptimisticFloorings(floorings => floorings.filter(f => !f.id.startsWith("optimistic-")));
    };

    // Merge optimistic and real floorings for display
    const allFloorings = [...currentFloorFloorings, ...optimisticFloorings];

    return (
        <Card title="Bodenbeläge">
            <div className="mb-3">
                <TabView
                    className="[&>.p-tabview-panels]:!px-0"
                    onBeforeTabChange={() => {
                        if (isCreating) {
                            handleCancelCreate();
                        }
                        setEditingFlooringId(null);
                    }}>
                    <TabPanel header="Liste">
                        {allFloorings.length === 0 ? (
                            <p className="text-gray-500 py-2">
                                Keine Bodenbeläge für dieses Stockwerk definiert.
                            </p>
                        ) : (
                            <ul className="list-none p-0">
                                {allFloorings.map(flooring => (
                                    <li
                                        key={flooring.id}
                                        className={clsx(
                                            `p-2 border-b cursor-pointer flex justify-between items-center`,
                                            selectedFlooringId === flooring.id && "bg-blue-50"
                                        )}
                                        onClick={() =>
                                            setSelectedFlooringId(
                                                selectedFlooringId === flooring.id
                                                    ? null
                                                    : flooring.id
                                            )
                                        }>
                                        <div>
                                            <div className="font-medium">{flooring.name}</div>
                                            <div className="text-sm text-gray-500">
                                                {flooring.tileWidth}×{flooring.tileHeight} cm
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                icon="pi pi-pencil"
                                                className="p-button-rounded p-button-sm p-button-outlined"
                                                onClick={e => {
                                                    e.stopPropagation();
                                                    setEditingFlooringId(flooring.id);
                                                }}
                                            />
                                            <Button
                                                icon="pi pi-trash"
                                                className="p-button-rounded p-button-danger p-button-sm"
                                                onClick={e => {
                                                    e.stopPropagation();
                                                    handleDeleteFlooring(flooring.id);
                                                }}
                                            />
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                        {/* Edit dialog below the list */}
                        {editingFlooringId && (
                            <div className="mt-4">
                                <FlooringConfigurator
                                    floorId={currentFloor?.id || ""}
                                    onSave={flooring => {
                                        handleFlooringChanged({
                                            ...flooring,
                                            id: editingFlooringId || "",
                                        });
                                        setEditingFlooringId(null);
                                    }}
                                    existingFlooring={allFloorings.find(
                                        f => f.id === editingFlooringId
                                    )}
                                    setSelectedFlooringId={setSelectedFlooringId}
                                    onCancel={() => {
                                        if (originFlooring) {
                                            handleUpdateFlooring({
                                                ...originFlooring,
                                                id: editingFlooringId || "",
                                            });
                                        }
                                        setEditingFlooringId(null);
                                    }}
                                    handleFlooringChanged={handleFlooringChanged}
                                />
                            </div>
                        )}
                    </TabPanel>
                    <TabPanel header="Neu">
                        {currentFloor && isCreating ? (
                            <FlooringConfigurator
                                floorId={currentFloor.id}
                                onSave={handleSaveFlooring}
                                existingFlooring={optimisticFloorings[0]}
                                setSelectedFlooringId={setSelectedFlooringId}
                                onCancel={handleCancelCreate}
                                handleFlooringChanged={handleFlooringChanged}
                            />
                        ) : (
                            <Button
                                label="Neuen Bodenbelag anlegen"
                                onClick={handleStartCreate}
                                className="w-full"
                            />
                        )}
                    </TabPanel>
                </TabView>
            </div>
            {currentFloor && null}
        </Card>
    );
};

export default FlooringSection;
