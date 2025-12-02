const express = require("express");
const path = require("path");
const { exec } = require("child_process");

const app = express();
const PORT = 3000;

// Simple request logger to help debug incoming requests
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const ms = Date.now() - start;
    console.log(new Date().toISOString(), req.method, req.url, res.statusCode, `${ms}ms`);
  });
  next();
});

// Serve vendor files from the project's content/vendors folder
app.use('/vendors', express.static(path.join(__dirname, 'content/vendors')));

// Serve Cloudflare/cdn-cgi static scripts if referenced
app.use('/cdn-cgi', express.static(path.join(__dirname, 'cdn-cgi')));

// Redirect legacy/absolute paths to the correct locations under the static root.
// This helps when files or templates reference `/content/frontend/...` or `/main/...`.
app.use((req, res, next) => {
  if (req.path.startsWith('/content/frontend/')) {
    const newPath = req.path.replace('/content/frontend', '') || '/';
    return res.redirect(301, newPath + (req.url.includes('?') ? ('?' + req.url.split('?')[1]) : ''));
  }
  if (req.path.startsWith('/main/')) {
    const newPath = req.path.replace('/main', '') || '/';
    return res.redirect(301, newPath + (req.url.includes('?') ? ('?' + req.url.split('?')[1]) : ''));
  }
  next();
});

// Handle devtools endpoint specifically before static files
app.get('/.well-known/appspecific/com.chrome.devtools.json', (req, res) => {
  // Broaden CSP to allow Google Maps embed and related resources so
  // the iframe-based map can load its scripts and assets.
  res.setHeader("Content-Security-Policy", "default-src 'self'; connect-src 'self' https://static.cloudflareinsights.com https://maps.googleapis.com https://maps.gstatic.com https://unpkg.com https://cdn.jsdelivr.net; script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com https://maps.googleapis.com https://maps.gstatic.com https://unpkg.com https://cdn.jsdelivr.net; img-src 'self' data: https: https://maps.gstatic.com https://*.tile.openstreetmap.org; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://fonts.gstatic.com https://unpkg.com https://cdn.jsdelivr.net; font-src 'self' https://fonts.gstatic.com https://fonts.googleapis.com; frame-src 'self' https://www.google.com https://maps.google.com https://www.openstreetmap.org https://www.google.co.in https://maps.gstatic.com;");
  res.status(404).end(); // Return 404 as this endpoint doesn't exist
});

// Set Content Security Policy before static files to override serve-static's CSP
app.use((req, res, next) => {
  // Broaden CSP to allow Google Maps embed and related resources so
  // the iframe-based map can load its scripts and assets.
  res.setHeader("Content-Security-Policy", "default-src 'self'; connect-src 'self' https://static.cloudflareinsights.com https://maps.googleapis.com https://maps.gstatic.com https://unpkg.com https://cdn.jsdelivr.net; script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com https://maps.googleapis.com https://maps.gstatic.com https://unpkg.com https://cdn.jsdelivr.net; img-src 'self' data: https: https://maps.gstatic.com https://*.tile.openstreetmap.org; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://fonts.gstatic.com https://unpkg.com https://cdn.jsdelivr.net; font-src 'self' https://fonts.gstatic.com https://fonts.googleapis.com; frame-src 'self' https://www.google.com https://maps.google.com https://www.openstreetmap.org https://www.google.co.in https://maps.gstatic.com;");
  next();
});

// Serve static files (HTML, CSS, JS, images, videos, favicon, etc.)
app.use(express.static(path.join(__dirname, "content/frontend")));

// Default route: load index.html from the frontend folder
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "content/frontend", "index.html"));
});

// Helper to open default browser cross-platform
function openBrowser(url) {
  const platform = process.platform;
  let cmd;
  if (platform === 'win32') {
    // Use cmd to run start (works from PowerShell too)
    cmd = `cmd /c start "" "${url}"`;
  } else if (platform === 'darwin') {
    cmd = `open "${url}"`;
  } else {
    cmd = `xdg-open "${url}"`;
  }
  exec(cmd, (err) => {
    if (err) console.error('Failed to open browser:', err);
  });
}

// Start server
app.listen(PORT, () => {
  const url = `http://127.0.0.1:${PORT}`;
  console.log(`Server running at ${url}`);
  // Try to open the default browser automatically
  openBrowser(url);
});
