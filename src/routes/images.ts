import { Router } from "express";

// Simple image proxy to make cross-origin images CORS-safe for html2canvas/pdf export
// Security: restrict to http/https URLs and optionally to an allowlist of hosts via env IMAGE_PROXY_ALLOW_HOSTS (comma-separated)
const router = Router();

const parseAllowHosts = (): Set<string> => {
    const raw = process.env.IMAGE_PROXY_ALLOW_HOSTS || "";
    return new Set(raw.split(",").map(s => s.trim()).filter(Boolean));
};

const defaultAllowedHostSuffixes = [
    ".amazonaws.com",
    ".s3.amazonaws.com",
    ".cloudfront.net",
];

router.get("/proxy", async (req, res) => {
    try {
        const url = (req.query.url as string) || "";
        if (!url) return res.status(400).json({ success: false, message: "Missing url" });

        let target: URL;
        try { target = new URL(url); } catch (e) {
            return res.status(400).json({ success: false, message: "Invalid URL" });
        }
        if (!(target.protocol === "http:" || target.protocol === "https:")) {
            return res.status(400).json({ success: false, message: "Unsupported protocol" });
        }

        const allowHosts = parseAllowHosts();
        const hostAllowed = allowHosts.size > 0
            ? allowHosts.has(target.host)
            : defaultAllowedHostSuffixes.some(suf => target.host.endsWith(suf));
        if (!hostAllowed) {
            return res.status(403).json({ success: false, message: "Host not allowed" });
        }

        const upstream = await fetch(target.toString(), {
            method: "GET",
            // Pass through no credentials for public assets
            redirect: "follow",
            // Limit timeouts via AbortController if needed in future
        });
        if (!upstream.ok) {
            return res.status(upstream.status).json({ success: false, message: `Upstream error ${upstream.status}` });
        }

        const contentType = upstream.headers.get("content-type") || "application/octet-stream";
        const cacheControl = upstream.headers.get("cache-control") || "public, max-age=86400"; // 1 day

        res.setHeader("Content-Type", contentType);
        res.setHeader("Cache-Control", cacheControl);
        // Allow cross-origin usage for canvas
        res.setHeader("Access-Control-Allow-Origin", "*");

        const arrayBuffer = await upstream.arrayBuffer();
        return res.status(200).send(Buffer.from(arrayBuffer));
    } catch (err) {
        console.error("Image proxy error:", err);
        return res.status(500).json({ success: false, message: "Proxy failed" });
    }
});

export default router;
