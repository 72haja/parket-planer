"use client";

import { Toaster } from "sonner";
import { AddRechteckDialog } from "@/app/components/dialogs/AddRechteckDialog";
import { RoomWrapper } from "@/app/components/room/RoomWrapper";
import { VinylWrapper } from "@/app/components/vinyl/VinylWrapper";
import { AddRecheckDialogProvider } from "@/app/provider/AddRecheckDialogProvider";
import { ClickProvider } from "@/app/provider/ClickProvider";
import { RechteckeProvider } from "@/app/provider/RechteckeProvider";

export default function VinylPlattenRechner() {
    return (
        <AddRecheckDialogProvider>
            <RechteckeProvider>
                <ClickProvider>
                    <div className="p-10">
                        <div className="max-w-(--breakpoint-2xl) mx-auto p-4 md:p-6 lg:p-8 bg-white rounded-lg shadow-md">
                            <RoomWrapper />

                            <VinylWrapper />

                            <AddRechteckDialog />
                        </div>

                        <Toaster position="bottom-center" closeButton />
                    </div>
                </ClickProvider>
            </RechteckeProvider>
        </AddRecheckDialogProvider>
    );
}
