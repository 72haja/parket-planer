import type { Meta, StoryObj } from "@storybook/react";
import { PrimeAvatar, PrimeAvatarProps } from "./PrimeAvatar";

const meta: Meta<typeof PrimeAvatar> = {
    title: "DesignSystem/Atoms/PrimeAvatar",
    component: PrimeAvatar,
    tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof PrimeAvatar>;

export const Circle: Story = {
    args: {
        label: "A",
        shape: "circle",
    } satisfies PrimeAvatarProps,
};

export const Square: Story = {
    args: {
        label: "B",
        shape: "square",
    } satisfies PrimeAvatarProps,
};
