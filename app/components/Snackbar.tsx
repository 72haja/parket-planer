import React, { useEffect, useState } from "react";

interface SnackbarProps {
    text?: string;
    color?: string;
    timeout?: number;
    onClose?: () => void;
}

export const Snackbar = ({ text, color = "#15803d", timeout = 5000, onClose }: SnackbarProps) => {
    const [showSnackbar, setShowSnackbar] = useState(false);

    useEffect(() => {
        let timer: NodeJS.Timeout;

        if (text) {
            setShowSnackbar(true);
            timer = setTimeout(() => {
                hideSnackbar();
            }, timeout);
        } else {
            setShowSnackbar(false);
        }

        return () => {
            clearTimeout(timer);
        };
    }, [text, timeout]);

    const hideSnackbar = () => {
        setShowSnackbar(false);
        if (onClose) onClose();
    };

    if (!showSnackbar) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
            <div
                className="flex gap-5 max-w-[95%] w-max mx-auto items-center justify-between py-3 px-6 rounded-md drop-shadow-xl shadow-lg"
                style={{ backgroundColor: color }}>
                <div className="font-medium text-white">{text}</div>
                <button
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md font-medium bg-white hover:bg-gray-300 focus:outline-none focus:bg-gray-300 focus:shadow-outline-indigo active:bg-gray-400 transition duration-150 ease-in-out"
                    style={{ color: color }}
                    onClick={hideSnackbar}>
                    OK
                </button>
            </div>
        </div>
    );
};
