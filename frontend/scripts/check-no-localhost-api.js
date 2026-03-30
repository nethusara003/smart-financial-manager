import { readdir, readFile } from "fs/promises";
import path from "path";

const SRC_DIR = path.resolve("src");
const ALLOWED_FILES = new Set([
  path.resolve("src/services/apiClient.js"),
]);
const TARGET_REGEX = /http:\/\/localhost:5000\/api/g;
const VALID_EXTENSIONS = new Set([".js", ".jsx", ".ts", ".tsx"]);

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const results = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      const nested = await walk(fullPath);
      results.push(...nested);
      continue;
    }

    if (VALID_EXTENSIONS.has(path.extname(entry.name))) {
      results.push(fullPath);
    }
  }

  return results;
}

async function main() {
  const files = await walk(SRC_DIR);
  const violations = [];

  for (const filePath of files) {
    if (ALLOWED_FILES.has(filePath)) {
      continue;
    }

    const content = await readFile(filePath, "utf8");
    const matches = [...content.matchAll(TARGET_REGEX)];

    if (matches.length > 0) {
      const relativePath = path.relative(process.cwd(), filePath).replaceAll("\\", "/");
      violations.push({
        file: relativePath,
        count: matches.length,
      });
    }
  }

  if (violations.length === 0) {
    console.log("No hardcoded localhost API URLs found.");
    return;
  }

  console.error("Found hardcoded localhost API URLs:");
  for (const violation of violations) {
    console.error(`- ${violation.file} (${violation.count})`);
  }

  process.exit(1);
}

main().catch((error) => {
  console.error("Failed to run localhost API check:", error);
  process.exit(1);
});
