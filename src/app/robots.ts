import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXTAUTH_URL || "https://finova.ai";
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/about", "/faq", "/learning", "/login", "/register"],
        disallow: ["/dashboard/", "/portal/", "/api/"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
