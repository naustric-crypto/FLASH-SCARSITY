export default function manifest() {
  return {
    name: "Flash-Scarcity",
    short_name: "Flash-Scarcity",
    description: "Urgency-driven Shopify discount campaigns that increase conversion.",
    start_url: "/",
    display: "standalone",
    background_color: "#f5f4ef",
    theme_color: "#006d77",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
