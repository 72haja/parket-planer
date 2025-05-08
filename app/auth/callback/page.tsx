"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card } from "primereact/card";
import { ProgressSpinner } from "primereact/progressspinner";
import { supabase } from "@/lib/supabase";

export default function AuthCallback() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        // Die Parameter aus der URL extrahieren, die von Supabase nach der E-Mail-Bestätigung gesendet werden
        const handleAuthCallback = async () => {
            const code = searchParams.get("code");
            const error = searchParams.get("error");
            const errorDescription = searchParams.get("error_description");

            if (error) {
                console.error("Auth-Fehler:", error, errorDescription);
                router.push(
                    `/auth/login?error=${encodeURIComponent(errorDescription || "Ein Fehler ist aufgetreten")}`
                );
                return;
            }

            if (code) {
                try {
                    // Handle der E-Mail-Bestätigungs-Flow
                    const { error } = await supabase.auth.exchangeCodeForSession(code);

                    if (error) {
                        throw error;
                    }

                    // Erfolgreich bestätigt, zur Projektübersicht weiterleiten
                    router.push("/projects");
                } catch (err: unknown) {
                    const error = err as Error;
                    console.error("Fehler bei der Bestätigung:", error);
                    router.push(
                        `/auth/login?error=${encodeURIComponent(error.message || "Ein Fehler ist bei der Bestätigung aufgetreten")}`
                    );
                }
            } else {
                // Fehlender Code, zurück zum Login
                router.push("/auth/login");
            }
        };

        handleAuthCallback();
    }, [router, searchParams]);

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-50">
            <Card title="Authentifizierung" className="w-full max-w-md text-center">
                <div className="flex flex-col items-center p-5">
                    <ProgressSpinner style={{ width: "50px", height: "50px" }} />
                    <p className="mt-4">Bitte warten, Ihre Anmeldung wird verarbeitet...</p>
                </div>
            </Card>
        </div>
    );
}
