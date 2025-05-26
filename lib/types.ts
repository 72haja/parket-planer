export enum DrawingTool {
    Rectangle = "rectangle",
    Line = "line",
    Delete = "delete",
}

export interface Rectangle {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface Line {
    id: string;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
}
