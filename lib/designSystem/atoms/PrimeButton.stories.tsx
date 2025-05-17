import type { Meta, StoryObj } from "@storybook/react";
import { PrimeButton, PrimeButtonProps } from "./PrimeButton";

const meta: Meta<typeof PrimeButton> = {
    title: "DesignSystem/Atoms/PrimeButton",
    component: PrimeButton,
    tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof PrimeButton>;

export const Basic: Story = {
    args: {
        label: "Click Me",
        icon: "pi pi-check",
    } satisfies PrimeButtonProps,
};
