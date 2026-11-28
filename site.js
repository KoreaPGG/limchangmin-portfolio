const instagramUrl =
  "https://www.instagram.com/lim_changmin_official?igsh=Njd5ajR2eG5kZDli&igsi=Njd5ajR2eG5kZDli";

let works = [...window.portfolioWorks].sort((a, b) => b.year - a.year);

const page = document.body.dataset.page || "home";
const app = document.querySelector("#app");
let siteContent = window.portfolioContentDefaults;
const assetPath = (filename) => window.worksStore ? window.worksStore.assetPath(filename) : `/assets/${filename}`;
const pagePath = (name) => `/${name}/`;
const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
})[character]);
const safeExternalUrl = (value) => {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:" ? url.href : "";
  } catch {
    return "";
  }
};

function instagramIcon() {
  return `<svg viewBox="0 0 24 24" aria-hidden="true">
    <rect x="3" y="3" width="18" height="18" rx="5"></rect>
    <circle cx="12" cy="12" r="4"></circle>
    <circle class="instagram-dot" cx="18" cy="6" r="1"></circle>
  </svg>`;
}

function header() {
  const active = page === "home" ? "" : page;
  return `<header class="site-header${page === "home" ? " site-header--hero" : ""}">
    <nav class="primary-nav" aria-label="Main navigation">
      <a href="${pagePath("work")}"${active === "work" ? ' aria-current="page"' : ""}>Work</a>
      <a href="${pagePath("about")}"${active === "about" ? ' aria-current="page"' : ""}>About</a>
      <a href="${pagePath("press")}"${active === "press" ? ' aria-current="page"' : ""}>Press</a>
    </nav>
    <a class="site-title" href="/" aria-label="Lim Changmin home">Lim Changmin</a>
    <a class="instagram-link" href="${instagramUrl}" target="_blank" rel="noreferrer" aria-label="Instagram">
      ${instagramIcon()}
    </a>
  </header>`;
}

function footer() {
  return `<footer class="site-footer">
    <a class="footer-instagram" href="${instagramUrl}" target="_blank" rel="noreferrer" aria-label="Instagram">
      ${instagramIcon()}
    </a>
    <div class="footer-details">
      <a href="${instagramUrl}" target="_blank" rel="noreferrer">@lim_changmin_official</a>
      <p>대구광역시 남구 명덕로 104</p>
      <a href="mailto:nyapril@naver.com">nyapril@naver.com</a>
    </div>
  </footer>`;
}

function renderHome() {
  return `<main class="hero" aria-label="Lim Changmin">
    <video class="hero-video" autoplay muted loop playsinline preload="auto" aria-hidden="true"></video>
    <div class="hero-skeleton" aria-hidden="true"></div>
    <button class="hero-retry" type="button" hidden>배경 영상 재생</button>
  </main>`;
}

function renderWork() {
  const worksByYear = works.reduce((groups, work, index) => {
    if (!groups.has(work.year)) groups.set(work.year, []);
    groups.get(work.year).push({ ...work, index });
    return groups;
  }, new Map());
  const yearSections = [...worksByYear]
    .map(
      ([year, yearWorks]) => `<section class="work-year" aria-labelledby="year-${year}">
        <h2 id="year-${year}">${year}</h2>
        <div class="work-grid">${yearWorks
          .map(
            ({ title, image, video, previewScale, index }) => `<article class="work-card">
              <button class="work-image-button${video ? " work-image-button--video" : ""}" type="button" data-work-index="${index}" aria-label="${video ? "Play video" : "View artwork"}: ${escapeHtml(title)}">
                ${video
                  ? `<video class="work-video-preview" data-src="${escapeHtml(assetPath(video))}"${previewScale ? ` style="--preview-scale: ${Number(previewScale)}"` : ""} muted loop playsinline preload="none" aria-hidden="true"></video><span class="work-video-skeleton" aria-hidden="true"></span>`
                  : `<img src="${escapeHtml(assetPath(image))}" alt="${escapeHtml(title)}" loading="${index < 4 ? "eager" : "lazy"}" decoding="async" />`}
              </button>
              <p>${escapeHtml(title)}</p>
            </article>`,
          )
          .join("")}</div>
      </section>`,
    )
    .join("");
  const exhibition = siteContent.exhibition;
  const exhibitionGallery = (Array.isArray(exhibition.items) ? exhibition.items : [])
    .map(
      ({ image, caption }) => `<figure class="exhibition-photo">
        <img src="${escapeHtml(assetPath(image))}" alt="${escapeHtml(caption)}" loading="lazy" decoding="async" />
        <figcaption>${escapeHtml(caption)}</figcaption>
      </figure>`,
    )
    .join("");

  return `<main class="work-page page-content">
    <div class="works-by-year" aria-label="Selected works, organized by year">${yearSections}</div>
    <section class="exhibition-gallery" aria-labelledby="exhibition-gallery-title">
      <h2 id="exhibition-gallery-title">${escapeHtml(exhibition.title)}</h2>
      <div class="exhibition-grid">${exhibitionGallery}</div>
    </section>
    <dialog class="work-lightbox" aria-label="Artwork viewer">
      <img class="lightbox-image" alt="" />
    </dialog>
    <dialog class="video-lightbox" aria-label="Work video">
      <video class="video-lightbox-player" controls playsinline preload="none"></video>
      <p class="video-lightbox-status" aria-live="polite"></p>
    </dialog>
  </main>`;
}

function exhibitionList(items) {
  const groups = new Map();
  (Array.isArray(items) ? items : []).forEach(({ year, title }) => {
    const key = String(year || "");
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(title);
  });
  return `<div class="exhibition-list">${Array.from(groups, ([year, entries]) => `
    <div class="exhibition-year">
      <h3>${escapeHtml(year)}</h3>
      <ul>${entries.map((entry) => `<li>${escapeHtml(entry)}</li>`).join("")}</ul>
    </div>`).join("")}</div>`;
}

function renderAbout() {
  const about = siteContent.about;
  const headings = about.headings;
  return `<main class="about-layout page-content">
    <nav class="about-index" aria-label="About sections">
      <a href="#about">${escapeHtml(headings.navAbout)}</a>
      <a href="#exhibitions">${escapeHtml(headings.navExhibitions)}</a>
      <a href="#current">${escapeHtml(headings.navCurrent)}</a>
    </nav>
    <div class="about-content">
      <section id="about" class="about-intro">
        <img class="portrait" src="${escapeHtml(assetPath(about.portrait || "profile.jpg"))}" alt="Portrait of ${escapeHtml(about.name)}" />
        <h1>${escapeHtml(about.name)}</h1>
        <div class="biography">${(Array.isArray(about.biography) ? about.biography : []).map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("")}</div>
      </section>
      <section id="exhibitions" class="about-section">
        <span id="history"></span>
        <h2>${escapeHtml(headings.soloExhibitions)}</h2>
        ${exhibitionList(about.soloExhibitions)}
        <h2 class="group-heading">${escapeHtml(headings.groupExhibitions)}</h2>
        ${exhibitionList(about.groupExhibitions)}
        <div class="education-block">
          <h2>${escapeHtml(headings.education)}</h2>
          <ul>${(Array.isArray(about.education) ? about.education : []).map((entry) => `<li>${escapeHtml(entry)}</li>`).join("")}</ul>
        </div>
      </section>
      <section id="current" class="about-section current-section">
        <h2>${escapeHtml(headings.current)}</h2>
        <div class="current-grid">${(Array.isArray(about.current) ? about.current : []).map(({ heading, lines }) => `
          <div>
            <h3>${escapeHtml(heading)}</h3>
            ${(Array.isArray(lines) ? lines : []).map((line) => `<p>${escapeHtml(line)}</p>`).join("")}
          </div>`).join("")}
        </div>
      </section>
    </div>
  </main>`;
}

function renderPress() {
  const items = window.sortPressItemsByDate(siteContent.press.items)
    .map(({ title, date, url }) => {
      const safeUrl = safeExternalUrl(url);
      const parts = /^\s*(\d{4})\D+(\d{1,2})\D+(\d{1,2})\s*$/.exec(String(date ?? ""));
      const isoDate = parts ? `${parts[1]}-${parts[2].padStart(2, "0")}-${parts[3].padStart(2, "0")}` : "";
      const displayDate = parts
        ? `${parts[1]}. ${parts[2].padStart(2, "0")}. ${parts[3].padStart(2, "0")}`
        : escapeHtml(date);
      return `<li class="press-item">
        ${safeUrl ? `<a href="${escapeHtml(safeUrl)}" target="_blank" rel="noreferrer">${escapeHtml(title)}</a>` : escapeHtml(title)}
        ${parts ? `<time datetime="${isoDate}">${displayDate}</time>` : `<time>${displayDate}</time>`}
      </li>`;
    }).join("");
  return `<main class="press-page page-content">
    <ul class="press-list">${items}</ul>
  </main>`;
}

const pageContent = {
  home: renderHome,
  work: renderWork,
  about: renderAbout,
  press: renderPress,
};

function mergeContent(defaults, saved) {
  if (Array.isArray(defaults)) return Array.isArray(saved) ? saved : defaults;
  if (defaults && typeof defaults === "object") {
    const source = saved && typeof saved === "object" && !Array.isArray(saved) ? saved : {};
    return Object.fromEntries(Object.entries(defaults).map(([key, value]) => [key, mergeContent(value, source[key])]));
  }
  return typeof saved === typeof defaults ? saved : defaults;
}

async function initializeSite() {
  const loadErrors = [];
  if (window.worksStore?.configured && ["work", "about", "press"].includes(page)) {
    if (page === "work") {
      try {
        works = await window.worksStore.list();
      } catch (error) {
        console.error("Unable to load updated works.", error);
        loadErrors.push("최신 작업물을 불러오지 못했습니다.");
        works = [];
      }
    }

    const contentKey = page === "work" ? "exhibition" : page;
    try {
      const savedContent = await window.worksStore.getContent(contentKey);
      if (savedContent) {
        siteContent = {
          ...siteContent,
          [contentKey]: mergeContent(siteContent[contentKey], savedContent),
        };
      }
    } catch (error) {
      console.error(`Unable to load the ${contentKey} page content.`, error);
      loadErrors.push("페이지 내용을 불러오지 못했습니다. 기본 내용을 표시합니다.");
    }
  }
  app.innerHTML = `${header()}${loadErrors.map((error) => `<p role="alert">${escapeHtml(error)}</p>`).join("")}${(pageContent[page] || renderHome)()}${page === "home" ? "" : footer()}`;

if (page === "home") {
  // Content bounds in 480×270 frames, excluding borders baked into the videos.
  const homeVideos = [
    { source: "home-videos/work-003.mp4?v=4", bounds: [45, 3, 391, 264] },
    { source: "home-videos/work-005.mp4?v=4", bounds: [36, 8, 412, 250] },
    { source: "home-videos/work-045.mp4?v=4", bounds: [42, 2, 397, 266] },
    { source: "home-videos/work-016.mp4?v=4", bounds: [39, 2, 403, 268] },
    { source: "home-videos/work-065.mp4?v=4", bounds: [37, 0, 406, 270] },
  ];
  const video = document.querySelector(".hero-video");
  const hero = video.closest(".hero");
  const retry = document.querySelector(".hero-retry");
  let lastVideo;
  let currentVideo;

  function updateVideoScale() {
    const [left, top, width, height] = currentVideo.bounds;
    const aspectRatio = video.clientWidth / video.clientHeight;
    const visibleWidth = Math.min(480, 270 * aspectRatio);
    const visibleHeight = Math.min(270, 480 / aspectRatio);
    const halfContentWidth = Math.min(240 - left, left + width - 240) - 1;
    const halfContentHeight = Math.min(135 - top, top + height - 135) - 1;
    const scale = Math.max(1, visibleWidth / (2 * halfContentWidth), visibleHeight / (2 * halfContentHeight));
    video.style.setProperty("--hero-video-scale", scale);
  }

  function playVideo() {
    const source = video.getAttribute("src");
    video.play().catch((error) => {
      if (video.getAttribute("src") !== source) return;
      console.error("Unable to play the home background video.", error);
      retry.hidden = false;
    });
  }

  function chooseVideo() {
    try {
      lastVideo = sessionStorage.getItem("home-video") || lastVideo;
    } catch (error) {
      console.warn("Unable to read the previous home video.", error);
    }

    const choices = homeVideos.filter(({ source }) => source !== lastVideo);
    currentVideo = choices[Math.floor(Math.random() * choices.length)];
    lastVideo = currentVideo.source;
    try {
      sessionStorage.setItem("home-video", lastVideo);
    } catch (error) {
      console.warn("Unable to remember the home video.", error);
    }

    retry.hidden = true;
    hero.classList.remove("hero--video-ready");
    updateVideoScale();
    video.src = assetPath(lastVideo);
    video.load();
    playVideo();
  }

  retry.addEventListener("click", playVideo);
  video.addEventListener("playing", () => {
    hero.classList.add("hero--video-ready");
    retry.hidden = true;
  });
  video.addEventListener("error", () => {
    if (video.currentSrc) {
      console.error("Unable to load the home background video.", video.error);
      retry.hidden = false;
    }
  });
  window.addEventListener("pageshow", (event) => {
    if (event.persisted) chooseVideo();
  });
  window.addEventListener("resize", updateVideoScale);
  chooseVideo();
}

if (page === "work") {
  const dialog = document.querySelector(".work-lightbox");
  const image = dialog.querySelector(".lightbox-image");
  const videoDialog = document.querySelector(".video-lightbox");
  const videoPlayer = videoDialog.querySelector(".video-lightbox-player");
  const videoStatus = videoDialog.querySelector(".video-lightbox-status");
  let activeIndex = 0;

  const previewObserver = new IntersectionObserver((entries) => {
    entries.forEach(({ target: preview, isIntersecting }) => {
      preview.classList.remove("is-playing");
      if (isIntersecting) {
        preview.classList.add("is-loading");
        const source = preview.dataset.src;
        preview.muted = true;
        preview.src = source;
        preview.play().catch((error) => {
          if (preview.getAttribute("src") === source) {
            console.error(`Unable to play work preview "${source}".`, error);
          }
        });
      } else {
        preview.classList.remove("is-loading");
        preview.pause();
        preview.removeAttribute("src");
        preview.load();
      }
    });
  });
  document.querySelectorAll(".work-video-preview").forEach((preview) => {
    preview.addEventListener("playing", () => {
      preview.classList.remove("is-loading");
      preview.classList.add("is-playing");
    });
    previewObserver.observe(preview);
  });

  function showWork(index) {
    activeIndex = (index + works.length) % works.length;
    const work = works[activeIndex];
    image.src = assetPath(work.image);
    image.alt = work.title;
  }

  document.querySelectorAll("[data-work-index]").forEach((button) => {
    button.addEventListener("click", () => {
      const work = works[Number(button.dataset.workIndex)];
      if (work.video) {
        videoStatus.textContent = "";
        videoPlayer.src = assetPath(work.video);
        videoPlayer.poster = assetPath(work.image);
        videoDialog.showModal();
        videoPlayer.load();
        videoPlayer.play().catch((error) => {
          console.error(`Unable to start video for "${work.title}".`, error);
          videoStatus.textContent = "재생을 시작하지 못했습니다. 영상의 재생 버튼을 눌러주세요.";
        });
      } else {
        showWork(Number(button.dataset.workIndex));
        dialog.showModal();
      }
    });
  });

  dialog.addEventListener("click", () => dialog.close());
  dialog.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      dialog.close();
      return;
    }
    if (event.key === "ArrowLeft") showWork(activeIndex - 1);
    if (event.key === "ArrowRight") showWork(activeIndex + 1);
  });

  videoDialog.addEventListener("click", (event) => {
    if (event.target === videoDialog) videoDialog.close();
  });
  videoPlayer.addEventListener("loadedmetadata", () => {
    if (videoPlayer.videoWidth && videoPlayer.videoHeight) {
      videoDialog.style.setProperty("--video-aspect-ratio", videoPlayer.videoWidth / videoPlayer.videoHeight);
    }
  });
  videoDialog.addEventListener("close", () => {
    videoPlayer.pause();
    videoPlayer.removeAttribute("src");
    videoPlayer.removeAttribute("poster");
    videoDialog.style.removeProperty("--video-aspect-ratio");
    videoPlayer.load();
    videoStatus.textContent = "";
  });
  videoPlayer.addEventListener("error", () => {
    if (videoPlayer.currentSrc) videoStatus.textContent = "영상을 불러오지 못했습니다.";
  });
}
}

initializeSite();
