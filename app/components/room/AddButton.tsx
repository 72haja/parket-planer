import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AddButtonProps {
    onClick: () => void;
    className?: string;
}

export const AddButton = ({ onClick, className }: AddButtonProps) => {
    return (
        <Button
            onClick={onClick}
            className={cn(
                className,
                "rounded-full bg-gray-400 hover:bg-gray-500 p-1 aspect-square relative w-8"
            )}>
            <svg className="rounded-full w-full h-full">
                <path stroke="#000" strokeWidth="2" d="M12.5 5v15M5 12.5h15" />
            </svg>
        </Button>
    );
};
