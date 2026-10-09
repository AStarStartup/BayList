import nextConfig from "eslint-config-next";

const eslintConfig = [
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "next-env.d.ts",
      "types.d.ts",
      "scripts/**",
      "*.config.js",
      "*.config.mjs",
      "package-lock.json",
      "Inventory.json",
      "tsconfig.tsbuildinfo",
    ],
  },
  ...nextConfig,
  {
    rules: {
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      "@next/next/no-img-element": "off",
    },
  },
];

export default eslintConfig;
