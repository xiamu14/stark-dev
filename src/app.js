// 导入所需的模块
import { createServer } from "http";
import fs, { readFileSync } from "fs";
import path, { join } from "path";
import { Edge } from "edge.js";
import express from "express";
import { fileURLToPath } from "url";
import watch from "node-watch";
import convertHtml from "./libs/convertHtml.js";
import { getDocs } from "./libs/getDocs.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// 创建 Express 应用
const app = express();

const edge = Edge.create();
// 设置 Edge 模板引擎
edge.mount(new URL("./views", import.meta.url));

console.log("[path]", path.join(__dirname, "../public"));
app.use(express.static(path.join(__dirname, "../public")));

app.get("/subscribe", (req, res) => {
  // store `res` of client to let us send events at will
  let response = res;

  const headers = {
    "Content-Type": "text/event-stream",
    Connection: "keep-alive",
    "Cache-Control": "no-cache",
  };
  res.writeHead(200, headers);

  // send client a simple response
  res.write("you are subscribed\n\n");
  watch(
    path.join(__dirname, "../"),
    {
      recursive: true,
      filter(f, skip) {
        // skip node_modules
        if (/\/node_modules/.test(f)) return skip;
        // skip .git folder
        if (/\.git/.test(f)) return skip;
        // only watch for js files
        return /\.md$/.test(f);
      },
    },
    () => {
      console.log("[update]");
      response.write("data: refresh\n\n");
    }
  );
  // listen for client 'close' requests
  req.on("close", () => {
    response = res;
  });
});
// 设置路由来处理博客文章的展示
app.get("/draft/*", async (req, res) => {
  // 使用 contentlayer 读取指定 id 的博客文章数据
  // const blogPost = contentlayer.getBlogPostById(req.params.id);
  console.log(
    "%c req",
    "color:white;background: #18a0f1;padding:4px",
    req.params["0"].slice(0)
  );
  const pathname = req.params["0"].slice(0);
  const fileName = pathname.replace("/", "");
  console.log("[fileName]", fileName);
  const files = await getDocs();

  const file = files.find((item) =>
    new RegExp(fileName, "i").test(item.fileName)
  );

  if (!file) {
    res.send("404");
  }

  const content = await convertHtml(file.content);
  const routes = files.map((item) => ({
    name: item?.frontMatter?.title ?? item.fileName,
    path: item.fileName,
    isActive: new RegExp(fileName, "i").test(item.fileName),
  }));
  console.log("[routes]", routes);
  const html = await edge.render("main", {
    content,
    routes,
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
