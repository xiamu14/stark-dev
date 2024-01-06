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
    process.cwd(),
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
      response.write("data: refresh\n\n");
    }
  );
  // listen for client 'close' requests
  req.on("close", () => {
    response = res;
  });
});
app.get("/api/draft/*", async (req, res) => {
  const route = req.params["0"].slice(0);

  const files = await getDocs();

  const file = files.find((item) => route === item.route);
  res.setHeader("content-type", "application/json");

  if (!file) {
    res.send({ content: "" });
  } else {
    const content = await convertHtml(file.content);
    res.send({ content });
  }
});
app.get("/", async (req, res) => {
  const files = await getDocs();
  res.redirect(`/draft/${files[0].route}`);
});
// 设置路由来处理博客文章的展示
app.get("/draft/*", async (req, res) => {
  // 使用 contentlayer 读取指定 id 的博客文章数据
  // const blogPost = contentlayer.getBlogPostById(req.params.id);

  const pathname = req.params["0"].slice(0);
  const route = pathname.replace("/", "");
  const files = await getDocs();

  const file = files.find((item) => route === item.route);

  if (!file) {
    res.send("404");
  } else {
    const content = await convertHtml(file.content);
    const routes = files.map((item) => ({
      name: item?.frontMatter?.title ?? item.fileName,
      path: item.route,
    }));
    const html = await edge.render("main", {
      content,
      routes,
    });

    res.setHeader("content-type", "text/html");
    res.send(html);
  }
});

// 启动 Express 服务器
const server = createServer(app);
try {
  server.listen(3000, () => {
    console.log(
      "Server is running on port 3000: localhost:3000" +
        "\n" +
        "http://127.0.0.1:3000"
    );
  });
} catch (error) {}
