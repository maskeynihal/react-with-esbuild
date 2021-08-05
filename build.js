const { build } = require("esbuild");
const chokidar = require("chokidar");
const fs = require("fs-extra");

const generateBuild = async () => {
  await fs.rmdirSync("./build/", { recursive: true });

  const publicFiles = fs.readdirSync("./public/");

  publicFiles.forEach((file) => {
    fs.copy(`./public/${file}`, `./build/${file}`, (err) => {
      if (err) return console.error(err);
      console.log("success!");
      return null;
    });
  });

  await build({
    entryPoints: ["./src/index.jsx"],
    outdir: "./build/static/js",
    bundle: true,
    sourcemap: true,
    target: ["chrome58", "firefox57", "edge16"],
    loader: { ".svg": "dataurl", ".png": "dataurl" },
    define: {
      "process.env.NODE_ENV": "'dev'",
    },
  }).catch(() => process.exit(1));

  const cssFiles = fs
    .readdirSync("./build/static/js")
    .filter((fn) => fn.endsWith(".css"));

  cssFiles.forEach((file) => {
    fs.move(
      `./build/static/js/${file}`,
      `./build/static/css/${file}`,
      (err) => {
        if (err) return console.error(err);
        console.log("success!");
        return null;
      }
    );
  });
};

chokidar
  .watch(".", { ignored: /build|node_modules|.git/ })
  .on("all", (event, path) => {
    console.log(event, path);
    generateBuild();
  });
