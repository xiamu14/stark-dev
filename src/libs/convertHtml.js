import rehypeStringify from "rehype-stringify";
import remarkParse from "remark-parse";
import remarkFrontmatter from "remark-frontmatter";
import remarkRehype from "remark-rehype";
import rehypeShikiji from "rehype-shikiji";
import remarkGfm from "remark-gfm";
import { unified } from "unified";

export default async function convertHtml(markdown) {
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeShikiji, {
      // or `theme` for a single theme
      themes: {
        light: "vitesse-light",
        dark: "vitesse-dark",
      },
    })
    .use(rehypeStringify)
    .use(remarkFrontmatter)
    .process(markdown);
  return String(file);
}
