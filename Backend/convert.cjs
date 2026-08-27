const fs = require("fs");
const path = require("path");

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    if (fs.statSync(dirPath).isDirectory()) walkDir(dirPath, callback);
    else if (dirPath.endsWith(".js") || dirPath.endsWith(".mjs")) callback(dirPath);
  });
}

const routesDir = path.join(__dirname, "routes");
const middlewareDir = path.join(__dirname, "middleware");

function processFile(filePath) {
  let code = fs.readFileSync(filePath, "utf-8");
  let modified = false;

  const queries = [
    { reg: /db\.prepare\((.*?)\)\.get\((.*?)\)/gs, rep: (m, sql, args) => args && args.trim() ? `await c.env.DB.prepare(${sql}).bind(${args}).first()` : `await c.env.DB.prepare(${sql}).first()` },
    { reg: /db\.prepare\((.*?)\)\.get\(\)/gs, rep: `await c.env.DB.prepare($1).first()` },
    { reg: /db\.prepare\((.*?)\)\.all\((.*?)\)/gs, rep: (m, sql, args) => args && args.trim() ? `(await c.env.DB.prepare(${sql}).bind(${args}).all()).results` : `(await c.env.DB.prepare(${sql}).all()).results` },
    { reg: /db\.prepare\((.*?)\)\.all\(\)/gs, rep: `(await c.env.DB.prepare($1).all()).results` },
    { reg: /db\.prepare\((.*?)\)\.run\((.*?)\)/gs, rep: (m, sql, args) => args && args.trim() ? `await c.env.DB.prepare(${sql}).bind(${args}).run()` : `await c.env.DB.prepare(${sql}).run()` },
    { reg: /db\.prepare\((.*?)\)\.run\(\)/gs, rep: `await c.env.DB.prepare($1).run()` }
  ];

  queries.forEach(({reg, rep}) => {
    if (reg.test(code)) {
      code = code.replace(reg, rep);
      modified = true;
    }
  });

  const honoReplacements = [
    { reg: /const express = require\("express"\);/g, rep: `import { Hono } from "hono";` },
    { reg: /const router = express\.Router\(\);/g, rep: `const router = new Hono();` },
    { reg: /module\.exports = router;/g, rep: `export default router;` },
    { reg: /router\.(get|post|put|delete|patch)\((.*?),\s*(?:async\s*)?\(\s*req,\s*res\s*\)\s*=>\s*\{/gs, rep: `router.$1($2, async (c) => {` },
    { reg: /router\.(get|post|put|delete|patch)\((.*?),\s*(.*?),\s*(?:async\s*)?\(\s*req,\s*res\s*\)\s*=>\s*\{/gs, rep: `router.$1($2, $3, async (c) => {` },
    { reg: /return res\.json\(/g, rep: `return c.json(` },
    { reg: /res\.json\(/g, rep: `return c.json(` },
    { reg: /return res\.status\((.*?)\)\.json\((.*?)\);/gs, rep: `return c.json($2, $1);` },
    { reg: /res\.status\((.*?)\)\.json\((.*?)\);/gs, rep: `return c.json($2, $1);` },
    { reg: /req\.body/g, rep: `(await c.req.json().catch(() => ({})))` },
    { reg: /req\.user/g, rep: `c.get("user")` },
    { reg: /req\.query/g, rep: `c.req.query()` },
    { reg: /req\.params/g, rep: `c.req.param()` },
    { reg: /const (.*?) = require\("\.\.\/(.*?)"\);/g, rep: `import $1 from "../$2.js";` },
    { reg: /const (.*?) = require\("(.*?)"\);/g, rep: `import $1 from "$2";` } 
  ];

  honoReplacements.forEach(({reg, rep}) => {
    if (reg.test(code)) {
      code = code.replace(reg, rep);
      modified = true;
    }
  });

  if (modified) {
    fs.writeFileSync(filePath, code, "utf-8");
    console.log("Converted:", filePath);
  }
}

walkDir(routesDir, processFile);
walkDir(middlewareDir, processFile);
