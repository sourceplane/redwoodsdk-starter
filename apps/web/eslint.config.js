import base from "@app/eslint-config";

export default [
  ...base,
  {
    ignores: ["worker-configuration.d.ts"],
  },
];
