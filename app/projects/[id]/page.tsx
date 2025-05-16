"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import clsx from "clsx";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { ProgressSpinner } from "primereact/progressspinner";
import { TabPanel, TabView } from "primereact/tabview";
import { Toast } from "primereact/toast";
import FlooringConfigurator from "@/components/FlooringConfigurator";
import FloorplanCanvas from "@/components/FloorplanCanvas";
import Floors from "@/components/Floors";
import { Floor, Flooring, FloorplanData, Project, supabase } from "@/lib/supabase";

export default function ProjectPage() {
    const params = useParams();
    const projectId = params.id as string;
    const isDemo = projectId === "demo";
    const router = useRouter();
    const toast = useRef<Toast>(null);

    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [selectedFlooringId, setSelectedFlooringId] = useState<string | null>(null);

    // Lade das Projekt beim Seitenladen
    useEffect(() => {
        const loadProject = async () => {
            // Demo-Projekt mit Beispieldaten erstellen
            if (isDemo) {
                const demoProject: Project = {
                    id: "demo",
                    name: "Demo-Projekt",
                    user_id: "demo",
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    data: {
                        floors: [
                            {
                                id: "demo-floor-1",
                                name: "Erdgeschoss",
                                rooms: [
                                    {
                                        id: "demo-wall-1",
                                        x: 50,
                                        y: 50,
                                        width: 200,
                                        height: 100,
                                    },
                                ],
                                doors: [
                                    {
                                        id: "demo-door-1",
                                        position: [200, 50],
                                        width: 80,
                                        rotation: 0,
                                    },
                                ],
                            },
                        ],
                        selectedFloor: 0,
                        floorings: [],
                    },
                };
                setProject(demoProject);
                setLoading(false);
                return;
            }

            try {
                // Echtes Projekt aus der Datenbank laden
                const { data, error } = await supabase
                    .from("projects")
                    .select("*")
                    .eq("id", projectId)
                    .single();

                if (error) throw error;

                setProject(data);
            } catch (err: unknown) {
                const error = err as Error;
                console.error("Fehler beim Laden des Projekts:", error);
                toast.current?.show({
                    severity: "error",
                    summary: "Fehler",
                    detail: "Projekt konnte nicht geladen werden: " + error.message,
                });
                // Bei Fehler zur Projektübersicht zurückkehren
                router.push("/projects");
            } finally {
                setLoading(false);
            }
        };

        loadProject();
    }, [projectId, isDemo, router]);

    // Speichert Änderungen am Projekt in Supabase
    const saveProject = async (newData: FloorplanData) => {
        if (isDemo) {
            // Im Demo-Modus nur lokale Änderungen vornehmen
            setProject(prev => (prev ? { ...prev, data: newData } : null));
            return;
        }

        if (!project) return;

        try {
            setSaving(true);
            const { error } = await supabase
                .from("projects")
                .update({ data: newData })
                .eq("id", projectId);

            if (error) throw error;

            setProject(prev => (prev ? { ...prev, data: newData } : null));
            toast.current?.show({
                severity: "success",
                summary: "Gespeichert",
                detail: "Projekt wurde erfolgreich gespeichert",
            });
        } catch (err: unknown) {
            const error = err as Error;
            console.error("Fehler beim Speichern:", error);
            toast.current?.show({
                severity: "error",
                summary: "Fehler",
                detail: "Änderungen konnten nicht gespeichert werden: " + error.message,
            });
        } finally {
            setSaving(false);
        }
    };

    // Handler für Aktualisierung eines Stockwerks
    const handleFloorUpdate = (updatedFloor: Floor) => {
        if (!project) return;

        const updatedFloors = project.data.floors.map(floor =>
            floor.id === updatedFloor.id ? updatedFloor : floor
        );

        saveProject({
            ...project.data,
            floors: updatedFloors,
        });
    };

    // Neuer Handler für das Hinzufügen eines neuen Stockwerks
    const handleAddFloor = (floor: Floor) => {
        if (!project) return;

        saveProject({
            ...project.data,
            floors: [...project.data.floors, floor],
            // Nach dem Hinzufügen das neue Stockwerk auswählen
            selectedFloor: project.data.floors.length,
        });
    };

    // Neuer Handler für das Löschen eines Stockwerks
    const handleDeleteFloor = (floorId: string) => {
        if (!project) return;

        // Index des zu löschenden Stockwerks finden
        const floorIndex = project.data.floors.findIndex(floor => floor.id === floorId);
        if (floorIndex === -1) return;

        // Stockwerk löschen
        const newFloors = project.data.floors.filter(floor => floor.id !== floorId);

        // Alle Bodenbeläge dieses Stockwerks entfernen
        const newFloorings = project.data.floorings.filter(
            flooring => flooring.floorId !== floorId
        );

        // Neue selectedFloor berechnen
        let newSelectedFloor = project.data.selectedFloor;
        if (floorIndex <= project.data.selectedFloor && newSelectedFloor > 0) {
            newSelectedFloor--;
        }

        saveProject({
            ...project.data,
            floors: newFloors,
            floorings: newFloorings,
            selectedFloor: newSelectedFloor,
        });
    };

    // Neuer Handler für Stockwerk-Auswahl
    const handleSelectFloor = (index: number) => {
        if (!project || project.data.selectedFloor === index) return;

        saveProject({
            ...project.data,
            selectedFloor: index,
        });
    };

    // Handler für das Hinzufügen eines neuen Bodenbelags
    const handleAddFlooring = (flooring: Omit<Flooring, "id">) => {
        if (!project) return;

        const newFlooring: Flooring = {
            ...flooring,
            id: crypto.randomUUID(),
        };

        saveProject({
            ...project.data,
            floorings: [...project.data.floorings, newFlooring],
        });

        // Wähle den neuen Bodenbelag aus
        setSelectedFlooringId(newFlooring.id);
    };

    // Handler für das Löschen eines Bodenbelags
    const handleDeleteFlooring = (flooringId: string) => {
        if (!project) return;

        saveProject({
            ...project.data,
            floorings: project.data.floorings.filter(f => f.id !== flooringId),
        });

        if (selectedFlooringId === flooringId) {
            setSelectedFlooringId(null);
        }
    };

    // Zeige Ladeanzeige während Projekt geladen wird
    if (loading) {
        return (
            <div className="flex justify-center items-center p-8">
                <Card className="w-full max-w-md">
                    <div className="flex flex-col items-center">
                        <ProgressSpinner style={{ width: "50px", height: "50px" }} />
                        <p className="mt-3">Projekt wird geladen...</p>
                    </div>
                </Card>
            </div>
        );
    }

    // Wenn kein Projekt gefunden wurde
    if (!project) {
        return (
            <div className="flex justify-center items-center p-8">
                <Card className="w-full max-w-md">
                    <div className="text-center">
                        <i className="pi pi-exclamation-triangle text-yellow-500 text-4xl mb-3"></i>
                        <h2>Projekt nicht gefunden</h2>
                        <p className="mb-3">
                            Das angeforderte Projekt konnte nicht gefunden werden.
                        </p>
                        <Button
                            label="Zurück zur Übersicht"
                            icon="pi pi-arrow-left"
                            onClick={() => router.push("/projects")}
                        />
                    </div>
                </Card>
            </div>
        );
    }

    // Aktuelles ausgewähltes Stockwerk
    const currentFloor = project.data.floors[project.data.selectedFloor];

    // Bodenbeläge für das aktuelle Stockwerk
    const currentFloorFloorings = currentFloor
        ? project.data.floorings.filter(f => f.floorId === currentFloor.id)
        : [];

    // Falls ein bestimmter Bodenbelag ausgewählt wurde
    const selectedFlooring = selectedFlooringId
        ? project.data.floorings.find(f => f.id === selectedFlooringId)
        : undefined;

    return (
        <div className="flex flex-col gap-4">
            <Toast ref={toast} />

            <div className="flex justify-between items-center mb-2">
                <h1 className="text-2xl font-bold">
                    {project.name}{" "}
                    {isDemo && <span className="text-sm text-gray-500">(Demo-Modus)</span>}
                </h1>
                <div className="flex gap-2">
                    {saving && <ProgressSpinner style={{ width: "20px", height: "20px" }} />}
                    {!isDemo && (
                        <Button
                            label="Zurück"
                            icon="pi pi-arrow-left"
                            className="p-button-outlined"
                            onClick={() => router.push("/projects")}
                        />
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Linke Seitenleiste - Stockwerke und Controls */}
                <div className="lg:col-span-1 flex flex-col gap-4">
                    {/* Stockwerksauswahl */}
                    <Card>
                        <Floors
                            floors={project.data.floors}
                            selectedFloorIndex={project.data.selectedFloor}
                            onSelectFloor={handleSelectFloor}
                            onUpdateFloor={handleFloorUpdate}
                            onAddFloor={handleAddFloor}
                            onDeleteFloor={handleDeleteFloor}
                        />
                    </Card>

                    {/* Bodenbeläge */}
                    <Card title="Bodenbeläge">
                        <div className="mb-3">
                            <TabView>
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
                                                        selectedFlooringId === flooring.id &&
                                                            "bg-blue-50"
                                                    )}
                                                    onClick={() =>
                                                        setSelectedFlooringId(
                                                            selectedFlooringId === flooring.id
                                                                ? null
                                                                : flooring.id
                                                        )
                                                    }>
                                                    <div>
                                                        <div className="font-medium">
                                                            {flooring.name}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {flooring.tileWidth}×
                                                            {flooring.tileHeight} cm
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
                </div>

                {/* Hauptbereich - Canvas */}
                <div className="lg:col-span-2">
                    {currentFloor && (
                        <Card className="max-h-[calc(100vh-(58+32*2+58+16)*1px)] h-full [&>.p-card-body]:h-full [&>div>.p-card-content]:h-full">
                            <div className="mb-3 h-full">
                                <FloorplanCanvas
                                    rectangles={currentFloor.rooms}
                                    setRectangles={rectangles =>
                                        handleFloorUpdate({ ...currentFloor, rooms: rectangles })
                                    }
                                />
                            </div>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
