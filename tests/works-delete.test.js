const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

test("deleting existing and newly added works removes them from the merged list", async () => {
  const rows = [
    { id: "original-b", title: "Edited B", year: 2020, image: "replacement.jpg", video: null, preview_scale: null, deleted: false },
    { id: "new:1", title: "New", year: 2021, image: "supabase:new.jpg", video: null, preview_scale: null, deleted: false },
  ];
  const requests = [];
  const window = {
    supabaseConfig: { url: "https://example.test", anonKey: "public" },
    portfolioWorks: [
      { title: "A", year: 2019, image: "original-a" },
      { title: "B", year: 2020, image: "original-b" },
      { title: "C", year: 2022, image: "original-c" },
    ],
  };
  const fetch = async (url, options) => {
    requests.push({ url, options });
    if (options.method === "POST") {
      const row = JSON.parse(options.body);
      const index = rows.findIndex((item) => item.id === row.id);
      if (index < 0) rows.push(row);
      else rows[index] = row;
      return { ok: true, text: async () => "" };
    }
    return { ok: true, text: async () => JSON.stringify(rows) };
  };
  vm.runInNewContext(fs.readFileSync("works-store.js", "utf8"), { window, fetch });

  const initial = await window.worksStore.list();
  await window.worksStore.remove(initial.find((work) => work.id === "original-a"), "admin-token");
  await window.worksStore.remove(initial.find((work) => work.id === "original-b"), "admin-token");
  await window.worksStore.remove(initial.find((work) => work.id === "new:1"), "admin-token");
  const remaining = await window.worksStore.list();
  assert.deepEqual(Array.from(remaining, (work) => work.id), ["original-c"]);
  const writes = requests.filter(({ options }) => options.method === "POST");
  assert.equal(writes.length, 3);
  assert.ok(writes.every(({ options }) => options.headers.Authorization === "Bearer admin-token"));
  assert.ok(writes.every(({ options }) => JSON.parse(options.body).deleted === true));
  assert.equal(rows.find((row) => row.id === "new:1").image, "supabase:new.jpg");
});

test("a denied deletion reports the server error", async () => {
  const window = {
    supabaseConfig: { url: "https://example.test", anonKey: "public" },
    portfolioWorks: [],
  };
  const fetch = async () => ({ ok: false, status: 403, text: async () => "permission denied" });
  vm.runInNewContext(fs.readFileSync("works-store.js", "utf8"), { window, fetch });
  await assert.rejects(
    window.worksStore.remove({ id: "new:1", title: "New", year: 2021, image: "image.jpg" }, "non-admin"),
    /403.*permission denied/,
  );
});
