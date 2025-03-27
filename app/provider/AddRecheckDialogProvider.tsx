"use client";

import { FC, PropsWithChildren, createContext, useContext, useState } from "react";

interface AddRecheckDialogContextProps {
    showDialog: boolean;
    openDialog: () => void;
    closeDialog: () => void;
}

const AddRecheckDialogContext = createContext<AddRecheckDialogContextProps>(
    {} as AddRecheckDialogContextProps
);

export const AddRecheckDialogProvider: FC<PropsWithChildren> = ({ children }) => {
    const [showDialog, setShowDialog] = useState<boolean>(false);

    return (
        <AddRecheckDialogContext.Provider
            value={{
                showDialog,
                closeDialog: () => setShowDialog(false),
                openDialog: () => setShowDialog(true),
            }}>
            {children}
        </AddRecheckDialogContext.Provider>
    );
};

export const useAddRecheckDialog = () => useContext(AddRecheckDialogContext);
