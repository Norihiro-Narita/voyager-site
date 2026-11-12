// 依存パッケージなしの静的サイトビルド: src/ + public/ → dist/
//   node build.mjs
import { readFileSync, writeFileSync, mkdirSync, readdirSync, cpSync, rmSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(fileURLToPath(import.meta.url));
const SRC = join(ROOT, "src");
const DIST = join(ROOT, "dist");
const read = (p) => readFileSync(p, "utf-8");

const site = JSON.parse(read(join(SRC, "data/site.json")));
const layout = read(join(SRC, "layout.html"));
const partial = (name) => read(join(SRC, "partials", `${name}.html`));

// "{{> name}}" をパーシャルに展開
const withPartials = layout.replace(/\{\{>\s*([\w-]+)\s*\}\}/g, (_, n) => partial(n).trimEnd());

// "{{key}}" を置換。未定義のキーはエラーにする(タイプミス防止)
function render(tpl, vars, label) {
  return tpl.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_, k) => {
    if (!(k in vars)) throw new Error(`${label}: 未定義の変数 {{${k}}}`);
    return vars[k];
  });
}

// ---- メニュー生成 ----
const link = (item, current, cls = "") => {
  const aria = item.key && item.key === current ? ' aria-current="page"' : "";
  return `    <a${cls ? ` class="${cls}"` : ""} href="${item.href}"${aria}>${item.label}</a>`;
};
const navHtml = (current) =>
  [...site.nav.map((i) => link(i, current)), link(site.cta, current, "btn btn-small")].join("\n");
const footerNavHtml = () => site.footerNav.map((i) => link(i, null)).join("\n");

// ---- front matter ----
function parsePage(text, file) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!m) throw new Error(`${file}: 先頭に front matter(--- ... ---)が必要です`);
  const meta = {};
  for (const line of m[1].split(/\r?\n/)) {
    const i = line.indexOf(":");
    if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  return { meta, body: m[2] };
}

const pageHead = (heading) =>
  heading
    ? `<section class="page-head"><div class="container">
  <nav class="crumb" aria-label="パンくず"><a href="index.html">トップ</a> &gt; ${heading}</nav>
  <h1>${heading}</h1>
</div></section>`
    : "";

// ---- ビルド ----
rmSync(DIST, { recursive: true, force: true });
mkdirSync(DIST, { recursive: true });
if (existsSync(join(ROOT, "public"))) cpSync(join(ROOT, "public"), DIST, { recursive: true });

const pagesDir = join(SRC, "pages");
const built = [];
for (const file of readdirSync(pagesDir).filter((f) => f.endsWith(".html"))) {
  const { meta, body } = parsePage(read(join(pagesDir, file)), file);
  const title = meta.title || (meta.heading ? `${meta.heading} | ${site.name}` : site.name);
  const vars = {
    "site.name": site.name,
    title,
    description: meta.description || site.description,
    nav: navHtml(meta.current),
    footerNav: footerNavHtml(),
    pagehead: pageHead(meta.heading),
    content: body.trim(),
  };
  // 本文は変数展開の対象外(ページ内の {{ }} を壊さない)ため、先にレイアウトだけ展開
  const html = render(withPartials, { ...vars, content: "\u0000CONTENT\u0000" }, file).replace("\u0000CONTENT\u0000", () => vars.content);
  writeFileSync(join(DIST, file), html);
  built.push(file);
}

// ---- リンクチェック ----
let broken = 0;
for (const file of built) {
  for (const m of read(join(DIST, file)).matchAll(/(?:href|src)="([^"#?:]+\.(?:html|css|js|svg|png))(?:#[^"]*)?"/g)) {
    if (!existsSync(join(DIST, m[1]))) { console.error(`リンク切れ: ${file} -> ${m[1]}`); broken++; }
  }
}
console.log(`✔ ${built.length} ページを dist/ に出力しました: ${built.join(", ")}`);
if (broken) { console.error(`✖ リンク切れ ${broken} 件`); process.exit(1); }
