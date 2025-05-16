"use client";

import { FormEvent, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Toast } from "primereact/toast";
import { supabase } from "@/lib/supabase";

export default function Register() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const toast = useRef<Toast>(null);
    const router = useRouter();

    const handleRegister = async (e: FormEvent) => {
        e.preventDefault();

        if (!email || !password) {
            toast.current?.show({
                severity: "warn",
                summary: "Warnung",
                detail: "Bitte füllen Sie alle Felder aus.",
            });
            return;
        }

        if (password !== confirmPassword) {
            toast.current?.show({
                severity: "warn",
                summary: "Warnung",
                detail: "Die Passwörter stimmen nicht überein.",
            });
            return;
        }

        if (password.length < 6) {
            toast.current?.show({
                severity: "warn",
                summary: "Warnung",
                detail: "Das Passwort muss mindestens 6 Zeichen lang sein.",
            });
            return;
        }

        try {
            setLoading(true);
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                },
            });

            if (error) {
                throw error;
            }

            toast.current?.show({
                severity: "success",
                summary: "Erfolg",
                detail: "Registrierung erfolgreich! Bitte überprüfen Sie Ihre E-Mail für die Bestätigung.",
            });

            // Optional: Zur Login-Seite weiterleiten
            setTimeout(() => router.push("/auth/login"), 2000);
        } catch (err: unknown) {
            const error = err as Error;
            console.error("Fehler bei der Registrierung:", error);
            toast.current?.show({
                severity: "error",
                summary: "Fehler",
                detail:
                    error.message || "Registrierung fehlgeschlagen. Bitte versuchen Sie es erneut.",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen px-4">
            <Toast ref={toast} />

            <Card title="Registrieren" className="w-full max-w-md">
                <form onSubmit={handleRegister} className="p-fluid">
                    <div className="field mb-4">
                        <label htmlFor="email" className="block mb-2">
                            E-Mail
                        </label>
                        <InputText
                            id="email"
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className="w-full"
                            placeholder="name@example.com"
                            required
                        />
                    </div>

                    <div className="field mb-4">
                        <label htmlFor="password" className="block mb-2">
                            Passwort
                        </label>
                        <Password
                            id="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            toggleMask
                            className="w-full"
                            placeholder="Passwort eingeben"
                            required
                        />
                    </div>

                    <div className="field mb-4">
                        <label htmlFor="confirmPassword" className="block mb-2">
                            Passwort bestätigen
                        </label>
                        <Password
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            toggleMask
                            feedback={false}
                            className="w-full"
                            placeholder="Passwort wiederholen"
                            required
                        />
                    </div>

                    <Button type="submit" label="Registrieren" className="mb-4" loading={loading} />

                    <div className="text-center">
                        <p className="mt-3">
                            Bereits registriert?{" "}
                            <Link href="/auth/login" className="text-blue-600 hover:text-blue-800">
                                Anmelden
                            </Link>
                        </p>
                        <p className="mt-2">
                            <Link href="/" className="text-gray-600 hover:text-gray-800">
                                Zurück zur Startseite
                            </Link>
                        </p>
                    </div>
                </form>
            </Card>
        </div>
    );
}
