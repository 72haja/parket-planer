"use client";

import { FC, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { ProgressSpinner } from "primereact/progressspinner";
import { Toast } from "primereact/toast";
import { useAuth } from "@/app/contexts/AuthContext";

export const LandingPage: FC = () => {
    const { user, loading } = useAuth();
    const router = useRouter();
    const toast = useRef<Toast>(null);

    useEffect(() => {
        // Automatisch zu Projekten navigieren, wenn der Benutzer bereits angemeldet ist
        if (!loading && user) {
            router.push("/projects");
        }
    }, [loading, user, router]);

    // Anzeige während des Ladens der Auth-Informationen
    if (loading) {
        return (
            <div className="flex justify-center items-center w-full">
                <Card className="w-full max-w-md text-center">
                    <div className="flex flex-col items-center p-5">
                        <ProgressSpinner style={{ width: "50px", height: "50px" }} />
                        <p className="mt-4">Lädt...</p>
                    </div>
                </Card>
            </div>
        );
    }

    // Wenn der Benutzer nicht angemeldet ist, zeige die Landing Page
    return (
        <div className="text-center w-full">
            <Toast ref={toast} />

            <h1 className="text-4xl font-bold mb-8">Parkett-Planer</h1>
            <p className="text-lg mb-12">
                Eine interaktive Anwendung zum Zeichnen und Konfigurieren von Bodenplänen
            </p>

            <div className="mb-12">
                <div className="max-w-2xl mx-auto">
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left mb-8">
                        <li className="flex items-start">
                            <i className="pi pi-check-circle text-green-500 mr-2 mt-1"></i>
                            <span>Zeichne und konfiguriere Grundrisse für mehrere Stockwerke</span>
                        </li>
                        <li className="flex items-start">
                            <i className="pi pi-check-circle text-green-500 mr-2 mt-1"></i>
                            <span>Platziere Wände und Türen mit einfachen Tools</span>
                        </li>
                        <li className="flex items-start">
                            <i className="pi pi-check-circle text-green-500 mr-2 mt-1"></i>
                            <span>Konfiguriere Fliesengrößen und Verlegemuster</span>
                        </li>
                        <li className="flex items-start">
                            <i className="pi pi-check-circle text-green-500 mr-2 mt-1"></i>
                            <span>Speichere und verwalte deine Projekte</span>
                        </li>
                    </ul>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 justify-center">
                <Link href="/projects/demo">
                    <Button
                        label="Demo starten"
                        icon="pi pi-play"
                        className="p-button-secondary p-button-lg"
                    />
                </Link>
            </div>
        </div>
    );
};
