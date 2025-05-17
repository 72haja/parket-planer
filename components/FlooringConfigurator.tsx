"use client";

import { FC, useEffect, useState } from "react";
import { Dropdown } from "primereact/dropdown";
import { Panel } from "primereact/panel";
import { Slider } from "primereact/slider";
import { PrimeButton } from "@/lib/designSystem/atoms/PrimeButton";
import { PrimeInputNumber } from "@/lib/designSystem/atoms/PrimeInputNumber";
import { PrimeInputText } from "@/lib/designSystem/atoms/PrimeInputText";
import type { Flooring } from "@/lib/supabase";
import { isEqual } from "@/lib/utils";

interface FlooringConfiguratorProps {
    floorId: string;
    onSave: (flooring: Omit<Flooring, "id">) => void;
    existingFlooring?: Flooring;
    setSelectedFlooringId?: (id: string | null) => void;
    onCancel?: () => void;
    handleFlooringChanged?: (flooring: Flooring) => void;
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
    { label: "benutzerdefinierter Versatz", value: -1 },
];

interface OffsetSelectorProps {
    selectedOffset: number;
    setSelectedOffset: (v: number) => void;
    customOffset: number | null;
    setCustomOffset: (v: number | null) => void;
}

const OffsetSelector: FC<OffsetSelectorProps> = ({
    selectedOffset,
    setSelectedOffset,
    customOffset,
    setCustomOffset,
}) => {
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
                <div className="flex items-center gap-2">
                    <Slider
                        value={customOffset ?? 0}
                        onChange={e => setCustomOffset(typeof e.value === "number" ? e.value : 0)}
                        min={0}
                        max={1}
                        step={0.01}
                        className="w-full"
                    />
                    <span className="w-12 text-right tabular-nums">
                        {(customOffset ?? 0).toFixed(2)}
                    </span>
                </div>
            )}
        </div>
    );
};

interface TileSizeInputsProps {
    tileWidth: number;
    setTileWidth: (v: number) => void;
    tileHeight: number;
    setTileHeight: (v: number) => void;
}

const TileSizeInputs: FC<TileSizeInputsProps> = ({
    tileWidth,
    setTileWidth,
    tileHeight,
    setTileHeight,
}) => {
    return (
        <div className="grid grid-cols-1 gap-4 mb-4">
            <div>
                <label className="block mb-1 font-medium">Fliesenbreite (cm)</label>
                <PrimeInputNumber
                    value={tileWidth}
                    onValueChange={e => setTileWidth(e.value ?? 0)}
                    min={1}
                    max={500}
                    className="w-full"
                />
            </div>
            <div>
                <label className="block mb-1 font-medium">Fliesenhöhe (cm)</label>
                <PrimeInputNumber
                    value={tileHeight}
                    onValueChange={e => setTileHeight(e.value ?? 0)}
                    min={1}
                    max={500}
                    className="w-full"
                />
            </div>
        </div>
    );
};

export const FlooringConfigurator: FC<FlooringConfiguratorProps> = ({
    floorId,
    onSave,
    existingFlooring,
    setSelectedFlooringId,
    onCancel,
    handleFlooringChanged,
}) => {
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

    useEffect(() => {
        if (existingFlooring?.floorId === floorId) {
            return;
        }

        // If this is a new flooring (no id), select it immediately
        if (!existingFlooring && setSelectedFlooringId) {
            setSelectedFlooringId(null); // Deselect any previous
        } else if (existingFlooring && setSelectedFlooringId) {
            setSelectedFlooringId(existingFlooring.id);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [existingFlooring]);

    const getEffectiveOffset = () => {
        if (selectedOffset == null) {
            return 0;
        }
        if (selectedOffset === -1 && customOffset !== null) {
            return customOffset;
        }
        return selectedOffset;
    };

    useEffect(() => {
        // Check if the flooring has changed
        const flooringChanged =
            existingFlooring &&
            !isEqual(
                {
                    id: existingFlooring.id,
                    name,
                    tileWidth,
                    tileHeight,
                    offset: getEffectiveOffset(),
                    position,
                    floorId,
                },
                existingFlooring
            );

        if (!flooringChanged) {
            return;
        }

        if (handleFlooringChanged && existingFlooring) {
            handleFlooringChanged({
                id: existingFlooring.id,
                name,
                tileWidth,
                tileHeight,
                offset: getEffectiveOffset(),
                position,
                floorId,
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        name,
        tileWidth,
        tileHeight,
        selectedOffset,
        customOffset,
        position,
        existingFlooring,
        floorId,
    ]);

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
                    <PrimeInputText
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
                <div className="flex gap-2">
                    <PrimeButton
                        label="Speichern"
                        icon="pi pi-save"
                        onClick={handleSave}
                        className="w-full"
                    />
                    {onCancel && (
                        <PrimeButton
                            label="Abbrechen"
                            icon="pi pi-times"
                            onClick={onCancel}
                            className="w-full p-button-secondary"
                        />
                    )}
                </div>
            </div>
        </Panel>
    );
};
