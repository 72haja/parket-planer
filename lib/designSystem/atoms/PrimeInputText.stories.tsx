import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { PrimeInputText } from "./PrimeInputText";

const InteractivePrimeInputText = () => {
    const [value, setValue] = useState("");

    return (
        <PrimeInputText value={value} onChange={e => setValue(e.target.value)} className="w-full" />
    );
};

const meta: Meta<typeof PrimeInputText> = {
    title: "DesignSystem/Atoms/PrimeInputText",
    component: PrimeInputText,
    tags: ["autodocs"],
    render: args => <InteractivePrimeInputText {...args} />,
};
export default meta;

type Story = StoryObj<typeof PrimeInputText>;

export const Basic: Story = {
    args: {
        value: "",
        className: "w-full",
    },
};
