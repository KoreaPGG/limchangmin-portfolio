(function () {
  const config = window.supabaseConfig;
  const configured = Boolean(config && config.url && config.anonKey);
  const baseUrl = configured ? config.url.replace(/\/+$/, "") : "";

  async function request(path, options = {}, token) {
    if (!configured) throw new Error("Supabase 설정이 필요합니다.");
    const response = await fetch(`${baseUrl}${path}`, {
      ...options,
      headers: {
        apikey: config.anonKey,
        Authorization: `Bearer ${token || config.anonKey}`,
        ...options.headers,
      },
    });
    if (!response.ok) {
      const message = await response.text();
      throw new Error(`요청 실패 (${response.status}): ${message}`);
    }
    const body = await response.text();
    return body ? JSON.parse(body) : null;
  }

  function mergeWorks(rows) {
    const overrides = new Map(rows.map((row) => [row.id, row]));
    const works = window.portfolioWorks.map((work) => {
      const row = overrides.get(work.image);
      overrides.delete(work.image);
      return row ? (row.deleted ? null : fromRow(row)) : { ...work, id: work.image };
    });
    works.push(...Array.from(overrides.values()).filter((row) => !row.deleted).map(fromRow));
    return works.filter(Boolean).sort((a, b) => b.year - a.year);
  }

  function fromRow(row) {
    return {
      id: row.id,
      year: row.year,
      title: row.title,
      image: row.image,
      video: row.video,
      previewScale: row.preview_scale,
    };
  }

  function assetPath(path) {
    if (path.startsWith("supabase:")) {
      return `${baseUrl}/storage/v1/object/public/work-media/${path.slice(9).split("/").map(encodeURIComponent).join("/")}`;
    }
    return `/assets/${path}`;
  }

  window.worksStore = {
    configured,
    assetPath,
    async list() {
      const rows = [];
      const pageSize = 500;
      let page;
      do {
        page = await request(`/rest/v1/works?select=*&order=created_at.asc,id.asc&limit=${pageSize}&offset=${rows.length}`);
        rows.push(...page);
      } while (page.length === pageSize);
      return mergeWorks(rows);
    },
    async getContent(pageKey) {
      const rows = await request(`/rest/v1/site_content?select=page_key,content&page_key=eq.${encodeURIComponent(pageKey)}&limit=1`);
      return rows[0]?.content || null;
    },
    async saveContent(pageKey, content, token) {
      await request("/rest/v1/site_content?on_conflict=page_key", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Prefer: "resolution=merge-duplicates,return=minimal",
        },
        body: JSON.stringify({ page_key: pageKey, content }),
      }, token);
    },
    async signIn(email, password) {
      return request("/auth/v1/token?grant_type=password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
    },
    async signOut(token) {
      await request("/auth/v1/logout", { method: "POST" }, token);
    },
    async isAdmin(token) {
      const rows = await request("/rest/v1/portfolio_admins?select=user_id", {}, token);
      return rows.length > 0;
    },
    async upload(file, token) {
      const extension = file.name.includes(".") ? file.name.split(".").pop().toLowerCase() : "";
      if (!/^[a-z0-9]{1,8}$/.test(extension)) throw new Error("파일 확장자를 확인해주세요.");
      const path = `${crypto.randomUUID()}.${extension}`;
      await request(`/storage/v1/object/work-media/${path}`, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      }, token);
      return `supabase:${path}`;
    },
    async save(work, token) {
      await request("/rest/v1/works?on_conflict=id", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Prefer: "resolution=merge-duplicates,return=minimal",
        },
        body: JSON.stringify(work),
      }, token);
    },
    async remove(work, token) {
      await this.save({
        id: work.id,
        title: work.title,
        year: work.year,
        image: work.image,
        video: work.video || null,
        preview_scale: work.previewScale || null,
        deleted: true,
      }, token);
    },
  };
})();
