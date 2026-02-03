import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

export default [
    js.configs.recommended,
    ...tseslint.configs.recommended,
    {
        files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],
        languageOptions: {
            globals: {
                ...globals.node,
            },
        },
        rules: {
            // TypeScript-specific rules for better code quality
            "@typescript-eslint/no-explicit-any": "warn",
            "@typescript-eslint/explicit-function-return-type": ["warn", {
                allowExpressions: true,
                allowTypedFunctionExpressions: true,
            }],
            // Security rules
            "no-console": ["warn", { allow: ["warn", "error"] }],
            // Code quality rules
            "no-unused-vars": "off", // Use TypeScript's version instead
            "@typescript-eslint/no-unused-vars": ["error", {
                argsIgnorePattern: "^_",
                varsIgnorePattern: "^_",
            }],
        },
    },
];