const [url, timeoutArg] = process.argv.slice(2);

if (!url) {
  console.error('Usage: node wait-for-url.mjs <url> [timeoutMs]');
  process.exit(1);
}

const timeoutMs = Number(timeoutArg ?? 120_000);
const pollIntervalMs = 2_000;
const startedAt = Date.now();

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

while (Date.now() - startedAt < timeoutMs) {
  try {
    const response = await fetch(url);
    if (response.ok) {
      process.exit(0);
    }
  } catch {
    // Keep waiting until timeout.
  }

  await sleep(pollIntervalMs);
}

console.error(`Timed out waiting for ${url}`);
process.exit(1);
