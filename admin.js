const store = window.worksStore;
const login = document.querySelector("#login");
const editor = document.querySelector("#editor");
const status = document.querySelector("#status");
const select = document.querySelector("#work-select");
const form = document.querySelector("#work-form");
const logout = document.querySelector("#logout");
const deleteWork = document.querySelector("#delete-work");
let token = null;
let works = [];

function message(text) {
  status.textContent = text;
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
    editor.hidden = true;
    login.hidden = false;
    form.reset();
    setBusy(false);
  }
});
