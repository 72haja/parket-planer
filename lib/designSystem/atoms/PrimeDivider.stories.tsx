import { Meta, StoryObj } from "@storybook/react";
import { PrimeDivider } from "./PrimeDivider";
import { PrimeButton } from "@/lib/designSystem/atoms/PrimeButton";

const meta: Meta<typeof PrimeDivider> = {
    title: "DesignSystem/Atoms/PrimeDivider",
    component: PrimeDivider,
    parameters: {
        layout: "centered",
    },
    tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof PrimeDivider>;

export const Default: Story = {
    args: {},
    render: (args) => (
        <div className="inline-block">
            <span>Some text</span>
            <PrimeDivider {...args} />
            <span>Some text</span>
        </div>
    ),
};

export const Horizontal: Story = {
    args: {
        layout: "horizontal",
    },
    render: (args) => (
        <div className="grid">
            <span>Some text</span>
            <PrimeDivider {...args} />
            <span>Some text</span>
        </div>
    ),
};

export const CustomStyles: Story = {
    args: {
        color: "blue",
    },
    render: (args) => (
        <div className="w-96">
            <span>Some text</span>
            <PrimeDivider {...args} />
            <span>Some text</span>
        </div>
    ),
};

export const CustomWithHorizontalWithChildren: Story = {
    args: {
        layout: "horizontal",
        color: "blue",
        children: <PrimeButton label="Click me" />,
    },
    render: (args) => (
        <div className="grid">
            <span>Some text</span>
            <PrimeDivider {...args} />
            <span>Some text</span>
        </div>
    ),
};
