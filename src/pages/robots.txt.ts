export function GET() {
  const site = 'https://centrix-the-station-klcc.pages.dev'
  return new Response(`User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api\nSitemap: ${site}/sitemap.xml\n`, {
    headers: { 'Content-Type': 'text/plain' },
  })
}
