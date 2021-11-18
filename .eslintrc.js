module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  // extends: ["airbnb-base", "prettier"],
  extends: ["airbnb-base", "prettier"],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: "module",
  },
  rules: {
    "no-console": process.env.NODE_ENV === "production" ? 2 : 0,
    "func-names": ["off"],
    "no-unused-vars": ["off"],
    "no-plusplus": ["off"],
    "no-param-reassign": ["off"],
    "prefer-const": ["off"],
  },
};
