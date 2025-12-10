import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { extractPropertySlug, getPropertyMetaBySlug, injectMetaTags } from "./seoMiddleware";

export function serveStatic(app: Express) {
  const distPath = path.resolve(process.cwd(), "dist", "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  app.use(express.static(distPath));

  app.use("*", async (req, res) => {
    const indexPath = path.resolve(distPath, "index.html");
    const url = req.originalUrl;
    const slug = extractPropertySlug(url);

    if (slug) {
      try {
        const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'https';
        const host = req.headers['x-forwarded-host'] || req.headers.host || '';
        const baseUrl = `${protocol}://${host}`;
        
        const meta = await getPropertyMetaBySlug(slug, baseUrl);
        if (meta) {
          let html = await fs.promises.readFile(indexPath, "utf-8");
          html = injectMetaTags(html, meta);
          res.status(200).set({ "Content-Type": "text/html" }).end(html);
          return;
        }
      } catch (error) {
        console.error('Error injecting property meta:', error);
      }
    }

    res.sendFile(indexPath);
  });
}
