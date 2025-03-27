"use client";

import { FC, PropsWithChildren, SetStateAction, createContext, useContext, useState } from "react";
import { Position } from "@/types";

interface ClickContextProps {
    clickPosition: Position;
    setClickPosition: (position: SetStateAction<Position>) => void;
    setX: (position: number) => void;
    setY: (position: number) => void;
}

const ClickContext = createContext<ClickContextProps>({} as ClickContextProps);

export const ClickProvider: FC<PropsWithChildren> = ({ children }) => {
    const [clickPosition, setClickPosition] = useState<Position>({ x: 0, y: 0 });

    const setX = (posX: number) => {
        setClickPosition({
            x: posX,
            y: clickPosition.y,
        });
    };

    const setY = (posY: number) => {
        setClickPosition({
            x: clickPosition.x,
            y: posY,
        });
    };

    return (
        <ClickContext.Provider
            value={{
                clickPosition,
                setClickPosition,
                setX,
                setY,
            }}>
            {children}
        </ClickContext.Provider>
    );
};

export const useClick = () => useContext(ClickContext);
