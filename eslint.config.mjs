import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: ["lib/generated/prisma/wasm.js"],
  },
  {
    files: ["**/*.js", "**/*.ts", "**/*.tsx"],
    rules: {
      // Add any global rules here
    },
  },
  {
    // Apply relaxed rules to other Prisma-generated files
    files: ["lib/generated/prisma/**/*.ts"],
    rules: {
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/ban-types": "off",
      "@typescript-eslint/no-namespace": "off",
      "@typescript-eslint/no-unused-expressions": "off",
      "@typescript-eslint/no-require-imports": "off",
    },
  },
];

export default eslintConfig;