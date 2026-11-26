const { spawnSync } = require("node:child_process");

const args = process.argv.slice(2);
const bundlerFlags = ["--webpack", "--turbopack", "--turbo"];

if (process.platform === "win32" && !args.some((arg) => bundlerFlags.includes(arg))) {
  args.unshift("--webpack");
}

const result = spawnSync(
  process.execPath,
  [require.resolve("next/dist/bin/next"), "build", ...args],
  {
    env: { ...process.env, NODE_ENV: "production" },
    stdio: "inherit",
  },
);

if (result.error) {
  console.error(result.error.message);
}

process.exitCode = result.status ?? 1;
