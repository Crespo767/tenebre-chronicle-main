import { Readable } from "node:stream";

import server from "../dist/server/server.js";

const BODYLESS_METHODS = new Set(["GET", "HEAD"]);

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

function createRequest(req) {
  const protocol = req.headers["x-forwarded-proto"] ?? "https";
  const host = req.headers.host ?? "localhost";
  const url = new URL(req.url ?? "/", `${protocol}://${host}`);
  const method = req.method ?? "GET";

  return new Request(url, {
    method,
    headers: createHeaders(req.headers),
    body: BODYLESS_METHODS.has(method) ? undefined : Readable.toWeb(req),
    duplex: BODYLESS_METHODS.has(method) ? undefined : "half",
  });
}

export default async function handler(req, res) {
  const response = await server.fetch(createRequest(req), {}, {});

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
