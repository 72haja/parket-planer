import { Rechteck } from "@/types";

export interface Room {
    id: string;
    name: string;
    data: Rechteck[];
}

const abstandX = 20;
const abstandY = 20;
const tuerbreite1 = 85;
const tuerbreite2 = 72;
const tuertiefe = 16.5;
const fensterTiefe = 12;
const fensterBreite = 117.5;

// Abstellkammer
const abstellkammerBreite = 149.5;
const abstellkammerHoehe = 328;
const abstellkammer: Rechteck[] = [
    {
        x1: abstandX,
        y1: abstandY,
        x2: abstandX + abstellkammerBreite,
        y2: abstandY + abstellkammerHoehe,
    },
];

// Flur
const flurBreite = 297.5;
const flurHoehe = 99;
const flur: Rechteck[] = [
    { x1: abstandX, y1: abstandY, x2: flurBreite + abstandX, y2: flurHoehe + abstandY },
    {
        x1: 97.5 + abstandX,
        y1: flurHoehe + abstandY,
        x2: 97.5 + abstandX + 102,
        y2: 123 + abstandY,
    },
    { x1: abstandX - tuertiefe, y1: abstandY + 5, x2: abstandX, y2: abstandY + 5 + tuerbreite1 },
    { x1: abstandX + 5, y1: abstandY - tuertiefe, x2: abstandX + 5 + tuerbreite2, y2: abstandY },
    {
        x1: flurBreite + abstandX - 2 - tuerbreite2,
        y1: abstandY - tuertiefe,
        x2: flurBreite + abstandX - 2,
        y2: abstandY,
    },
    {
        x1: flurBreite + abstandX,
        y1: abstandY + 5,
        x2: flurBreite + abstandX + tuertiefe,
        y2: abstandX + 5 + tuerbreite1,
    },
];

// Kinderzimmer
const schlauchBreite = 98.5;
const durchgangBreite = 13.5;
const kinderzimmerBreite = schlauchBreite + durchgangBreite + 337;
const kinderzimmerHoehe = 596;
const abstandFenster = 128;
const abstandZwischenFenster = 88.5;
const kinderzimmer: Rechteck[] = [
    { x1: abstandX, y1: abstandY, x2: abstandX + schlauchBreite, y2: abstandY + 340 },
    {
        x1: abstandX + schlauchBreite,
        y1: abstandY + 35,
        x2: abstandX + schlauchBreite + durchgangBreite,
        y2: abstandY + 35 + 220,
    },
    {
        x1: abstandX + schlauchBreite + durchgangBreite,
        y1: abstandY,
        x2: abstandX + kinderzimmerBreite,
        y2: abstandY + kinderzimmerHoehe,
    },
    {
        x1: abstandX + kinderzimmerBreite,
        y1: abstandY + abstandFenster,
        x2: abstandX + kinderzimmerBreite + fensterTiefe,
        y2: abstandY + abstandFenster + fensterBreite,
    },
    {
        x1: abstandX + kinderzimmerBreite,
        y1: abstandY + abstandFenster + fensterBreite + abstandZwischenFenster,
        x2: abstandX + kinderzimmerBreite + fensterTiefe,
        y2: abstandY + abstandFenster + fensterBreite + abstandZwischenFenster + fensterBreite,
    },
    {
        x1: abstandX + schlauchBreite + durchgangBreite,
        y1: abstandY + kinderzimmerHoehe - 47.5,
        x2: abstandX + schlauchBreite + durchgangBreite + 47.5,
        y2: abstandY + kinderzimmerHoehe,
    },
];

// Schlafzimmer
const schlafzimmerHoehe = 576.5;
const schlafzimmerBreite = 318;
const schlafzimmer: Rechteck[] = [
    {
        x1: abstandX,
        y1: abstandY,
        x2: abstandX + schlafzimmerBreite,
        y2: abstandY + schlafzimmerHoehe,
    },
];

// Dachboden
const dachbodenBreite = 576.5;
const dachbodenHoehe = 634;
const einrueckungX1 = 64;
const einrueckungX2 = 82.5;
const einrueckungX3 = 64.5;
const einrueckungY1 = 112.5;
const einrueckungY2 = 55;
const einrueckungY3 = 181.5;
const einrueckungY4 = 28;

const dachboden: Rechteck[] = [
    {
        x1: abstandX,
        y1: abstandY,
        x2: abstandX + dachbodenBreite - (einrueckungX1 + einrueckungX2 + einrueckungX3),
        y2: abstandY + dachbodenHoehe,
    },
    {
        x1: abstandX + dachbodenBreite - (einrueckungX1 + einrueckungX2 + einrueckungX3),
        y1: abstandY,
        x2: abstandX + dachbodenBreite,
        y2: abstandY + einrueckungY1,
    },
    {
        x1: abstandX + dachbodenBreite - (einrueckungX1 + einrueckungX2 + einrueckungX3),
        y1: abstandY + einrueckungY1,
        x2: abstandX + dachbodenBreite - einrueckungX3,
        y2: abstandY + einrueckungY1 + einrueckungY2,
    },
    {
        x1: abstandX + dachbodenBreite - (einrueckungX1 + einrueckungX2 + einrueckungX3),
        y1: abstandY + einrueckungY1 + einrueckungY2,
        x2: abstandX + dachbodenBreite - (einrueckungX2 + einrueckungX3),
        y2: abstandY + einrueckungY1 + einrueckungY2 + einrueckungY3,
    },
    {
        x1: abstandX + dachbodenBreite - (einrueckungX1 + einrueckungX2 + einrueckungX3),
        y1: abstandY + einrueckungY1 + einrueckungY2 + einrueckungY3 + 134,
        x2: abstandX + dachbodenBreite,
        y2: abstandY + dachbodenHoehe,
    },
    {
        x1: abstandX + dachbodenBreite - (einrueckungX1 + einrueckungX2 + einrueckungX3),
        y1: abstandY + einrueckungY1 + einrueckungY2 + einrueckungY3 + einrueckungY4,
        x2: abstandX + dachbodenBreite - (einrueckungX1 + einrueckungX2 + einrueckungX3) + 11,
        y2: abstandY + einrueckungY1 + einrueckungY2 + einrueckungY3 + einrueckungY4 + 85,
    },
    {
        x1: abstandX + dachbodenBreite - (einrueckungX1 + einrueckungX2 + einrueckungX3) + 11,
        y1: abstandY + einrueckungY1 + einrueckungY2 + einrueckungY3 + einrueckungY4 - 15,
        x2:
            abstandX +
            dachbodenBreite -
            (einrueckungX1 + einrueckungX2 + einrueckungX3) +
            11 +
            52.5,
        y2: abstandY + einrueckungY1 + einrueckungY2 + einrueckungY3 + einrueckungY4 - 4,
    },
    {
        x1: abstandX + dachbodenBreite - (einrueckungX1 + einrueckungX2 + einrueckungX3) + 11,
        y1: abstandY + einrueckungY1 + einrueckungY2 + einrueckungY3 + einrueckungY4 - 4,
        x2:
            abstandX +
            dachbodenBreite -
            (einrueckungX1 + einrueckungX2 + einrueckungX3) +
            11 +
            52.5 +
            13,
        y2: abstandY + einrueckungY1 + einrueckungY2 + einrueckungY3 + einrueckungY4 - 4 + 100,
    },
];

export const rooms: Room[] = [
    { id: "1", name: "Abstellkammer", data: abstellkammer },
    { id: "2", name: "Flur", data: flur },
    { id: "3", name: "Kinderzimmer", data: kinderzimmer },
    { id: "4", name: "Schlafzimmer", data: schlafzimmer },
    { id: "5", name: "Dachboden", data: dachboden },
];
