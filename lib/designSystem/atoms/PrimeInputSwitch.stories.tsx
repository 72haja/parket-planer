import { FC, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { PrimeInputSwitch, PrimeInputSwitchProps } from "./PrimeInputSwitch";

const InteractivePrimeInputSwitch: FC<PrimeInputSwitchProps> = props => {
    const [checked, setChecked] = useState(false);
    return <PrimeInputSwitch {...props} checked={checked} onChange={e => setChecked(e.value)} />;
};

const meta: Meta<typeof PrimeInputSwitch> = {
    title: "DesignSystem/Atoms/PrimeInputSwitch",
    component: PrimeInputSwitch,
    tags: ["autodocs"],
    render: args => <InteractivePrimeInputSwitch {...args} />,
};
export default meta;

type Story = StoryObj<typeof PrimeInputSwitch>;

export const Basic: Story = {
    args: {
        checked: false,
    },
};

export const WithLabel: Story = {
    args: {
        checked: false,
        label: "Label",
    },
};
