import { PrimeButton } from "@/lib/designSystem/atoms/PrimeButton";
import type { Meta, StoryObj } from "@storybook/react";
import { PrimeCardWithActions, PrimeCardWithActionsProps } from "./PrimeCardWithActions";

const meta: Meta<typeof PrimeCardWithActions> = {
    title: "DesignSystem/Molecules/PrimeCardWithActions",
    component: PrimeCardWithActions,
    tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof PrimeCardWithActions>;

export const Basic: Story = {
    args: {
        title: "Card Title",
        children: "This is the card content.",
        actions: <PrimeButton label="Action" />,
    } satisfies PrimeCardWithActionsProps,
};
