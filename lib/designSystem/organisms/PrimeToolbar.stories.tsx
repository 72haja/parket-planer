import { PrimeButton } from "@/lib/designSystem/atoms/PrimeButton";
import type { Meta, StoryObj } from "@storybook/react";
import { PrimeToolbar, PrimeToolbarProps } from "./PrimeToolbar";

const meta: Meta<typeof PrimeToolbar> = {
    title: "DesignSystem/Organisms/PrimeToolbar",
    component: PrimeToolbar,
    tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof PrimeToolbar>;

export const Basic: Story = {
    args: {
        start: <span>Left Content</span>,
        end: <PrimeButton label="Right Action" />,
    } satisfies PrimeToolbarProps,
};
