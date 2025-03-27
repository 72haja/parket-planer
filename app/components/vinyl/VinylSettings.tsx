import { Input } from "@/components/ui/input";

interface VinylSettingsProps {
    plattenLaenge: number;
    setPlattenLaenge: (plattenLaenge: number) => void;
    plattenBreite: number;
    setPlattenBreite: (plattenBreite: number) => void;
}

export const VinylSettings = ({
    plattenLaenge,
    setPlattenLaenge,
    plattenBreite,
    setPlattenBreite,
}: VinylSettingsProps) => {
    return (
        <>
            <h1 className="text-3xl font-bold mb-4">Vinyl-Platten-Rechner</h1>
            <form className="flex flex-col">
                <div className="w-full grid gap-2">
                    <label className="block text-lg font-medium">
                        Länge der Vinyl-Platte:
                        <Input
                            type="number"
                            value={plattenLaenge}
                            onChange={e => setPlattenLaenge(Number(e.target.value))}
                        />
                    </label>
                    <label className="block text-lg font-medium">
                        Breite der Vinyl-Platte:
                        <Input
                            type="number"
                            value={plattenBreite}
                            onChange={e => setPlattenBreite(Number(e.target.value))}
                        />
                    </label>
                </div>
            </form>
        </>
    );
};
