// 导入所需的模块
import { createServer } from "http";
import fs, { readFileSync } from "fs";
import path, { join } from "path";
import { Edge } from "edge.js";
import express from "express";
import { fileURLToPath } from "url";
import convertHtml from "./libs/convertHtml.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// 创建 Express 应用
const app = express();

const edge = Edge.create();
// 设置 Edge 模板引擎
edge.mount(new URL("./views", import.meta.url));
app.use(express.static("public"));
// 设置路由来处理博客文章的展示
app.get("*", async (req, res) => {
  // 使用 contentlayer 读取指定 id 的博客文章数据
  // const blogPost = contentlayer.getBlogPostById(req.params.id);
  console.log(
    "%c req",
    "color:white;background: #18a0f1;padding:4px",
    req.params["0"].slice(0)
  );
  const markdown = fs.readFileSync(path.join(__dirname, "drafts", "hello.md"), {
    encoding: "utf-8",
  });
  const content = await convertHtml(markdown);

  const html = await edge.render("main", {
    content,
  });

  res.setHeader("content-type", "text/html");
  res.send(html);
});

// 启动 Express 服务器
const server = createServer(app);
server.listen(3000, () => {
  console.log(
    "Server is running on port 3000: localhost:3000" +
      "\n" +
      "http://127.0.0.1:3000"
  );
});
