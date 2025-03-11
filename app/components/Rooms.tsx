import { useState } from "react";
import CloseButton from "@/app/components/CloseButton";
import { rooms } from "@/app/data/roomsData";
import { Rechteck } from "@/types";
import { Button } from "@/components/ui/button";

interface RoomsProps {
    onUpdateSelectedRoom: (roomData: Rechteck[]) => void;
}

export const Rooms = ({ onUpdateSelectedRoom }: RoomsProps) => {
    const [showMenu, setShowMenu] = useState(false);

    const handleRoomSelect = (roomData: Rechteck[]) => {
        onUpdateSelectedRoom(roomData);
        setShowMenu(false);
    };

    return (
        <div className="relative grid grid-cols-[max-content]">
            <Button onClick={() => setShowMenu(!showMenu)}>Räume</Button>

            <div className="relative">
                {showMenu && (
                    <div className="absolute left-0 top-0 w-max h-max z-10">
                        <CloseButton
                            className="absolute -top-6 -right-6 p-2 rounded-full text-white"
                            onClick={() => setShowMenu(false)}
                            color="bg-red-500"
                        />
                        <div className="w-max p-4 grid gap-1 shadow-2xl rounded-lg bg-white">
                            {rooms.map(room => (
                                <div
                                    key={room.id}
                                    className="w-full grid grid-cols-[minmax(0,1fr)_max-content] gap-2 items-center"
                                    // style={{
                                    //     backgroundColor:
                                    //         selectedRoom === room.id ? "#f0f0f0" : "transparent",
                                    // }}
                                >
                                    <span>{room.name}</span>
                                    <Button onClick={() => handleRoomSelect(room.data)}>
                                        Auswählen
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
