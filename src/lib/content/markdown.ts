import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeSlug from "rehype-slug";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeStringify from "rehype-stringify";

const processor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype)
  .use(rehypeSlug)
  .use(rehypePrettyCode, {
    theme: { light: "github-light", dark: "github-dark-dimmed" },
    keepBackground: false,
    defaultLang: "plaintext",
  })
  .use(rehypeStringify);

export async function markdownToHtml(markdown: string): Promise<string> {
  return String(await processor.process(markdown));
}

export function codeToMarkdown(code: string, lang: string): string {
  return "```" + lang + "\n" + code.trimEnd() + "\n```";
}

export type TocItem = { id: string; text: string };

/** `## ` sarlavhalaridan mundarija; id'lar rehype-slug natijasiga mos. */
export function extractToc(html: string): TocItem[] {
  return [...html.matchAll(/<h2 id="([^"]+)">(.*?)<\/h2>/g)].map((m) => ({
    id: m[1],
    text: m[2].replace(/<[^>]+>/g, ""),
  }));
}
