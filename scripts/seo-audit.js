#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const repoRoot = process.cwd();
const appDir = path.join(repoRoot, 'src', 'app');
const toolsDir = path.join(appDir, 'tools');

const readText = (filePath) => {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (err) {
    return null;
  }
};

const listToolPages = () => {
  if (!fs.existsSync(toolsDir)) return [];
  return fs
    .readdirSync(toolsDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .map((dir) => ({
      dir,
      pagePath: path.join(toolsDir, dir, 'page.tsx'),
    }))
    .filter((item) => fs.existsSync(item.pagePath));
};

const extractMetadata = (fileText) => {
  const titleMatch = fileText.match(/\btitle:\s*([`'"])([\s\S]*?)\1/);
  const descriptionMatch = fileText.match(/\bdescription:\s*([`'"])([\s\S]*?)\1/);
  const title = titleMatch ? titleMatch[2].replace(/\s+/g, ' ').trim() : null;
  const description = descriptionMatch ? descriptionMatch[2].replace(/\s+/g, ' ').trim() : null;
  return { title, description };
};

const uniqueTitles = (metadataEntries) => {
  const seen = new Map();
  const duplicates = new Set();
  metadataEntries.forEach((entry) => {
    if (!entry.title) return;
    if (seen.has(entry.title)) {
      duplicates.add(entry.title);
    } else {
      seen.set(entry.title, entry.tool);
    }
  });
  return duplicates;
};

const checkRootTitleTemplate = () => {
  const layoutPath = path.join(appDir, 'layout.tsx');
  const text = readText(layoutPath);
  if (!text) return { ok: false, detail: 'Missing src/app/layout.tsx' };
  const templateMatch = text.match(/template:\s*([`'"])([\s\S]*?)\1/);
  if (!templateMatch) return { ok: false, detail: 'Missing metadata.title.template' };
  const templateValue = templateMatch[2].replace(/\s+/g, ' ').trim();
  return {
    ok: templateValue === 'Herramienta | DevSwiss',
    detail: templateValue,
  };
};

const checkToolLayout = () => {
  const toolsLayoutPath = path.join(appDir, 'tools', 'layout.tsx');
  const toolLayoutPath = path.join(repoRoot, 'src', 'components', 'ToolLayout.tsx');
  const toolsLayoutText = readText(toolsLayoutPath) || '';
  const toolLayoutText = readText(toolLayoutPath) || '';

  const wrapped = toolsLayoutText.includes('ToolLayout') && toolsLayoutText.includes('<ToolLayout>');
  const backLink = toolLayoutText.includes('Volver al Dashboard') && toolLayoutText.includes('href="/"');
  const escHandler = toolLayoutText.includes('Escape') && toolLayoutText.includes("router.push('/')");

  return { wrapped, backLink, escHandler };
};

const checkSitemap = (toolDirs) => {
  const sitemapPath = path.join(appDir, 'sitemap.ts');
  const text = readText(sitemapPath);
  if (!text) return { ok: false, detail: 'Missing src/app/sitemap.ts', missing: toolDirs };

  const entries = new Set();
  const regex = /['"](\/tools\/[^'\"]+)['"]/g;
  let match;
  while ((match = regex.exec(text))) {
    entries.add(match[1]);
  }

  const expected = toolDirs.map((dir) => `/tools/${dir}`);
  const missing = expected.filter((item) => !entries.has(item));
  return {
    ok: missing.length === 0,
    missing,
    countInFile: entries.size,
    expectedCount: expected.length,
  };
};

const checkRobots = () => {
  const robotsPath = path.join(appDir, 'robots.ts');
  const text = readText(robotsPath);
  if (!text) return { ok: false, detail: 'Missing src/app/robots.ts' };
  const allowAll = text.includes("allow: '/'") || text.includes('allow: "/"');
  const sitemap = text.includes('sitemap:') && text.includes('sitemap.xml');
  return {
    ok: allowAll && sitemap,
    allowAll,
    sitemap,
  };
};

const printSection = (title, lines) => {
  console.log(`\n${title}`);
  lines.forEach((line) => console.log(`- ${line}`));
};

const run = () => {
  const toolPages = listToolPages();
  const metadataEntries = toolPages.map((item) => {
    const text = readText(item.pagePath);
    const meta = text ? extractMetadata(text) : { title: null, description: null };
    const descriptionLength = meta.description ? meta.description.length : 0;
    const descriptionOk = descriptionLength >= 140 && descriptionLength <= 160;
    const titleOk = Boolean(meta.title);
    return {
      tool: item.dir,
      pagePath: item.pagePath,
      title: meta.title,
      description: meta.description,
      descriptionLength,
      descriptionOk,
      titleOk,
    };
  });

  const duplicates = uniqueTitles(metadataEntries);
  const rootTemplate = checkRootTitleTemplate();
  const toolLayout = checkToolLayout();
  const sitemap = checkSitemap(toolPages.map((item) => item.dir));
  const robots = checkRobots();

  printSection('SEO Metadata', metadataEntries.map((entry) => {
    const titleStatus = entry.titleOk ? 'title ok' : 'title missing';
    const descStatus = entry.descriptionOk ? 'description ok' : `description ${entry.descriptionLength} chars`;
    const duplicate = entry.title && duplicates.has(entry.title) ? 'duplicate title' : null;
    const flags = [titleStatus, descStatus, duplicate].filter(Boolean).join(', ');
    return `${entry.tool}: ${flags}`;
  }));

  if (duplicates.size > 0) {
    printSection('Duplicate Titles', Array.from(duplicates));
  }

  printSection('Root Title Template', [
    rootTemplate.ok ? 'ok' : `expected "Herramienta | DevSwiss", found "${rootTemplate.detail}"`,
  ]);

  printSection('Tool Layout', [
    toolLayout.wrapped ? 'all tools wrapped by ToolLayout' : 'tools layout missing ToolLayout',
    toolLayout.backLink ? 'back link to / ok' : 'back link missing or wrong',
    toolLayout.escHandler ? 'Esc handler to / ok' : 'Esc handler missing',
  ]);

  printSection('Sitemap', [
    sitemap.ok
      ? `ok (${sitemap.countInFile}/${sitemap.expectedCount})`
      : `missing ${sitemap.missing.length} tool routes (${sitemap.countInFile}/${sitemap.expectedCount})`,
  ]);

  if (!sitemap.ok) {
    printSection('Missing Sitemap URLs', sitemap.missing);
  }

  printSection('Robots', [
    robots.allowAll ? 'allow all ok' : 'allow all missing',
    robots.sitemap ? 'sitemap.xml configured' : 'sitemap.xml missing',
  ]);

  printSection('CloudFront SPA', [
    'manual check required: ensure 403/404 -> /index.html with 200',
  ]);
};

run();
