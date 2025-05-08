"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Session, User } from "@supabase/supabase-js";

// Definiere den Auth-Context-Typ
type AuthContextType = {
    user: User | null;
    session: Session | null;
    loading: boolean;
    signOut: () => Promise<void>;
};

// Erstelle den Auth-Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Öffentliches Hook, um den Auth-Context in Komponenten zu verwenden
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth muss innerhalb eines AuthProvider verwendet werden");
    }
    return context;
};

// Definiere die Props für den AuthProvider
interface AuthProviderProps {
    children: React.ReactNode;
}

// Liste der Pfade, die ohne Authentifizierung zugänglich sind
const publicPaths = ["/", "/auth/login", "/auth/register", "/auth/callback"];

// Auth-Provider-Komponente
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    // Überprüfe die Authentifizierung bei Seitenladen und setze Listener
    useEffect(() => {
        const initializeAuth = async () => {
            setLoading(true);

            // Überprüfe, ob bereits eine Session besteht
            const {
                data: { session: initialSession },
                error,
            } = await supabase.auth.getSession();

            if (error) {
                console.error("Fehler beim Laden der Authentifizierung:", error);
            }

            if (initialSession) {
                setSession(initialSession);
                setUser(initialSession.user);
            }

            // Auth-Änderungs-Listener
            const {
                data: { subscription },
            } = await supabase.auth.onAuthStateChange((event, updatedSession) => {
                setSession(updatedSession);
                setUser(updatedSession?.user ?? null);
                setLoading(false);

                // Bei Abmeldung zur Startseite umleiten
                if (event === "SIGNED_OUT") {
                    router.push("/");
                }
            });

            setLoading(false);

            // Cleanup beim Unmount
            return () => {
                subscription.unsubscribe();
            };
        };

        initializeAuth();
    }, [router]);

    // Überprüfe Zugriffsberechtigung für geschützte Routen
    useEffect(() => {
        if (loading) return;

        if (!user && !publicPaths.some(path => pathname.startsWith(path))) {
            router.push("/auth/login");
        }
    }, [user, loading, pathname, router]);

    // Abmelde-Funktion
    const signOut = async () => {
        await supabase.auth.signOut();
        router.push("/");
    };

    // Stelle den Auth-Context-Wert bereit
    const value = {
        user,
        session,
        loading,
        signOut,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
