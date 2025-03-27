import { useState } from "react";
import { VinylCanvas } from "@/app/components/vinyl/VinylCanvas";
import { VinylSettings } from "@/app/components/vinyl/VinylSettings";

export const VinylWrapper = () => {
    const [plattenLaenge, setPlattenLaenge] = useState(63.6);
    const [plattenBreite, setPlattenBreite] = useState(31.9);

    return (
        <>
            <VinylSettings
                plattenLaenge={plattenLaenge}
                setPlattenLaenge={setPlattenLaenge}
                plattenBreite={plattenBreite}
                setPlattenBreite={setPlattenBreite}
            />

            <VinylCanvas plattenLaenge={plattenLaenge} plattenBreite={plattenBreite} />
        </>
    );
};
