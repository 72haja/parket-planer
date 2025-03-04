export type Rechteck = {
    x1: number;
    x2: number;
    y1: number;
    y2: number;
    isDragging?: boolean;
};

export type Position = {
    x: number;
    y: number;
};

export type Dot = {
    x: number | null;
    y: number | null;
};

export type RechteckDistancesEdge = Omit<Rechteck, "x2" | "y2"> & {
    distance: number;
    x2?: number;
    y2?: number;
};

export type TooltipRechteck = Position & {
    rechteck: Rechteck | null;
};
