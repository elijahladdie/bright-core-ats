const { spawnSync } = require("node:child_process");
const { resolve } = require("node:path");
const dotenv = require("dotenv");

dotenv.config({ path: resolve(__dirname, "../../../.env") });

const command = process.platform === "win32" ? "prisma.cmd" : "prisma";
const result = spawnSync(command, process.argv.slice(2), {
  env: process.env,
  shell: process.platform === "win32",
  stdio: "inherit",
});

if (result.error) {
  console.error("Unable to run Prisma CLI:", result.error.message);
  process.exit(1);
}

process.exit(result.status ?? 1);
