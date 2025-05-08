import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { PrimeReactProvider } from "primereact/api";
import Navigation from "@/components/Navigation";
import { AuthProvider } from "./contexts/AuthContext";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Parkett-Planer",
    description: "Interaktive Anwendung zum Zeichnen und Konfigurieren von Bodenplänen",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="de">
            <body className={inter.className}>
                <PrimeReactProvider>
                    <AuthProvider>
                        <Navigation />
                        <main className="container mx-auto px-4 py-8">{children}</main>
                    </AuthProvider>
                </PrimeReactProvider>
            </body>
        </html>
    );
}
