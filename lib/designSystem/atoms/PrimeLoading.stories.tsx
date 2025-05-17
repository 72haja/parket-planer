import { Meta, StoryObj } from "@storybook/react";
import { PrimeLoading } from "./PrimeLoading";

const meta: Meta<typeof PrimeLoading> = {
    title: "DesignSystem/Atoms/PrimeLoading",
    component: PrimeLoading,
    parameters: {
        layout: "centered",
    },
    tags: ["autodocs"],
};

export default meta;

type Story = StoryObj<typeof PrimeLoading>;

// Default loading spinner without message
export const Default: Story = {
    args: {},
};

// Loading spinner with message
export const WithMessage: Story = {
    args: {
        message: "Loading data...",
    },
};

// Loading spinner with custom className
export const WithCustomClass: Story = {
    args: {
        message: "Loading with custom styling",
        className: "bg-slate-100 rounded shadow-md p-4",
    },
};
