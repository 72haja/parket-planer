import React from "react";
import { Button } from "@/components/ui/button";

interface CloseButtonProps {
    className?: string;
    color?: string;
    onClick: () => void;
}

export default function CloseButton({
    className,
    color = "bg-gray-400",
    onClick,
}: CloseButtonProps) {
    return (
        <Button
            onClick={onClick}
            className={className + ` rounded-full hover:bg-gray-500 p-1 ${color}`}>
            <svg width="25" height="25" className="rounded-full">
                <line x1="5" y1="5" x2="20" y2="20" stroke="black" strokeWidth="2" />
                <line x1="20" y1="5" x2="5" y2="20" stroke="black" strokeWidth="2" />
            </svg>
        </Button>
    );
}
