const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");

for (const page of ["work", "about", "press"]) {
  test(`${page} has a clean URL and redirects its legacy URL`, () => {
    const cleanPage = fs.readFileSync(`${page}/index.html`, "utf8");
    const legacyPage = fs.readFileSync(`${page}.html`, "utf8");

    assert.match(cleanPage, new RegExp(`<body data-page="${page}">`));
    assert.match(cleanPage, /href="\/styles\.css"/);
    assert.match(legacyPage, new RegExp(`url=/${page}/`));
    assert.match(legacyPage, new RegExp(`href="/${page}/"`));
  });
}
