import reactCompiler from "eslint-plugin-react-compiler";
import { nextJsConfig } from "@becklyn/eslint/next-js";

/** @type {import("eslint").Linter.Config} */
export default [
    ...nextJsConfig,
    {
        plugins: {
            "react-compiler": reactCompiler,
        },
        rules: {
            "react-compiler/react-compiler": "error",
        },
    },
];
