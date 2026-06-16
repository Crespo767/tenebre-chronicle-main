import server from "../dist/server/server.js";

const BODYLESS_METHODS = new Set(["GET", "HEAD"]);
const RUNTIME_TIMEOUT_MS = 25_000;

function createHeaders(incomingHeaders) {
  const headers = new Headers();

  for (const [key, value] of Object.entries(incomingHeaders)) {
    if (Array.isArray(value)) {
      for (const item of value) headers.append(key, item);
    } else if (value != null) {
      headers.set(key, String(value));
    }
  }

  return headers;
}

async function createRequest(req) {
  const protocol = req.headers["x-forwarded-proto"] ?? "https";
  const host = req.headers.host ?? "localhost";
  const url = new URL(req.url ?? "/", `${protocol}://${host}`);
  const method = req.method ?? "GET";
  const body = BODYLESS_METHODS.has(method)
    ? undefined
    : Buffer.concat(await Array.fromAsync(req, (chunk) => Buffer.from(chunk)));

  return new Request(url, {
    method,
    headers: createHeaders(req.headers),
    body,
  });
}

function createTimeoutResponse(req) {
  console.error(`[vercel-runtime-timeout-guard] ${req.method ?? "GET"} ${req.url ?? "/"}`);

  return new Response("A solicitação demorou demais para responder.", {
    status: 504,
    headers: {
      "cache-control": "no-store",
      "content-type": "text/plain; charset=utf-8",
    },
  });
}

async function fetchWithRuntimeTimeout(req) {
  let timeout;
  const responsePromise = createRequest(req).then((request) => server.fetch(request, {}, {}));

  responsePromise.catch((error) => {
    console.error("[vercel-runtime-late-error]", error);
  });

  const timeoutPromise = new Promise((resolve) => {
    timeout = setTimeout(() => resolve(createTimeoutResponse(req)), RUNTIME_TIMEOUT_MS);
  });

  try {
    return await Promise.race([responsePromise, timeoutPromise]);
  } finally {
    clearTimeout(timeout);
  }
}

export default async function handler(req, res) {
  const response = await fetchWithRuntimeTimeout(req);

  res.statusCode = response.status;
  response.headers.forEach((value, key) => {
    res.setHeader(key, value);
  });

  if (!response.body) {
    res.end();
    return;
  }

  for await (const chunk of response.body) {
    res.write(Buffer.from(chunk));
  }
  res.end();
}
