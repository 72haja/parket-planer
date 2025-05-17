"use client";

import { FC, useEffect, useState } from "react";
import { useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { DataTable } from "primereact/datatable";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Toast } from "primereact/toast";
import { Project, supabase } from "@/lib/supabase";

const ProjectManager: FC = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [newProjectName, setNewProjectName] = useState("");
    const [showNewProjectDialog, setShowNewProjectDialog] = useState(false);
    const [loading, setLoading] = useState(true);
    const toast = useRef<Toast>(null);
    const router = useRouter();

    // Laden der Projekte beim ersten Rendering
    useEffect(() => {
        loadProjects();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Projekte aus Supabase laden
    const loadProjects = async () => {
        try {
            setLoading(true);
            const { data: user } = await supabase.auth.getUser();

            if (!user.user) {
                router.push("/auth/login");
                return;
            }

            const { data, error } = await supabase
                .from("projects")
                .select("*")
                .eq("user_id", user.user.id)
                .order("updated_at", { ascending: false });

            if (error) throw error;
            setProjects(data || []);
        } catch (error) {
            console.error("Fehler beim Laden der Projekte:", error);
            toast.current?.show({
                severity: "error",
                summary: "Fehler",
                detail: "Projekte konnten nicht geladen werden.",
            });
        } finally {
            setLoading(false);
        }
    };

    // Neues Projekt erstellen
    const createProject = async () => {
        if (!newProjectName.trim()) {
            toast.current?.show({
                severity: "warn",
                summary: "Warnung",
                detail: "Bitte einen Projektnamen eingeben.",
            });
            return;
        }

        try {
            const { data: userData } = await supabase.auth.getUser();

            if (!userData.user) {
                router.push("/auth/login");
                return;
            }

            // Projektdaten vorbereiten
            const newProject: Partial<Project> = {
                name: newProjectName.trim(),
                user_id: userData.user.id,
                data: {
                    floors: [
                        {
                            id: crypto.randomUUID(),
                            name: "Erdgeschoss",
                            rooms: [],
                            doors: [],
                        },
                    ],
                    selectedFloor: 0,
                    floorings: [],
                },
            };

            // In Supabase speichern
            const { data, error } = await supabase
                .from("projects")
                .insert(newProject)
                .select()
                .single();

            if (error) throw error;

            toast.current?.show({
                severity: "success",
                summary: "Erfolg",
                detail: "Projekt erfolgreich erstellt.",
            });

            setProjects([data, ...projects]);
            setNewProjectName("");
            setShowNewProjectDialog(false);

            // Zur Projektseite navigieren
            router.push(`/projects/${data.id}`);
        } catch (error) {
            console.error("Fehler beim Erstellen des Projekts:", error);
            toast.current?.show({
                severity: "error",
                summary: "Fehler",
                detail: "Projekt konnte nicht erstellt werden.",
            });
        }
    };

    // Projekt löschen
    const deleteProject = async (projectId: string) => {
        try {
            const { error } = await supabase.from("projects").delete().eq("id", projectId);

            if (error) throw error;

            setProjects(projects.filter(p => p.id !== projectId));
            toast.current?.show({
                severity: "success",
                summary: "Erfolg",
                detail: "Projekt erfolgreich gelöscht.",
            });
        } catch (error) {
            console.error("Fehler beim Löschen des Projekts:", error);
            toast.current?.show({
                severity: "error",
                summary: "Fehler",
                detail: "Projekt konnte nicht gelöscht werden.",
            });
        }
    };

    // Löschdialog anzeigen
    const confirmDeleteProject = (projectId: string, projectName: string) => {
        confirmDialog({
            message: `Möchten Sie das Projekt "${projectName}" wirklich löschen?`,
            header: "Löschen bestätigen",
            icon: "pi pi-exclamation-triangle",
            acceptClassName: "p-button-danger",
            acceptLabel: "Ja, löschen",
            rejectLabel: "Abbrechen",
            accept: () => deleteProject(projectId),
        });
    };

    // Aktionen-Template für die Datentabelle
    const actionsTemplate = (rowData: Project) => {
        return (
            <div className="flex gap-2">
                <Button
                    icon="pi pi-pencil"
                    className="p-button-rounded p-button-success p-button-sm"
                    onClick={() => router.push(`/projects/${rowData.id}`)}
                    tooltip="Bearbeiten"
                />
                <Button
                    icon="pi pi-trash"
                    className="p-button-rounded p-button-danger p-button-sm"
                    onClick={() => confirmDeleteProject(rowData.id, rowData.name)}
                    tooltip="Löschen"
                />
            </div>
        );
    };

    // Datum formatieren
    const formatDate = (rowData: Project, field: keyof Project) => {
        const date = new Date(rowData[field] as string);
        return date.toLocaleDateString("de-DE", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <div>
            <Toast ref={toast} />
            <ConfirmDialog />

            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Meine Projekte</h2>
                <Button
                    label="Neues Projekt"
                    icon="pi pi-plus"
                    onClick={() => setShowNewProjectDialog(true)}
                />
            </div>

            <DataTable
                value={projects}
                paginator
                rows={10}
                loading={loading}
                emptyMessage="Keine Projekte gefunden"
                className="p-datatable-sm">
                <Column field="name" header="Projektname" sortable />
                <Column
                    field="created_at"
                    header="Erstellt am"
                    sortable
                    body={rowData => formatDate(rowData, "created_at")}
                />
                <Column
                    field="updated_at"
                    header="Zuletzt bearbeitet"
                    sortable
                    body={rowData => formatDate(rowData, "updated_at")}
                />
                <Column body={actionsTemplate} header="Aktionen" style={{ width: "10rem" }} />
            </DataTable>

            <Dialog
                header="Neues Projekt"
                visible={showNewProjectDialog}
                onHide={() => setShowNewProjectDialog(false)}
                footer={
                    <div>
                        <Button
                            label="Abbrechen"
                            icon="pi pi-times"
                            onClick={() => setShowNewProjectDialog(false)}
                            className="p-button-text"
                        />
                        <Button
                            label="Projekt erstellen"
                            icon="pi pi-check"
                            onClick={createProject}
                            autoFocus
                        />
                    </div>
                }>
                <div className="p-fluid">
                    <div className="p-field mb-3">
                        <label htmlFor="projectName" className="block mb-2">
                            Projektname
                        </label>
                        <InputText
                            id="projectName"
                            value={newProjectName}
                            onChange={e => setNewProjectName(e.target.value)}
                            placeholder="Neues Bodenprojekt"
                            autoFocus
                        />
                    </div>
                </div>
            </Dialog>
        </div>
    );
};

export default ProjectManager;
