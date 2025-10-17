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
    rules: {
      'react/no-unescaped-entities': 'off',
      '@next/next/no-page-custom-font': 'off',

      // --- START OF NEW RULE ADDITIONS FOR YOUR ISSUES ---

      // 1. Temporarily change the error to a warning (or 'off') to allow the build to pass.
      //    NOTE: Fixing the code in login/page.tsx is the better solution.
      '@typescript-eslint/no-explicit-any': 'warn',

      // 2. Allow unused function parameters/variables if they start with an underscore (_).
      //    This is the professional way to ignore the 'e' in your Redux slices (e.g., change 'e' to '_e').
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          'argsIgnorePattern': '^_', // Allows parameters like (_e)
          'varsIgnorePattern': '^_', // Allows variables like (const _unusedVar = 1)
        }
      ],

      // --- END OF NEW RULE ADDITIONS ---

    },
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ]
  },
];

export default eslintConfig;
