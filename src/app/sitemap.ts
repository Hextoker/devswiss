import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/utils/siteUrl";

export const dynamic = "force-static";

const toolPaths = [
  "/tools/rut-validator",
  "/tools/json-master",
  "/tools/base64-lab",
  "/tools/cron-predictor",
  "/tools/regex-lab",
  "/tools/hash-generator",
  "/tools/glassmorphism-gen",
  "/tools/jwt-inspector",
  "/tools/security-audit",
  "/tools/cors-tester",
  "/tools/svg-optimizer",
  "/tools/sql-formatter",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getSiteUrl();
  const lastModified = new Date();

  return [
    {
      url: baseUrl,
      lastModified,
    },
    ...toolPaths.map((path) => ({
      url: `${baseUrl}${path}`,
      lastModified,
    })),
  ];
}
