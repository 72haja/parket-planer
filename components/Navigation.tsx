"use client";

import { FC, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { Avatar } from "primereact/avatar";
import { Button } from "primereact/button";
import { Menu } from "primereact/menu";
import { Menubar } from "primereact/menubar";
import { useAuth } from "@/app/contexts/AuthContext";

export const Navigation: FC = () => {
    const { user, loading, signOut } = useAuth();
    const pathname = usePathname();
    const menuRef = useRef<Menu>(null);
    const [userInitial, setUserInitial] = useState<string>("");

    // Benutzerinitialen für Avatar-Darstellung extrahieren
    useEffect(() => {
        if (user?.email) {
            const email = user.email;
            setUserInitial(email.substring(0, 1).toUpperCase());
        } else {
            setUserInitial("");
        }
    }, [user]);

    // Definiere die Menüpunkte für angemeldete Benutzer
    const userMenuItems = [
        {
            label: "Mein Konto",
            icon: "pi pi-user",
            command: () => {
                window.location.href = "/profile";
            },
        },
        {
            label: "Meine Projekte",
            icon: "pi pi-folder",
            command: () => {
                window.location.href = "/projects";
            },
        },
        {
            separator: true,
        },
        {
            label: "Abmelden",
            icon: "pi pi-sign-out",
            command: () => {
                signOut();
            },
        },
    ];

    // Menüpunkte für die Hauptnavigation
    const navItems = [
        {
            label: "Startseite",
            icon: "pi pi-home",
            visible: !user,
            command: () => {
                window.location.href = "/";
            },
        },
        {
            label: "Projekte",
            icon: "pi pi-folder",
            visible: !!user,
            command: () => {
                window.location.href = "/projects";
            },
        },
        {
            label: "Demo",
            icon: "pi pi-play",
            visible: !user,
            command: () => {
                window.location.href = "/projects/demo";
            },
        },
    ];

    // End-Element für Menubar
    const endTemplate = () => {
        if (loading) return null;

        if (user) {
            return (
                <div className="flex items-center gap-2">
                    <span className="font-medium mr-2 hidden md:inline-block">{user.email}</span>
                    <Avatar
                        label={userInitial}
                        shape="circle"
                        className={clsx("cursor-pointer", "bg-primary")}
                        onClick={e => menuRef.current?.toggle(e)}
                    />
                    <Menu model={userMenuItems} popup ref={menuRef} />
                </div>
            );
        } else {
            // Navigation für nicht angemeldete Benutzer
            if (pathname === "/auth/login" || pathname === "/auth/register") {
                return null; // Keine Auth-Buttons auf den Auth-Seiten
            }

            return (
                <div className="flex gap-2">
                    <Link href="/auth/login">
                        <Button label="Anmelden" icon="pi pi-sign-in" className="p-button-sm" />
                    </Link>
                    <Link href="/auth/register">
                        <Button
                            label="Registrieren"
                            icon="pi pi-user-plus"
                            className="p-button-outlined p-button-sm"
                        />
                    </Link>
                </div>
            );
        }
    };

    // Erstellt das Start-Element mit Logo
    const startTemplate = () => {
        return (
            <Link href="/" className="flex items-center gap-2">
                <span className="font-bold text-xl">Parkett-Planer</span>
            </Link>
        );
    };

    return (
        <header className={clsx("sticky", "top-0", "z-10", "bg-white", "shadow-sm")}>
            <Menubar
                model={navItems.filter(item => item.visible !== false)}
                end={endTemplate}
                start={startTemplate}
                className="border-none px-4 gap-4"
            />
        </header>
    );
};
