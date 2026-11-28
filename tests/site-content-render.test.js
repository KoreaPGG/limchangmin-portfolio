const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const defaultsSource = fs.readFileSync("site-content.js", "utf8");
const siteSource = fs.readFileSync("site.js", "utf8");

async function render(page, savedContent) {
  const app = { innerHTML: "" };
  const image = {};
  const videoPlayer = {
    addEventListener() {},
    style: { removeProperty() {}, setProperty() {} },
  };
  const videoStatus = { textContent: "" };
  const dialog = {
    querySelector: () => image,
    addEventListener() {},
  };
  const videoDialog = {
    querySelector: (selector) => selector === ".video-lightbox-player" ? videoPlayer : videoStatus,
    addEventListener() {},
    style: { removeProperty() {} },
  };
  const window = {
    portfolioWorks: [],
    addEventListener() {},
    worksStore: {
      configured: true,
      assetPath: (path) => `/assets/${path}`,
      list: async () => [],
      getContent: async (key) => key === (page === "work" ? "exhibition" : page) ? savedContent : null,
    },
  };
  const context = vm.createContext({
    window,
    URL,
    IntersectionObserver: class {
      observe() {}
    },
    console: { error() {}, warn() {} },
    document: {
      body: { dataset: { page } },
      querySelector: (selector) => ({
        "#app": app,
        ".work-lightbox": dialog,
        ".video-lightbox": videoDialog,
      })[selector],
      querySelectorAll: () => [],
    },
  });
  vm.runInContext(defaultsSource, context);
  vm.runInContext(siteSource, context);
  await new Promise(setImmediate);
  return app.innerHTML;
}

test("About renders saved text as escaped content", async () => {
  const window = { portfolioWorks: [] };
  const context = vm.createContext({ window });
  vm.runInContext(defaultsSource, context);
  const about = window.portfolioContentDefaults.about;
  const html = await render("about", {
    ...about,
    name: "<script>not markup</script>",
    biography: ["A & B"],
  });

  assert.match(html, /<h1>&lt;script&gt;not markup&lt;\/script&gt;<\/h1>/);
  assert.match(html, /<p>A &amp; B<\/p>/);
});

test("Press ignores unsafe saved URLs while keeping the item title", async () => {
  const window = { portfolioWorks: [] };
  const context = vm.createContext({ window });
  vm.runInContext(defaultsSource, context);
  const press = window.portfolioContentDefaults.press;
  const html = await render("press", {
    ...press,
    items: [{ title: "Unsafe link", date: "2026", url: "javascript:alert(1)" }],
  });

  const item = html.match(/<li class="press-item">[\s\S]*?<\/li>/)?.[0];
  assert.ok(item);
  assert.match(item, /Unsafe link/);
  assert.doesNotMatch(item, /href=/);
});

test("Press renders newest items first across supported date formats", async () => {
  const html = await render("press", {
    items: [
      { title: "Older item", date: "2018. 03. 15", url: "https://example.com/old" },
      { title: "Newer item", date: "2026-05-08", url: "https://example.com/new" },
      { title: "Undated item", date: "date unknown", url: "https://example.com/unknown" },
    ],
  });

  assert.ok(html.indexOf("Newer item") < html.indexOf("Older item"));
  assert.ok(html.indexOf("Older item") < html.indexOf("Undated item"));
});

test("Work renders saved Exhibition Views captions as escaped text", async () => {
  const html = await render("work", {
    title: "Exhibition Views",
    items: [{ image: "exhibition/custom.webp", caption: "<img src=x>" }],
  });

  assert.match(html, /src="\/assets\/exhibition\/custom\.webp"/);
  assert.match(html, /alt="&lt;img src=x&gt;"/);
  assert.match(html, /<figcaption>&lt;img src=x&gt;<\/figcaption>/);
});
