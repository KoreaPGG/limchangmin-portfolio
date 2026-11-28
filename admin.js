const store = window.worksStore;
const login = document.querySelector("#login");
const editor = document.querySelector("#editor");
const status = document.querySelector("#status");
const select = document.querySelector("#work-select");
const form = document.querySelector("#work-form");
const logout = document.querySelector("#logout");
const deleteWork = document.querySelector("#delete-work");
const editorTabs = document.querySelector("#editor-tabs");
const workPanel = document.querySelector("#work-panel");
const contentPanel = document.querySelector("#content-panel");
const contentPage = document.querySelector("#content-page");
const contentForm = document.querySelector("#content-form");
const contentFields = document.querySelector("#content-fields");
let token = null;
let works = [];
let contentDrafts = {};
let currentContentPage = contentPage.value;
let contentDirty = false;

function message(text) {
  status.textContent = text;
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[character]);
}

function mergeDefaults(defaults, saved) {
  if (Array.isArray(defaults)) return Array.isArray(saved) ? saved : defaults;
  if (defaults && typeof defaults === "object") {
    const source = saved && typeof saved === "object" && !Array.isArray(saved) ? saved : {};
    return Object.fromEntries(Object.entries(defaults).map(([key, value]) => [key, mergeDefaults(value, source[key])]));
  }
  return typeof saved === typeof defaults ? saved : defaults;
}

function settingField(label, key, value, type = "text") {
  return `<label>${label}<input type="${type}" data-setting="${key}" value="${escapeHtml(value)}" /></label>`;
}

function textAreaField(label, key, value) {
  return `<label>${label}<textarea data-setting="${key}" rows="4">${escapeHtml(value)}</textarea></label>`;
}

function contentRow(type, item = "", number = 1) {
  const actions = `<div class="content-row-actions">
    <span>항목 ${number}</span>
    <button type="button" data-row-action="up" aria-label="위로 이동">↑</button>
    <button type="button" data-row-action="down" aria-label="아래로 이동">↓</button>
    <button type="button" data-row-action="remove">삭제</button>
  </div>`;
  let fields;
  if (type === "text") {
    fields = textAreaField("내용", "value", item);
  } else if (type === "exhibition") {
    fields = `${settingField("연도", "year", item.year, "number")}${textAreaField("전시명 및 장소", "title", item.title)}`;
  } else if (type === "current") {
    fields = `${settingField("항목 제목", "heading", item.heading)}${textAreaField("내용 (한 줄에 하나씩)", "lines", (item.lines || []).join("\n"))}`;
  } else if (type === "press") {
    fields = `${textAreaField("제목", "title", item.title)}${settingField("날짜", "date", item.date)}${settingField("링크 (https://)", "url", item.url, "url")}`;
  } else {
    const imageUrl = item.image ? store.assetPath(item.image) : "";
    fields = `<input type="hidden" data-field="image" value="${escapeHtml(item.image)}" />
      ${imageUrl ? `<img class="content-image-preview" src="${escapeHtml(imageUrl)}" alt="" />` : ""}
      <label>사진 파일 <input type="file" data-file="image" accept="image/*" /></label>
      ${settingField("설명 / 캡션", "caption", item.caption)}`;
  }
  return `<fieldset class="content-row" data-row-type="${type}">${actions}${fields}</fieldset>`;
}

function contentList(key, label, type, items) {
  return `<fieldset class="content-group">
    <legend>${label}</legend>
    <div class="content-list" data-list="${key}" data-type="${type}">${items.map((item, index) => contentRow(type, item, index + 1)).join("")}</div>
    <button type="button" data-add-list="${key}">항목 추가</button>
  </fieldset>`;
}

function renderContentForm(pageKey, content) {
  if (pageKey === "exhibition") {
    return `<h2>Work — Exhibition Views</h2>
      ${settingField("섹션 제목", "title", content.title)}
      <p>사진을 삭제하면 웹사이트 목록에서만 사라집니다. 업로드된 원본 파일은 저장소에 보관됩니다.</p>
      ${contentList("items", "전시장 사진", "photo", content.items)}`;
  }
  if (pageKey === "about") {
    const headings = content.headings;
    return `<h2>About</h2>
      ${settingField("이름", "name", content.name)}
      <fieldset class="content-group">
        <legend>프로필 사진</legend>
        <img class="content-image-preview content-portrait-preview" src="${escapeHtml(store.assetPath(content.portrait))}" alt="" />
        <input type="hidden" data-setting="portrait" value="${escapeHtml(content.portrait)}" />
        <label>새 사진 업로드 <input type="file" data-file="portrait" accept="image/*" /></label>
      </fieldset>
      ${contentList("biography", "소개 문단", "text", content.biography)}
      <fieldset class="content-group">
        <legend>섹션 제목</legend>
        ${settingField("탭: About", "headings.navAbout", headings.navAbout)}
        ${settingField("탭: Exhibitions", "headings.navExhibitions", headings.navExhibitions)}
        ${settingField("탭: Current", "headings.navCurrent", headings.navCurrent)}
        ${settingField("개인전 제목", "headings.soloExhibitions", headings.soloExhibitions)}
        ${settingField("그룹전 제목", "headings.groupExhibitions", headings.groupExhibitions)}
        ${settingField("학력 제목", "headings.education", headings.education)}
        ${settingField("현재 제목", "headings.current", headings.current)}
      </fieldset>
      ${contentList("soloExhibitions", "개인전", "exhibition", content.soloExhibitions)}
      ${contentList("groupExhibitions", "그룹전", "exhibition", content.groupExhibitions)}
      ${contentList("education", "학력", "text", content.education)}
      ${contentList("current", "현재 소속 / 연락처 정보", "current", content.current)}`;
  }
  return `<h2>Press</h2>${contentList("items", "보도 및 영상 항목", "press", content.items)}`;
}

function refreshRowNumbers(list) {
  list.querySelectorAll(".content-row-actions span").forEach((label, index) => {
    label.textContent = `항목 ${index + 1}`;
  });
}

function readContentRows(key, type) {
  const list = contentFields.querySelector(`[data-list="${key}"]`);
  return Array.from(list.querySelectorAll(".content-row"), (row) => {
    const value = (name) => row.querySelector(`[data-field="${name}"]`)?.value.trim() || "";
    if (type === "text") return value("value");
    if (type === "exhibition") {
      const year = value("year");
      const title = value("title");
      const numericYear = Number(year);
      if (!Number.isInteger(numericYear) || numericYear < 1 || numericYear > 9999 || !title) {
        throw new Error("전시 연도와 제목을 확인해주세요.");
      }
      return { year: numericYear, title };
    }
    if (type === "current") {
      return { heading: value("heading"), lines: value("lines").split(/\r?\n/).map((line) => line.trim()).filter(Boolean) };
    }
    if (type === "press") {
      const title = value("title");
      const date = value("date");
      const url = value("url");
      let parsedUrl;
      try {
        parsedUrl = new URL(url);
      } catch {
        throw new Error("Press 링크를 확인해주세요.");
      }
      if (!title || !date || !["http:", "https:"].includes(parsedUrl.protocol)) {
        throw new Error("Press 제목, 날짜, http 또는 https 링크를 입력해주세요.");
      }
      return { title, date, url: parsedUrl.href };
    }
    return { image: value("image"), caption: value("caption"), file: row.querySelector('[data-file="image"]').files[0] };
  });
}

function refreshSelection(selected = "") {
  select.replaceChildren(new Option("새 작업물", ""));
  works.forEach((work) => select.add(new Option(`${work.year} — ${work.title}`, work.id)));
  select.value = selected;
  showSelection();
}

function showSelection() {
  const work = works.find((item) => item.id === select.value);
  form.reset();
  form.elements.title.value = work ? work.title : "";
  form.elements.year.value = work ? work.year : new Date().getFullYear();
  form.elements.image.required = !work;
  deleteWork.hidden = !work;
  document.querySelector("#image-info").textContent = work ? "이미지를 변경하지 않으려면 비워두세요." : "이미지는 필수입니다.";
  document.querySelector("#video-info").textContent = work && work.video ? "기존 동영상이 있습니다. 변경하지 않으려면 비워두세요." : "동영상은 선택 사항입니다.";
}

function setBusy(busy) {
  login.querySelector("button").disabled = busy;
  form.querySelector("button").disabled = busy;
  select.disabled = busy;
  logout.disabled = busy;
  deleteWork.disabled = busy;
  contentPage.disabled = busy;
  editorTabs.querySelectorAll("button").forEach((button) => {
    button.disabled = busy;
  });
}

function settingValue(key) {
  const field = contentFields.querySelector(`[data-setting="${key}"]`);
  if (!field) throw new Error("페이지 편집 항목을 찾지 못했습니다.");
  return field.value.trim();
}

function renderLoadedContent(pageKey, content) {
  contentFields.innerHTML = renderContentForm(pageKey, content);
  contentForm.querySelector('[type="submit"]').disabled = false;
  contentDirty = false;
}

async function loadContentPage(pageKey, force = false) {
  const submit = contentForm.querySelector('[type="submit"]');
  submit.disabled = true;
  contentPage.disabled = true;
  contentFields.replaceChildren();
  if (contentDrafts[pageKey] && !force) {
    renderLoadedContent(pageKey, contentDrafts[pageKey]);
    contentPage.disabled = false;
    return;
  }
  message("페이지 내용을 불러오는 중입니다...");
  try {
    const saved = await store.getContent(pageKey);
    contentDrafts[pageKey] = mergeDefaults(window.portfolioContentDefaults[pageKey], saved);
    renderLoadedContent(pageKey, contentDrafts[pageKey]);
    message(saved ? "저장된 페이지 내용을 불러왔습니다." : "기본 페이지 내용입니다. 저장하면 공개 페이지에 반영됩니다.");
  } catch (error) {
    console.error(`Unable to load ${pageKey} content for editing.`, error);
    contentFields.innerHTML = "<p>페이지 콘텐츠 테이블을 읽지 못했습니다. Supabase 마이그레이션 SQL을 실행했는지 확인해주세요.</p>";
    message(`페이지 내용을 불러오지 못했습니다. ${error.message}`);
  } finally {
    contentPage.disabled = false;
  }
}

async function uploadImageIfSelected(file, currentPath) {
  if (!file) return currentPath;
  if (!file.type.startsWith("image/")) throw new Error("이미지 파일을 선택해주세요.");
  return store.upload(file, token);
}

async function readPageContent(pageKey) {
  if (pageKey === "exhibition") {
    const items = [];
    for (const item of readContentRows("items", "photo")) {
      const image = await uploadImageIfSelected(item.file, item.image);
      if (!image) throw new Error("각 전시장 사진에 이미지 파일을 선택해주세요.");
      items.push({ image, caption: item.caption });
    }
    const title = settingValue("title");
    if (!title) throw new Error("섹션 제목을 입력해주세요.");
    return { title, items };
  }
  if (pageKey === "about") {
    const portrait = await uploadImageIfSelected(
      contentFields.querySelector('[data-file="portrait"]').files[0],
      settingValue("portrait"),
    );
    const headings = Object.fromEntries(
      Object.keys(window.portfolioContentDefaults.about.headings).map((key) => [key, settingValue(`headings.${key}`)]),
    );
    if (!settingValue("name") || Object.values(headings).some((value) => !value)) {
      throw new Error("이름과 섹션 제목을 모두 입력해주세요.");
    }
    return {
      name: settingValue("name"),
      portrait,
      biography: readContentRows("biography", "text").filter(Boolean),
      headings,
      soloExhibitions: readContentRows("soloExhibitions", "exhibition"),
      groupExhibitions: readContentRows("groupExhibitions", "exhibition"),
      education: readContentRows("education", "text").filter(Boolean),
      current: readContentRows("current", "current"),
    };
  }
  return { items: readContentRows("items", "press") };
}

function moveContentRow(button) {
  const row = button.closest(".content-row");
  const list = row.parentElement;
  const action = button.dataset.rowAction;
  if (action === "remove") {
    row.remove();
  } else if (action === "up" && row.previousElementSibling) {
    list.insertBefore(row, row.previousElementSibling);
  } else if (action === "down" && row.nextElementSibling) {
    list.insertBefore(row.nextElementSibling, row);
  }
  refreshRowNumbers(list);
  contentDirty = true;
}

function setContentBusy(busy) {
  contentPage.disabled = busy;
  logout.disabled = busy;
  editorTabs.querySelectorAll("button").forEach((button) => {
    button.disabled = busy;
  });
  contentForm.querySelectorAll("input, textarea, button").forEach((control) => {
    control.disabled = busy;
  });
}

if (!store.configured) {
  message("Supabase 설정이 필요합니다. 설정 안내를 확인해주세요.");
  login.hidden = true;
}

login.addEventListener("submit", async (event) => {
  event.preventDefault();
  setBusy(true);
  message("로그인 중입니다...");
  let session;
  try {
    session = await store.signIn(login.elements.email.value, login.elements.password.value);
    login.elements.password.value = "";
    if (!await store.isAdmin(session.access_token)) {
      await store.signOut(session.access_token);
      throw new Error("관리자 권한이 없는 계정입니다.");
    }
    works = await store.list();
    token = session.access_token;
    refreshSelection();
    login.hidden = true;
    editor.hidden = false;
    message("로그인했습니다.");
  } catch (error) {
    console.error("Admin login failed.", error);
    message(`로그인하지 못했습니다. ${error.message}`);
  } finally {
    setBusy(false);
  }
});

select.addEventListener("change", showSelection);

editorTabs.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-panel]");
  if (!button) return;
  const panelId = button.dataset.panel;
  if (panelId === "work-panel" && contentDirty) {
    if (!window.confirm("저장하지 않은 페이지 변경사항을 버리시겠습니까?")) return;
    delete contentDrafts[currentContentPage];
    contentDirty = false;
  }
  workPanel.hidden = panelId !== "work-panel";
  contentPanel.hidden = panelId !== "content-panel";
  editorTabs.querySelectorAll("[data-panel]").forEach((tab) => {
    tab.setAttribute("aria-pressed", String(tab === button));
  });
  if (panelId === "content-panel") await loadContentPage(currentContentPage);
});

contentPage.addEventListener("change", async () => {
  if (contentDirty) {
    if (!window.confirm("저장하지 않은 변경사항을 버리시겠습니까?")) {
      contentPage.value = currentContentPage;
      return;
    }
    delete contentDrafts[currentContentPage];
  }
  currentContentPage = contentPage.value;
  contentDirty = false;
  await loadContentPage(currentContentPage);
});

contentFields.addEventListener("input", () => {
  contentDirty = true;
});

contentFields.addEventListener("change", () => {
  contentDirty = true;
});

contentFields.addEventListener("click", (event) => {
  const addButton = event.target.closest("[data-add-list]");
  if (addButton) {
    const list = contentFields.querySelector(`[data-list="${addButton.dataset.addList}"]`);
    const type = list.dataset.type;
    const blankItems = {
      text: "",
      exhibition: { year: "", title: "" },
      current: { heading: "", lines: [] },
      press: { title: "", date: "", url: "" },
      photo: { image: "", caption: "" },
    };
    list.insertAdjacentHTML("beforeend", contentRow(type, blankItems[type], list.children.length + 1));
    contentDirty = true;
    return;
  }
  const rowAction = event.target.closest("[data-row-action]");
  if (rowAction) moveContentRow(rowAction);
});

contentForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  setContentBusy(true);
  message("페이지 내용을 저장 중입니다...");
  try {
    const pageKey = contentPage.value;
    const content = await readPageContent(pageKey);
    await store.saveContent(pageKey, content, token);
    contentDrafts[pageKey] = content;
    renderLoadedContent(pageKey, content);
    message("저장했습니다. 공개 페이지에 반영됩니다.");
  } catch (error) {
    console.error("Unable to save page content.", error);
    message(`페이지 내용을 저장하지 못했습니다. ${error.message}`);
  } finally {
    setContentBusy(false);
    contentForm.querySelector('[type="submit"]').disabled = false;
  }
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const current = works.find((item) => item.id === select.value);
  const image = form.elements.image.files[0];
  const video = form.elements.video.files[0];
  if (!current && !image) {
    message("이미지를 선택해주세요.");
    return;
  }
  if ((image && !image.type.startsWith("image/")) || (video && !video.type.startsWith("video/"))) {
    message("이미지와 동영상 파일을 확인해주세요.");
    return;
  }
  if (video && form.elements.removeVideo.checked) {
    message("동영상을 업로드하거나 기존 동영상 제거를 선택해주세요.");
    return;
  }
  const title = form.elements.title.value.trim();
  if (!title) {
    message("제목을 입력해주세요.");
    return;
  }
  setBusy(true);
  message("저장 중입니다. 파일 크기에 따라 시간이 걸릴 수 있습니다.");
  try {
    const imagePath = image ? await store.upload(image, token) : current.image;
    const videoPath = video ? await store.upload(video, token) : (form.elements.removeVideo.checked ? null : current?.video || null);
    const id = current ? current.id : `new:${crypto.randomUUID()}`;
    await store.save({
      id,
      title,
      year: Number(form.elements.year.value),
      image: imagePath,
      video: videoPath,
      preview_scale: video ? null : current?.previewScale || null,
    }, token);
    works = await store.list();
    refreshSelection(id);
    message("저장했습니다. 공개 페이지에 반영됩니다.");
  } catch (error) {
    console.error("Unable to save work.", error);
    message(`저장하거나 목록을 새로 불러오지 못했습니다. 공개 페이지를 확인한 후 다시 시도해주세요. ${error.message}`);
  } finally {
    setBusy(false);
  }
});

deleteWork.addEventListener("click", async () => {
  const work = works.find((item) => item.id === select.value);
  if (!work || !window.confirm(`"${work.title}" 작업물을 목록에서 삭제하시겠습니까?\n이미지와 동영상 원본은 보관됩니다.`)) return;
  setBusy(true);
  message("삭제 중입니다...");
  try {
    await store.remove(work, token);
    works = await store.list();
    refreshSelection();
    message("작업물을 목록에서 삭제했습니다. 원본 파일은 보관됩니다.");
  } catch (error) {
    console.error("Unable to delete work.", error);
    message(`삭제하거나 목록을 새로 불러오지 못했습니다. 공개 페이지를 확인한 후 다시 시도해주세요. ${error.message}`);
  } finally {
    setBusy(false);
  }
});

logout.addEventListener("click", async () => {
  setBusy(true);
  try {
    await store.signOut(token);
    message("로그아웃했습니다.");
  } catch (error) {
    console.error("Unable to revoke session.", error);
    message(`서버 로그아웃에 실패했습니다. ${error.message}`);
  } finally {
    token = null;
    works = [];
    contentDrafts = {};
    contentDirty = false;
    contentFields.replaceChildren();
    contentPage.value = "exhibition";
    currentContentPage = "exhibition";
    workPanel.hidden = false;
    contentPanel.hidden = true;
    editorTabs.querySelectorAll("[data-panel]").forEach((tab) => {
      tab.setAttribute("aria-pressed", String(tab.dataset.panel === "work-panel"));
    });
    editor.hidden = true;
    login.hidden = false;
    form.reset();
    setBusy(false);
  }
});
