"use client";

import { FC, PropsWithChildren, SetStateAction, createContext, useContext, useState } from "react";
import { toast } from "sonner";
import { useAddRecheckDialog } from "@/app/provider/AddRecheckDialogProvider";
import { Rechteck } from "@/types";

interface RechteckeContextProps {
    rechtecke: Rechteck[];
    addRechteck: (rechteck: Rechteck) => void;
    setRechtecke: (rechtecke: SetStateAction<Rechteck[]>) => void;
    removeRechteck: (index: number) => void;
}

const RechteckeContext = createContext<RechteckeContextProps>({} as RechteckeContextProps);

export const RechteckeProvider: FC<PropsWithChildren> = ({ children }) => {
    const { closeDialog } = useAddRecheckDialog();

    const [rechtecke, setRechtecke] = useState<Rechteck[]>([]);

    const addRechteck = (rechteck: Rechteck) => {
        if (rechteck.x1 - rechteck.x2 === 0 || rechteck.y1 - rechteck.y2 === 0) {
            toast("Breite und Höhe müssen größer als 0 sein", {});
            return;
        }

        setRechtecke(prev => [...prev, rechteck]);
        closeDialog();
    };

    const removeRechteck = (index: number) => {
        setRechtecke(prev => {
            const newRechtecke = [...prev];
            newRechtecke.splice(index, 1);
            return newRechtecke;
        });
    };

    return (
        <RechteckeContext.Provider
            value={{
                rechtecke,
                addRechteck,
                setRechtecke,
                removeRechteck,
            }}>
            {children}
        </RechteckeContext.Provider>
    );
};

export const useRechtecke = () => useContext(RechteckeContext);
