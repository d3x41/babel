import path from "node:path";
import runFixtureTests from "./helpers/run-fixture-tests.js";
import { parse } from "../lib/index.js";
import { fileURLToPath } from "node:url";

const fixtures = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "fixtures",
);

const blockList = new Set([
  // top level using in script
  "es2026/explicit-resource-management/invalid-script-top-level-using-binding/input.js",
  "es2026/explicit-resource-management/invalid-script-top-level-labeled-using-binding/input.js",
  "es2026/async-explicit-resource-management/invalid-script-top-level-using-binding/input.js",
  "es2026/async-explicit-resource-management/invalid-script-top-level-labeled-using-binding/input.js",

  // top level return in script
  "core/uncategorised/454/input.js",
  "esprima/invalid-syntax/migrated_0171/input.js",

  // top level new.target in script
  "es2015/meta-properties/invalid-arrow-function/input.js",
  "es2015/meta-properties/new-target-invalid/input.js",
  "es2022/class-properties/new-target-invalid/input.js",
  "esprima/es2015-meta-property/invalid-new-target/input.js",
]);
runFixtureTests(
  fixtures,
  (input, options = {}) => {
    return parse(input, { ...options, sourceType: "commonjs" });
  },
  test => {
    const { options = {} } = test;
    return (
      (!options.sourceType || options.sourceType === "script") &&
      ![
        "allowAwaitOutsideFunction",
        "allowReturnOutsideFunction",
        "allowNewTargetOutsideFunction",
      ].some(key => key in options) &&
      !blockList.has(
        path.relative(fixtures, test.actual.loc).replace(/\\/g, "/"),
      )
    );
  },
);
