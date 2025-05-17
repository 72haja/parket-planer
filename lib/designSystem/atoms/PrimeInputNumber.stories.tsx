import { FC, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { PrimeInputNumber, PrimeInputNumberProps } from "./PrimeInputNumber";

const InteractiveInputNumber: FC<PrimeInputNumberProps> = () => {
    const [value, setValue] = useState(0);
    return (
        <PrimeInputNumber
            value={value}
            onValueChange={e => setValue(e.value ?? 0)}
            min={0}
            max={100}
            step={1}
        />
    );
};

const meta: Meta<typeof PrimeInputNumber> = {
    title: "DesignSystem/Atoms/PrimeInputNumber",
    component: PrimeInputNumber,
    tags: ["autodocs"],
    render: args => <InteractiveInputNumber {...args} />,
};
export default meta;

type Story = StoryObj<typeof PrimeInputNumber>;

export const Basic: Story = {
    args: {
        value: 0,
        min: 0,
        max: 100,
        step: 1,
    },
};
