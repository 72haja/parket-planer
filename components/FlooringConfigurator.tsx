"use client";

import React, { useState } from "react";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { InputText } from "primereact/inputtext";
import { Panel } from "primereact/panel";
import type { Flooring } from "@/lib/supabase";

interface FlooringConfiguratorProps {
    floorId: string;
    onSave: (flooring: Omit<Flooring, "id">) => void;
    existingFlooring?: Flooring;
}

interface OptionType {
    label: string;
    value: number;
}

const offsetOptions: OptionType[] = [
    { label: "Kein Versatz", value: 0 },
    { label: "1/2 Versatz", value: 0.5 },
    { label: "1/3 Versatz", value: 0.33 },
    { label: "1/4 Versatz", value: 0.25 },
    { label: "Zufälliger Versatz", value: -1 },
];

function OffsetSelector({
    selectedOffset,
    setSelectedOffset,
    customOffset,
    setCustomOffset,
}: {
    selectedOffset: number;
    setSelectedOffset: (v: number) => void;
    customOffset: number | null;
    setCustomOffset: (v: number | null) => void;
}) {
    return (
        <div className="mb-4">
            <label className="block mb-1 font-medium">Versatz</label>
            <Dropdown
                value={selectedOffset}
                options={offsetOptions}
                onChange={e => setSelectedOffset(e.value)}
                className="w-full mb-2"
                placeholder="Versatz wählen"
            />
            {selectedOffset === -1 && (
                <InputNumber
                    value={customOffset ?? undefined}
                    onValueChange={e => setCustomOffset(e.value ?? null)}
                    min={0}
                    max={1}
                    step={0.01}
                    mode="decimal"
                    showButtons
                    buttonLayout="horizontal"
                    className="w-full"
                    placeholder="Eigener Versatz (0-1)"
                />
            )}
        </div>
    );
}

function TileSizeInputs({
    tileWidth,
    setTileWidth,
    tileHeight,
    setTileHeight,
}: {
    tileWidth: number;
    setTileWidth: (v: number) => void;
    tileHeight: number;
    setTileHeight: (v: number) => void;
}) {
    return (
        <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
                <label className="block mb-1 font-medium">Fliesenbreite (cm)</label>
                <InputNumber
                    value={tileWidth}
                    onValueChange={e => setTileWidth(e.value ?? 0)}
                    min={1}
                    max={500}
                    className="w-full"
                />
            </div>
            <div>
                <label className="block mb-1 font-medium">Fliesenhöhe (cm)</label>
                <InputNumber
                    value={tileHeight}
                    onValueChange={e => setTileHeight(e.value ?? 0)}
                    min={1}
                    max={500}
                    className="w-full"
                />
            </div>
        </div>
    );
}

export default function FlooringConfigurator({
    floorId,
    onSave,
    existingFlooring,
}: FlooringConfiguratorProps) {
    const [name, setName] = useState(existingFlooring?.name || "Neuer Bodenbelag");
    const [tileWidth, setTileWidth] = useState(existingFlooring?.tileWidth || 60);
    const [tileHeight, setTileHeight] = useState(existingFlooring?.tileHeight || 30);
    const [selectedOffset, setSelectedOffset] = useState<number>(
        offsetOptions.find(o => o.value === existingFlooring?.offset)?.value ||
            offsetOptions[0]?.value ||
            0
    );
    const [customOffset, setCustomOffset] = useState<number | null>(
        existingFlooring?.offset !== undefined &&
            !offsetOptions.some(o => o.value === existingFlooring.offset)
            ? existingFlooring.offset
            : null
    );
    const [position] = useState<[number, number]>(existingFlooring?.position || [0, 0]);

    const getEffectiveOffset = () => {
        if (selectedOffset == null) return 0;
        if (selectedOffset === -1 && customOffset !== null) return customOffset;
        return selectedOffset === -1 ? Math.random() : selectedOffset;
    };

    const handleSave = () => {
        onSave({
            name,
            tileWidth,
            tileHeight,
            offset: getEffectiveOffset(),
            position,
            floorId,
        });
    };

    return (
        <Panel header="Bodenbelag konfigurieren" className="mb-4">
            <div className="space-y-4">
                <div>
                    <label className="block mb-1 font-medium">Name</label>
                    <InputText
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="w-full"
                        placeholder="Bodenbelag-Name"
                    />
                </div>
                <TileSizeInputs
                    tileWidth={tileWidth}
                    setTileWidth={setTileWidth}
                    tileHeight={tileHeight}
                    setTileHeight={setTileHeight}
                />
                <OffsetSelector
                    selectedOffset={selectedOffset}
                    setSelectedOffset={setSelectedOffset}
                    customOffset={customOffset}
                    setCustomOffset={setCustomOffset}
                />
                {/* Positionseingabe könnte hier als weiteres UI-Element ergänzt werden */}
                <Button
                    label="Speichern"
                    icon="pi pi-save"
                    onClick={handleSave}
                    className="w-full"
                />
            </div>
        </Panel>
    );
}
