import { glob } from "glob";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import yaml from "js-yaml";

export async function getDocs() {
  const files = await glob("**/*.md", { ignore: "node_modules/**" });

  const docs = files.map((file) => {
    const filePath = path.join(process.cwd(), file);

    const content = fs.readFileSync(filePath, {
      encoding: "utf-8",
    });

    const frontMeta = /---(.*?)---/gs.exec(content);
    let frontMatter;
    if (frontMeta) {
      frontMatter = yaml.load(frontMeta[1]);
      console.log(frontMatter);
    }

    return {
      filePath,
      fileName: path.basename(filePath),
      content,
      frontMatter,
    };
  });
  // console.log("[docs]", docs);
  return docs;
}
