/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Nada de esta app debe quedar en cache de un intermediario: el contenido
  // depende de un token que puede revocarse en cualquier momento.
  async headers() {
    return [{ source: "/:path*", headers: [
      { key: "Cache-Control", value: "no-store, max-age=0" },
      { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
      { key: "Referrer-Policy", value: "no-referrer" },
      { key: "X-Content-Type-Options", value: "nosniff" },
    ]}];
  },
};
export default nextConfig;
