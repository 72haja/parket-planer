import { FC } from "react";
import { LandingPage } from "@/components/LandingPage";

const Home: FC = () => {
    return (
        <div className="z-10 w-full h-screen place-items-center text-sm lg:grid">
            <LandingPage />
        </div>
    );
};

export default Home;
