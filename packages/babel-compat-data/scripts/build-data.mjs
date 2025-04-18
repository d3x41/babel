import browserCompatData from "@mdn/browser-compat-data" with { type: "json" };
import { generateModuleSupport } from "./build-modules-support.mjs";
import {
  generateData,
  environments,
  writeFile,
  maybeDefineLegacyPluginAliases,
} from "./utils-build-data.mjs";

const compatData = browserCompatData.javascript;
if (process.cwd().endsWith("scripts")) {
  throw new Error("Please run this script from the root of the package");
}

for (const target of ["plugin", "corejs2-built-in"]) {
  // We ignore 'overlapping' here, because it's already generated by
  // built-bugfixes-targets.js which has a complete view over all the
  // plugins that we have data for.
  let { data: newData } = generateData(
    environments,
    (await import(`./data/${target}-features.mjs`)).default
  );
  if (target === "plugin") {
    // add export-namespace-from from @mdn/browser-compat-data
    const exportNamespaceFromCompatData = generateModuleSupport(
      compatData.statements.export.namespace,
      true
    );
    // the node.js compat data is 12.0, the first node version ships `export *` behind a flag
    // here we overwrite to 13.2 which is the first unflagged version
    exportNamespaceFromCompatData.node = "13.2";
    newData["transform-export-namespace-from"] = exportNamespaceFromCompatData;

    // Add proposal-* aliases for backward compatibility.
    newData = maybeDefineLegacyPluginAliases(newData);
  }
  const dataURL = new URL(`../data/${target}s.json`, import.meta.url);

  if (!writeFile(newData, dataURL, target)) {
    process.exitCode = 1;
    break;
  }
}
