"use client";

import { FC, FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Toast } from "primereact/toast";
import { supabase } from "@/lib/supabase";

const Login: FC = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const toast = useRef<Toast>(null);
    const router = useRouter();
    const searchParams = useSearchParams();

    // Prüfe auf Fehlermeldungen in der URL (z.B. nach Umleitung vom Auth-Callback)
    useEffect(() => {
        const errorMsg = searchParams.get("error");
        if (errorMsg) {
            toast.current?.show({
                severity: "error",
                summary: "Fehler",
                detail: decodeURIComponent(errorMsg),
                life: 6000,
            });
        }
    }, [searchParams]);

    const handleLogin = async (e: FormEvent) => {
        e.preventDefault();

        if (!email || !password) {
            toast.current?.show({
                severity: "warn",
                summary: "Warnung",
                detail: "Bitte E-Mail und Passwort eingeben.",
            });
            return;
        }

        try {
            setLoading(true);
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                throw error;
            }

            toast.current?.show({
                severity: "success",
                summary: "Erfolg",
                detail: "Anmeldung erfolgreich!",
            });

            // Zur Projektübersicht navigieren
            router.push("/projects");
        } catch (err: unknown) {
            const error = err as Error;
            console.error("Fehler bei der Anmeldung:", error);
            toast.current?.show({
                severity: "error",
                summary: "Fehler",
                detail: error.message || "Anmeldung fehlgeschlagen. Bitte versuchen Sie es erneut.",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen px-4">
            <Toast ref={toast} />

            <Card title="Anmelden" className="w-full max-w-md">
                <form onSubmit={handleLogin} className="p-fluid">
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
                            feedback={false}
                            inputClassName="w-full"
                            placeholder="Passwort eingeben"
                            required
                        />
                    </div>

                    <Button type="submit" label="Anmelden" className="mb-4" loading={loading} />

                    <div className="text-center">
                        <p className="mt-3">
                            Noch kein Konto?{" "}
                            <Link
                                href="/auth/register"
                                className="text-blue-600 hover:text-blue-800">
                                Registrieren
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
};

export default Login;
