export function GET() {
  const site = 'https://centrix-the-station-klcc.pages.dev'
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${site}/</loc><priority>1.0</priority></url>\n  <url><loc>${site}/privacy-policy</loc><priority>0.3</priority></url>\n  <url><loc>${site}/terms-conditions</loc><priority>0.3</priority></url>\n</urlset>\n`, {
    headers: { 'Content-Type': 'application/xml' },
  })
}
