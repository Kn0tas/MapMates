module.exports = {
  root: true,
  extends: ["universe/native", "universe/shared/typescript-analysis"],
  parserOptions: {
    project: "./tsconfig.eslint.json",
    tsconfigRootDir: __dirname,
  },
  rules: {
    "import/prefer-default-export": "off",
  },
};
