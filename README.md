# Parkett-Planer

Eine interaktive Webanwendung zum Zeichnen und Konfigurieren von Bodenplänen auf einem Canvas. Die Anwendung ermöglicht es, verschiedene Stockwerke eines Hauses als Grundriss darzustellen und darauf eine Bodenverlege-Simulation mit Fliesen oder Laminat durchzuführen.

## Funktionen

- **Canvas für Grundriss-Zeichnung**: Erstellen von Hausgrundrissen mit mehreren Stockwerken und einfachen Zeichenelementen wie Wänden und Türen.
- **Konfigurierbare Bodenmuster**: Definition von Fliesengrößen in cm und Einstellung eines Versatzes pro Reihe.
- **Drag & Drop von Bodenmustern**: Platzieren von Bodenmustern auf dem Grundriss-Canvas zur Optimierung von Verschnitt und optischer Wirkung.
- **Speichern & Laden über Supabase**: Authentifizierung und Persistenz von Projekten, Grundrissen und Boden-Konfigurationen.

## Technologien

- **Next.js (mit App Router)**: Framework für React-Anwendungen mit optimierter Serverseiten-Rendering und Routing-Funktionalität.
- **TypeScript**: Statisch typisierte Erweiterung von JavaScript für erhöhte Code-Qualität und bessere Entwicklererfahrung.
- **TailwindCSS**: Utility-first CSS-Framework für schnelles und konsistentes Styling.
- **PrimeReact**: UI-Komponentenbibliothek für React mit umfangreichen vorgefertigten Komponenten.
- **Supabase**: Backend-as-a-Service mit Postgresql-Datenbank, Authentifizierung und Datenspeicherung.
- **ESLint, Prettier & TSConfig**: Konfiguriert nach den Becklyn-Standards für konsistenten Codestil.

## Projektarchitektur

Das Projekt folgt einer klaren Komponentenstruktur:

- `/app`: Hauptverzeichnis des Next.js App Routers
    - `/components`: Wiederverwendbare React-Komponenten
        - `FloorplanCanvas.tsx`: Canvas-Komponente für die Grundrisszeichnung
        - `FlooringConfigurator.tsx`: Konfiguration von Bodenbelägen
        - `ProjectManager.tsx`: Verwaltung von Projekten
        - `Rooms.tsx`: Verwaltung von Stockwerken
    - `/lib`: Utility-Funktionen und Helper
        - `supabase.ts`: Supabase-Konfiguration und Typdefinitionen
    - `/auth`: Authentifizierungskomponenten
        - `/login`: Login-Komponente
        - `/register`: Registrierungskomponente

## Entscheidungen und Best Practices

1. **Next.js App Router**: Verwendet für verbesserte Serverkomponenten und optimierte Leistung.
2. **TypeScript**: Implementiert für typsichere Entwicklung und bessere Wartbarkeit.
3. **Komponentenisolation**: Jede Komponente ist für eine spezifische Aufgabe verantwortlich und kann unabhängig getestet werden.
4. **Canvas API**: Verwendet für die Darstellung und Bearbeitung von Grundrissen, optimiert für Performance bei komplexen Zeichenoperationen.
5. **Supabase Integration**: Gewählt für einfache Authentifizierung und Datenpersistenz ohne eigenen Backend-Server.
6. **Becklyn-Standards**: Verwendet für konsistente Codequalität und einfachere Teamarbeit.

## Einrichtung

### Voraussetzungen

- Node.js (>= 18.x)
- npm oder yarn
- Supabase-Konto und Projekt (Free Tier ist ausreichend)

### Installation

1. Repository klonen:

    ```bash
    git clone <repository-url>
    cd parket-planer
    ```

2. Abhängigkeiten installieren:

    ```bash
    npm install
    # oder
    yarn install
    ```

3. Umgebungsvariablen konfigurieren:

    - Erstelle eine `.env.local`-Datei mit den folgenden Variablen:
        ```
        NEXT_PUBLIC_SUPABASE_URL=deine-supabase-url
        NEXT_PUBLIC_SUPABASE_ANON_KEY=dein-supabase-anon-key
        ```

4. Supabase-Tabellen einrichten:

    - Erstelle eine Tabelle `projects` mit folgender Struktur:
        - `id`: uuid (Primary Key)
        - `name`: text
        - `user_id`: uuid (Referenz auf auth.users)
        - `created_at`: timestamp with time zone
        - `updated_at`: timestamp with time zone
        - `data`: jsonb (für die Speicherung der Grundriss- und Bodenbelagsdaten)

5. Entwicklungsserver starten:
    ```bash
    npm run dev
    # oder
    yarn dev
    ```

## Geplante Features

- [ ] Import von Grundrissen aus CAD-Dateien
- [ ] Exportfunktion für fertige Pläne als PDF
- [ ] Berechnung des Materialbedarfs
- [ ] 3D-Ansicht der gestalteten Räume
- [ ] Mobile-optimierte Benutzeroberfläche

## Lizenz

Copyright © 2025
