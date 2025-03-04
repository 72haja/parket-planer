interface AddButtonProps {
    onClick: () => void;
    className?: string;
}

export const AddButton = ({ onClick, className }: AddButtonProps) => {
    return (
        <button
            onClick={onClick}
            className={className + " rounded-full bg-gray-400 hover:bg-gray-500 p-1 content-center"}>
            <svg width="25" height="25" className="rounded-full">
                <line x1="12.5" y1="5" x2="12.5" y2="20" stroke="black" strokeWidth="2" />
                <line x1="5" y1="12.5" x2="20" y2="12.5" stroke="black" strokeWidth="2" />
            </svg>
        </button>
    );
};
