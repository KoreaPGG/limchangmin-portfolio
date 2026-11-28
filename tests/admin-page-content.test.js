const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const adminSource = fs.readFileSync("admin.js", "utf8");

function createElement(value = "") {
  return {
    value,
    addEventListener() {},
    classList: { toggle() {} },
    querySelector() { return null; },
    querySelectorAll() { return []; },
    replaceChildren() {},
  };
}

function createAdminContext(about = {}) {
  const elements = new Map([
    ["#login", createElement()],
    ["#editor", createElement()],
    ["#status", createElement()],
    ["#work-select", createElement()],
    ["#work-form", createElement()],
    ["#logout", createElement()],
    ["#delete-work", createElement()],
    ["#editor-tabs", createElement()],
    ["#work-panel", createElement()],
    ["#content-panel", createElement()],
    ["#content-page", createElement("about")],
    ["#content-form", createElement()],
    ["#content-fields", createElement()],
  ]);
  const fields = elements.get("#content-fields");
  fields.querySelector = () => ({ querySelectorAll: () => [] });

  const context = vm.createContext({
    URL,
    document: { querySelector: (selector) => elements.get(selector) },
    window: { worksStore: { configured: false }, portfolioContentDefaults: { about } },
    about,
  });
  vm.runInContext(adminSource, context);
  return context;
}

test("About keeps fixed profile fields when saving editable page content", async () => {
  const about = {
    name: "Lim Changmin",
    portrait: "profile-kept.jpg",
    headings: { navAbout: "about" },
    biography: ["Biography"],
    soloExhibitions: [],
    groupExhibitions: [],
    education: [],
    current: [],
  };
  const context = createAdminContext(about);

  const html = vm.runInContext('renderContentForm("about", about)', context);
  vm.runInContext("contentDrafts.about = about", context);
  const saved = await vm.runInContext('readPageContent("about")', context);

  assert.doesNotMatch(html, /data-setting="name"|data-file="portrait"|섹션 제목/);
  assert.equal(saved.name, about.name);
  assert.equal(saved.portrait, about.portrait);
  assert.equal(saved.headings.navAbout, about.headings.navAbout);
});

test("Login hides raw invalid-credentials responses", () => {
  const context = createAdminContext();
  const friendly = vm.runInContext(
    'loginFailureMessage(new Error(\'요청 실패 (400): {"error_code":"invalid_credentials","msg":"Invalid login credentials"}\'))',
    context,
  );
  const other = vm.runInContext('loginFailureMessage(new Error("Failed to fetch"))', context);

  assert.equal(friendly, "로그인하지 못했습니다. 이메일과 비밀번호를 확인해주세요.");
  assert.equal(other, "로그인하지 못했습니다. Failed to fetch");
});
