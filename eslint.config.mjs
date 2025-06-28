import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname
});

const eslintConfig = [
  // Ignore generated Prisma WASM file
  {
    ignores: ["lib/generated/**"]
  },

  // Extend Next.js and TypeScript rules
  ...compat.extends("next/core-web-vitals", "next/typescript")
];

export default eslintConfig;
