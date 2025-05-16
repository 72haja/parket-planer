import { Rectangle } from "@/lib/types";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type User = {
    id: string;
    email: string;
};

export type Project = {
    id: string;
    name: string;
    user_id: string;
    created_at: string;
    updated_at: string;
    data: FloorplanData;
};

export type FloorplanData = {
    floors: Floor[];
    selectedFloor: number;
    floorings: Flooring[];
};

export type Floor = {
    id: string;
    name: string;
    rooms: Rectangle[];
    doors: Door[];
};

export type Door = {
    id: string;
    position: [number, number];
    width: number;
    rotation: number;
};

export type Flooring = {
    id: string;
    name: string;
    tileWidth: number; // in cm
    tileHeight: number; // in cm
    offset: number; // offset as fraction (e.g., 0.33 for 1/3 offset)
    position: [number, number];
    floorId: string;
};
