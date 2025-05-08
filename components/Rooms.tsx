"use client";

import { useState } from "react";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { InputText } from "primereact/inputtext";
import { Panel } from "primereact/panel";
import { Slider } from "primereact/slider";
import type { Flooring } from "@/lib/supabase";
import { v4 as uuid } from "uuid";

interface FlooringConfiguratorProps {
    floorId: string;
    onSave: (flooring: Flooring) => void;
    existingFlooring?: Flooring;
}

interface OptionType {
    label: string;
    value: number;
}

// Voreingestellte Offset-Optionen
const offsetOptions: OptionType[] = [
    { label: "Kein Versatz", value: 0 },
    { label: "1/2 Versatz", value: 0.5 },
    { label: "1/3 Versatz", value: 0.33 },
    { label: "1/4 Versatz", value: 0.25 },
    { label: "Zufälliger Versatz", value: -1 }, // Spezialwert für zufälligen Versatz
];

export default function FlooringConfigurator({
    floorId,
    onSave,
    existingFlooring,
}: FlooringConfiguratorProps) {
    // Zustand für die Bodenkonfiguration
    const [name, setName] = useState(existingFlooring?.name || "Neuer Bodenbelag");
    const [tileWidth, setTileWidth] = useState(existingFlooring?.tileWidth || 60); // Standard: 60 cm
    const [tileHeight, setTileHeight] = useState(existingFlooring?.tileHeight || 30); // Standard: 30 cm
    const [selectedOffset, setSelectedOffset] = useState<OptionType>(
        offsetOptions.find(o => o.value === existingFlooring?.offset) ||
            offsetOptions[0] || {
                label: "Kein Versatz",
                value: 0,
            }
    );
    const [customOffset, setCustomOffset] = useState<number | null>(
        existingFlooring?.offset !== undefined &&
            !offsetOptions.some(o => o.value === existingFlooring.offset)
            ? existingFlooring.offset
            : null
    );
    const [position, _setPosition] = useState<[number, number]>(
        existingFlooring?.position || [0, 0]
    );

    // Berechnung des effektiven Versatzes
    const getEffectiveOffset = () => {
        if (!selectedOffset) {
            return 0;
        }

        if (selectedOffset.value === -1 && customOffset !== null) {
            return customOffset;
        }
        return selectedOffset.value === -1 ? Math.random() : selectedOffset.value;
    };

    // Handler für das Speichern der Konfiguration
    const handleSave = () => {
        onSave({
            name,
            tileWidth,
            tileHeight,
            offset: getEffectiveOffset(),
            position,
            floorId,
            id: existingFlooring?.id || uuid(),
        });
    };

    return (
        <Panel header="Bodenmuster-Konfiguration" className="mb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-field">
                    <label htmlFor="name" className="block mb-2">
                        Name
                    </label>
                    <InputText
                        id="name"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="w-full"
                    />
                </div>

                <div className="p-field">
                    <label htmlFor="tileWidth" className="block mb-2">
                        Fliesenbreite (cm)
                    </label>
                    <InputNumber
                        id="tileWidth"
                        value={tileWidth}
                        onValueChange={e => setTileWidth(e.value as number)}
                        min={10}
                        max={200}
                        className="w-full"
                    />
                </div>

                <div className="p-field">
                    <label htmlFor="tileHeight" className="block mb-2">
                        Fliesenhöhe (cm)
                    </label>
                    <InputNumber
                        id="tileHeight"
                        value={tileHeight}
                        onValueChange={e => setTileHeight(e.value as number)}
                        min={10}
                        max={200}
                        className="w-full"
                    />
                </div>

                <div className="p-field">
                    <label htmlFor="offset" className="block mb-2">
                        Versatz
                    </label>
                    <Dropdown
                        id="offset"
                        value={selectedOffset}
                        options={offsetOptions}
                        onChange={e => setSelectedOffset(e.value)}
                        className="w-full"
                    />
                </div>

                {selectedOffset && selectedOffset.value === -1 && (
                    <div className="p-field col-span-2">
                        <label htmlFor="customOffset" className="block mb-2">
                            Benutzerdefinierter Versatz (0-1)
                        </label>
                        <div className="flex gap-4 items-center">
                            <Slider
                                id="customOffset"
                                value={customOffset || 0}
                                onChange={e => setCustomOffset(e.value as number)}
                                min={0}
                                max={1}
                                step={0.01}
                                className="w-full"
                            />
                            <span className="min-w-[3rem] text-right">
                                {customOffset?.toFixed(2)}
                            </span>
                        </div>
                    </div>
                )}

                <div className="col-span-2 flex justify-end mt-4">
                    <Button label="Anwenden" icon="pi pi-check" onClick={handleSave} />
                </div>
            </div>
        </Panel>
    );
}
