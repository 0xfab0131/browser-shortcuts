module.exports = {
  root: true,
  env: {
    browser: true,
    es2020: true,
    node: true,
  },
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
  },
  plugins: ["@typescript-eslint"],
  rules: {
    "no-undef": "off", // Tampermonkey APIとの互換性のため
    "@typescript-eslint/no-explicit-any": "off", // 必要に応じて
    "@typescript-eslint/explicit-module-boundary-types": "off",
  },
  globals: {
    GM_info: "readonly",
    GM_setValue: "readonly",
    GM_getValue: "readonly",
    GM_deleteValue: "readonly",
    GM_listValues: "readonly",
    GM_addValueChangeListener: "readonly",
    GM_removeValueChangeListener: "readonly",
    GM_setClipboard: "readonly",
    GM_xmlhttpRequest: "readonly",
    GM_download: "readonly",
    GM_getTab: "readonly",
    GM_saveTab: "readonly",
    GM_getTabs: "readonly",
    GM_notification: "readonly",
    GM_openInTab: "readonly",
    GM_registerMenuCommand: "readonly",
    GM_unregisterMenuCommand: "readonly",
    GM_addStyle: "readonly",
    GM_getResourceText: "readonly",
    GM_getResourceURL: "readonly",
    unsafeWindow: "readonly",
  },
};
