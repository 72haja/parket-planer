import { FC } from "react";
import { useRechtecke } from "@/app/provider/RechteckeProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Rechteck } from "@/types";

interface DisplayedRoomListProps {
    drawCanvas: () => void;
}

export const DisplayedRoomList: FC<DisplayedRoomListProps> = ({ drawCanvas }) => {
    const { rechtecke, setRechtecke, removeRechteck } = useRechtecke();

    function getBreite(rechteck: Rechteck) {
        return Math.abs(rechteck.x2 - rechteck.x1);
    }

    function handleUpdateBreite(rechteck: Rechteck, breite: string) {
        setRechtecke(prev =>
            prev.map(r => {
                if (r.x1 === rechteck.x1 && r.y1 === rechteck.y1) {
                    return { ...r, x2: parseFloat(r.x1.toString()) + parseFloat(breite) };
                }
                return r;
            })
        );
    }

    function getHoehe(rechteck: Rechteck) {
        return Math.abs(rechteck.y2 - rechteck.y1);
    }

    function handleUpdateHoehe(rechteck: Rechteck, hoehe: string) {
        setRechtecke(prev =>
            prev.map(r => {
                if (r.x1 === rechteck.x1 && r.y1 === rechteck.y1) {
                    return { ...r, y2: parseFloat(r.y1.toString()) + parseFloat(hoehe) };
                }
                return r;
            })
        );
    }

    return (
        <div className="grid gap-2 p-4">
            {rechtecke.map((rechteck, index) => (
                <div key={index} className="flex items-center gap-2">
                    <span>Rechteck {index}</span>
                    <label className="block text-lg font-medium">
                        Breite:
                        <Input
                            type="number"
                            step="0.5"
                            value={getBreite(rechteck)}
                            onChange={event => {
                                handleUpdateBreite(rechteck, event.target.value);
                                drawCanvas();
                            }}
                        />
                    </label>
                    <label className="block text-lg font-medium">
                        Höhe:
                        <Input
                            type="number"
                            step="0.5"
                            value={getHoehe(rechteck)}
                            onChange={event => {
                                handleUpdateHoehe(rechteck, event.target.value);
                                drawCanvas();
                            }}
                        />
                    </label>
                    <Button onClick={() => removeRechteck(index)}>X</Button>
                </div>
            ))}
        </div>
    );
};
