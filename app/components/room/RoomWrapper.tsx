import { DisplayedRoomList } from "@/app/components/room/DisplayedRoomList";
import { RoomCanvas } from "@/app/components/room/RoomCanvas";
import { Rooms } from "@/app/components/room/Rooms";
import { useAddRecheckDialog } from "@/app/provider/AddRecheckDialogProvider";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export const RoomWrapper = () => {
    const { openDialog } = useAddRecheckDialog();

    const [drawCanvasTrigger, setDrawCanvasTrigger] = useState(1);

    return (
        <>
            <Rooms />

            <p className="text-lg font-medium mt-8">Raum</p>

            <RoomCanvas drawCanvasTrigger={drawCanvasTrigger} />

            <Button onClick={openDialog}>Rechteck hinzufügen</Button>

            <DisplayedRoomList drawCanvas={() => setDrawCanvasTrigger((prev) => prev++)} />
        </>
    );
};
