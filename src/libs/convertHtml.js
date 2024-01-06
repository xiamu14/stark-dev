import rehypeSanitize from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";
import remarkParse from "remark-parse";
import remarkFrontmatter from "remark-frontmatter";
import remarkRehype from "remark-rehype";
import rehypePrettyCode from "rehype-pretty-code";
import remarkGfm from "remark-gfm";
import { unified } from "unified";
import fs from "node:fs";
export default async function convertHtml(markdown) {
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypePrettyCode, {
      theme: JSON.parse(
        fs.readFileSync(
          new URL("../themes/vitesse-light.json", import.meta.url),
          "utf-8"
        )
      ),
    })
    .use(rehypeStringify)
    .use(remarkFrontmatter)
    .process(markdown);
  return String(file);
}
