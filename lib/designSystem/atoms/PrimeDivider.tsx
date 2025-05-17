import { FC, PropsWithChildren } from "react";
import clsx from "clsx";
import { Divider, DividerProps } from "primereact/divider";

interface PrimeDividerProps extends DividerProps {
    className?: string;
}

export const PrimeDivider: FC<PropsWithChildren<PrimeDividerProps>> = ({
    className,
    children,
    ...props
}) => {
    return (
        <Divider className={clsx(className)} {...props}>
            {children}
        </Divider>
    );
};
