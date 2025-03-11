import { useCallback, useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";

interface VinylCanvasProps {
    plattenLaenge: number;
    plattenBreite: number;
}

export const VinylCanvas = ({ plattenLaenge, plattenBreite }: VinylCanvasProps) => {
    const [versatz, setVersatz] = useState(0);

    const canvasPlattenRef: React.RefObject<HTMLCanvasElement | null> = useRef(null);
    const ctxPlattenRef: React.RefObject<CanvasRenderingContext2D | null> = useRef(null);

    const widthOfCanvas = 500;

    useEffect(() => {
        if (canvasPlattenRef.current) {
            ctxPlattenRef.current = canvasPlattenRef.current.getContext("2d");
            drawPlattenCanvas();
        }
    }, []);

    const drawPlattenCanvas = useCallback(() => {
        if (!ctxPlattenRef.current || !canvasPlattenRef.current) return;

        const ctx = ctxPlattenRef.current;
        ctx.clearRect(0, 0, canvasPlattenRef.current.width, canvasPlattenRef.current.height);
        drawVinylPlatten();
    }, [versatz, plattenLaenge, plattenBreite]);

    const abstandX = 20;
    const abstandY = 20;

    function drawVinylPlatten() {
        if (!ctxPlattenRef.current) return;

        const ctx = ctxPlattenRef.current;
        const amountOfPlattenX = Math.floor(widthOfCanvas / plattenLaenge);
        const amountOfPlattenY = Math.floor(widthOfCanvas / plattenBreite);

        for (let i = 0; i < amountOfPlattenX; i++) {
            for (let j = 0; j < amountOfPlattenY; j++) {
                ctx.lineWidth = 1;
                ctx.strokeStyle = "gray";
                ctx.beginPath();
                const versatzValue = j % 2 === 1 ? versatz * plattenLaenge : 0;
                ctx.rect(
                    abstandX + i * plattenLaenge + versatzValue,
                    abstandY + j * plattenBreite,
                    plattenLaenge,
                    plattenBreite
                );
                ctx.stroke();
            }
        }
    }

    return (
        <>
            <p className="text-lg font-medium mt-8">Platten</p>

            <label className="block text-lg font-medium">
                Versatz:
                <Input
                    type="number"
                    step="0.01"
                    value={versatz}
                    onChange={e => setVersatz(Number(e.target.value))}
                />
            </label>

            <div className="max-w-full w-auto aspect-square max-h-[calc(100dvh-40px)] bg-gray-200 rounded-lg shadow-md mt-4 p-4">
                <canvas
                    id="platten"
                    ref={canvasPlattenRef}
                    width={widthOfCanvas}
                    height={widthOfCanvas}
                    className="w-full h-full bg-gray-200"></canvas>
            </div>
        </>
    );
};
