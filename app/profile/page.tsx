"use client";

import { ChangeEvent, FC, useEffect, useState } from "react";
import clsx from "clsx";
import { Avatar } from "primereact/avatar";
import { Button } from "primereact/button";
import { Password } from "primereact/password";
import { useAuth } from "@/app/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

const ProfilePage: FC = () => {
    const { user, loading } = useAuth();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
    const [userInitial, setUserInitial] = useState<string>("");

    // Benutzerinitialen für Avatar-Darstellung extrahieren
    useEffect(() => {
        if (user?.email) {
            const email = user.email;
            setUserInitial(email.substring(0, 1).toUpperCase());
        } else {
            setUserInitial("");
        }
    }, [user]);

    const handlePasswordChange = async () => {
        setPasswordError(null);
        setPasswordSuccess(null);

        if (password.length < 6) {
            setPasswordError("Password must be at least 6 characters long.");
            return;
        }

        const { error } = await supabase.auth.updateUser({ password });

        if (error) {
            setPasswordError("Failed to update password. Please try again.");
        } else {
            setPasswordSuccess("Password updated successfully.");
            setPassword("");
        }
    };

    const handlePasswordRepeatChange = (e: ChangeEvent<HTMLInputElement>) => {
        setPasswordError("");
        const value = e.target.value;
        setConfirmPassword(value);
        if (value !== password) {
            setPasswordError("Passwörter stimmen nicht überein");
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    if (!user) {
        return (
            <div className="flex justify-center items-center h-screen">No profile data found.</div>
        );
    }

    return (
        <div className="p-4 flex justify-center h-full">
            <div className="w-full max-w-lg bg-white shadow-lg rounded-lg p-6">
                <h1 className="text-3xl font-bold mb-6 text-center text-blue-600">Profile</h1>
                <div className="flex flex-col items-center mb-6">
                    <Avatar
                        label={userInitial}
                        shape="circle"
                        className={clsx(
                            "bg-primary w-24 h-24 text-2xl flex items-center justify-center"
                        )}
                    />
                    <div className="mt-4 text-center">
                        <p className="text-xl font-semibold text-gray-800">{user.email}</p>
                    </div>
                </div>

                <div className="mb-6">
                    <h2 className="text-lg font-semibold mb-4 text-center text-gray-700">
                        Change Password
                    </h2>
                    <div className="mb-4 grid gap-2 grid-cols-1">
                        <div className="field">
                            <label htmlFor="password" className="block mb-2">
                                Passwort
                            </label>
                            <Password
                                id="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                toggleMask
                                className="w-full [&>div]:w-full [&>div>input]:w-full"
                                placeholder="Passwort eingeben"
                                required
                            />
                        </div>

                        <div className="field">
                            <label htmlFor="confirmPassword" className="block mb-2">
                                Passwort bestätigen
                            </label>
                            <Password
                                id="confirmPassword"
                                value={confirmPassword}
                                onChange={handlePasswordRepeatChange}
                                toggleMask
                                feedback={false}
                                className="w-full [&>div]:w-full [&>div>input]:w-full"
                                placeholder="Passwort wiederholen"
                                required
                            />
                        </div>
                    </div>
                    {passwordError && <p className="text-red-500 text-sm mb-4">{passwordError}</p>}
                    {passwordSuccess && (
                        <p className="text-green-500 text-sm mb-4">{passwordSuccess}</p>
                    )}
                    <Button
                        label="Update Password"
                        onClick={handlePasswordChange}
                        className="w-full p-button-primary p-button-raised"
                    />
                </div>

                <Button
                    label="Sign Out"
                    className="p-button-danger w-full p-button-raised mt-4"
                    onClick={async () => {
                        const { error } = await supabase.auth.signOut();
                        if (error) {
                            console.error("Error signing out:", error);
                        } else {
                            window.location.href = "/auth/login";
                        }
                    }}
                />
            </div>
        </div>
    );
};

export default ProfilePage;
