import React from "react";
import clsx from "clsx";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { TabPanel, TabView } from "primereact/tabview";
import FlooringConfigurator from "@/components/FlooringConfigurator";
import { Floor, Flooring } from "@/lib/supabase";

interface FlooringSectionProps {
    currentFloor: Floor | undefined;
    currentFloorFloorings: Flooring[];
    selectedFlooringId: string | null;
    setSelectedFlooringId: (id: string | null) => void;
    handleDeleteFlooring: (id: string) => void;
    handleAddFlooring: (flooring: Omit<Flooring, "id">) => void;
    selectedFlooring?: Flooring;
}

const FlooringSection: React.FC<FlooringSectionProps> = ({
    currentFloor,
    currentFloorFloorings,
    selectedFlooringId,
    setSelectedFlooringId,
    handleDeleteFlooring,
    handleAddFlooring,
    selectedFlooring,
}) => {
    return (
        <Card title="Bodenbeläge">
            <div className="mb-3">
                <TabView className="[&>.p-tabview-panels]:!px-0">
                    <TabPanel header="Liste">
                        {currentFloorFloorings.length === 0 ? (
                            <p className="text-gray-500 py-2">
                                Keine Bodenbeläge für dieses Stockwerk definiert.
                            </p>
                        ) : (
                            <ul className="list-none p-0">
                                {currentFloorFloorings.map(flooring => (
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
                                        <Button
                                            icon="pi pi-trash"
                                            className="p-button-rounded p-button-danger p-button-sm"
                                            onClick={e => {
                                                e.stopPropagation();
                                                handleDeleteFlooring(flooring.id);
                                            }}
                                        />
                                    </li>
                                ))}
                            </ul>
                        )}
                    </TabPanel>
                    <TabPanel header="Neu">
                        {currentFloor && (
                            <FlooringConfigurator
                                floorId={currentFloor.id}
                                onSave={handleAddFlooring}
                                existingFlooring={selectedFlooring}
                            />
                        )}
                    </TabPanel>
                </TabView>
            </div>
        </Card>
    );
};

export default FlooringSection;
