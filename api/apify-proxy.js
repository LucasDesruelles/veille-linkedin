// api/apify.js — Vercel Serverless Function (proxy Apify)
// Place this file at /api/apify.js in your Vercel project root

export default async function handler(req, res) {
  // Allow CORS from your own domain
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Reconstruct the target Apify URL from query param
  // e.g. /api/apify?path=acts/actor~name/runs&token=xxx
  const { path, ...queryParams } = req.query;

  if (!path) {
    return res.status(400).json({ error: "Missing path param" });
  }

  const queryString = new URLSearchParams(queryParams).toString();
  const targetUrl = `https://api.apify.com/v2/${path}${queryString ? "?" + queryString : ""}`;

  try {
    const apifyRes = await fetch(targetUrl, {
      method: req.method,
      headers: { "Content-Type": "application/json" },
      body: req.method !== "GET" ? JSON.stringify(req.body) : undefined,
    });

    const data = await apifyRes.json();
    return res.status(apifyRes.status).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
