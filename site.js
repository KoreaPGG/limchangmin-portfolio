const instagramUrl =
  "https://www.instagram.com/lim_changmin_official?igsh=Njd5ajR2eG5kZDli&igsi=Njd5ajR2eG5kZDli";

let works = [...window.portfolioWorks].sort((a, b) => b.year - a.year);

const exhibitionPhotos = [
  "Jeju Museum of Art, 2021",
  "George Rogers Park, 2020",
  "Art Miami, view 06",
  "Art Miami, view 07",
  "Art Miami, view 08",
  "Exhibition installation view",
  "Abu Dhabi Art, 2018",
  "Art fair installation, view 002",
  "Art fair installation, view 004",
  "Art fair installation, view 005",
  "Art fair installation, view 006",
  "Art fair installation, view 007",
  "Artside Gallery, view 001",
  "Artside Gallery, view 002",
  "GS Caltex Yeulmaru Museum, view 001",
  "GS Caltex Yeulmaru Museum, view 002",
  "GS Caltex Yeulmaru Museum, view 003",
  "GS Caltex Yeulmaru Museum, view 004",
  "GS Caltex Yeulmaru Museum, view 005",
  "Incheon International Airport installation",
  "Exhibition overview",
  "Jeju Museum of Art exhibition",
  "POSCO THE SHARP Gallery, view 001",
  "POSCO THE SHARP Gallery, view 002",
  "POSCO THE SHARP Gallery, view 003",
];

const soloExhibitions = [
  ["2026", ["Homage to Park Dong Jun 2026, Gallery Bundo, Daegu, Korea"]],
  ["2025", ["Eternal Seasons, The Trinity Gallery, Seoul, Korea"]],
  [
    "2024",
    [
      "Your Home Somewhere, POSCO THE SHARP Gallery, Seoul, Korea",
      "Time-Warp, Artrium Mori, Seongju, Korea",
    ],
  ],
  [
    "2023",
    [
      "Meditation of Time, DOT Museum, Busan, Korea",
      "Into a Time Frame, ARX Gallery, London, UK",
    ],
  ],
  ["2022", ["Silent Move, The Trinity Gallery, Seoul, Korea"]],
  [
    "2021",
    [
      "At the Moment, Artside Gallery, Seoul, Korea",
      "Listen to the Silence, SOUL Art Space, Busan, Korea",
      "Lim Chang Min Solo Exhibition, GS Caltex Yeulmaru Museum, Yeosu, Korea",
    ],
  ],
  ["2020", ["Borrowed Landscape, AB Gallery, Portland, USA"]],
  [
    "2019",
    [
      "Into a Time Frame, SOUL Art Space, Busan, Korea",
      "The Aesthetics of Slowness, Expo Art Gallery, Yeosu, Korea",
    ],
  ],
];

const pressItems = [
  [
    "아리랑TV - [Arts Avenue 2018] Ep.11 - Into a Time Frame",
    "2018. 03. 15",
    "https://youtu.be/mOYiATm2N_w?si=JEVk35p14BNXYN2n",
  ],
  [
    "[문화요] 창 너머, 풍경에 머무는 시간 ❘ 갤러리분도 ‘임창민 전’",
    "2026. 05. 08",
    "https://youtu.be/68AjGw-rsyA?si=X0Kb0ggDg1wiKaG_",
  ],
  [
    "[MBN이 만난 작가] 사진과 영상을 결합하는 임창민 [MBN-i]",
    "2021. 06. 11",
    "https://youtu.be/zq3z4SwZV1Y?si=zOLWzAtwN-2lDjFU",
  ],
  [
    "더샵갤러리 STAY # 스페셜 아트 도슨트 강희",
    "2024. 03. 02",
    "https://youtu.be/0YSwA-OT2WA?si=g2UKSfvOtSi0cQyR",
  ],
  [
    "TBC문화로 채움 - 미디어아트 작가 임창민",
    "2022. 12. 15",
    "https://www.youtube.com/watch?v=XeaYo-8HW-o",
  ],
  [
    "임창민의 사진과 영상의 결합 / 월간 「사진예술」 (11월호)",
    "2021. 11. 24",
    "https://youtu.be/TrUgYU4q1F4?si=eJntszECJBEOCj45",
  ],
  [
    "[전시 따라잡기] 임창민 개인전…갤러리분도 22일까지",
    "2026.05.05",
    "https://www.idaegu.co.kr/news/articleView.html?idxno=547047",
  ],
  [
    "사진과 동영상으로 빚어낸 정중동의 미학…homage to 박동준 2026_임창민 展",
    "2026. 04. 27",
    "https://www.yeongnam.com/web/view.php?key=20260427029379416",
  ],
  [
    "고요 속 흐름을 담다···미디어아티스트 임창민 ‘Homage to 박동준’展, 대구 갤러리분도서 개막",
    "2026. 04. 15",
    "https://www.kbmaeil.com/article/20260415500542",
  ],
  [
    "\"멈춰 있는 듯 흐르는 자연의 시간\"…임창민 '이터널 시즌즈'展",
    "2025. 07. 14",
    "https://www.news1.kr/life-culture/performance-exhibition/5844622",
  ],
  [
    "세계 곳곳의 풍경, 한 화면에 엮인 영원한 계절의 사유, 미디어 아티스트 임창민 개인전《Eternal Seasons : INTO A TIME FRAME》展",
    "2025. 07. 12",
    "https://www.ikoreanspirit.com/news/articleView.html?idxno=80743",
  ],
  [
    "아트리움 모리, 미디어 아티스트 임창민 작가 개인전 'Time-warp' 개최",
    "2024. 07. 07",
    "https://www.yeongnam.com/web/view.php?key=20240703010000419",
  ],
  [
    "성주 아트리움모리, 미디어 아티스트 임창민 개인전 ‘타임워프(Time-warp)’",
    "2024. 07. 03",
    "https://www.imaeil.com/page/view/2024070312030394061",
  ],
];

const page = document.body.dataset.page || "home";
const app = document.querySelector("#app");
const assetPath = (filename) => window.worksStore ? window.worksStore.assetPath(filename) : `/assets/${filename}`;
const pagePath = (name) => `/${name}/`;
const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
})[character]);

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
                  ? `<video class="work-video-preview" data-src="${escapeHtml(assetPath(video))}" poster="${escapeHtml(assetPath(image))}"${previewScale ? ` style="--preview-scale: ${Number(previewScale)}"` : ""} muted loop playsinline preload="none" aria-hidden="true"></video>`
                  : `<img src="${escapeHtml(assetPath(image))}" alt="${escapeHtml(title)}" loading="${index < 4 ? "eager" : "lazy"}" decoding="async" />`}
              </button>
              <p>${escapeHtml(title)}</p>
            </article>`,
          )
          .join("")}</div>
      </section>`,
    )
    .join("");
  const exhibitionGallery = exhibitionPhotos
    .map(
      (caption, index) => `<figure class="exhibition-photo">
        <img src="${assetPath(`exhibition/exhibition-${String(index + 1).padStart(2, "0")}.webp`)}" alt="${caption}" loading="lazy" decoding="async" />
        <figcaption>${caption}</figcaption>
      </figure>`,
    )
    .join("");

  return `<main class="work-page page-content">
    <div class="works-by-year" aria-label="Selected works, organized by year">${yearSections}</div>
    <section class="exhibition-gallery" aria-labelledby="exhibition-gallery-title">
      <h2 id="exhibition-gallery-title">Exhibition Views</h2>
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
  return `<div class="exhibition-list">${items
    .map(
      ([year, entries]) => `<div class="exhibition-year">
        <h3>${year}</h3>
        <ul>${entries.map((entry) => `<li>${entry}</li>`).join("")}</ul>
      </div>`,
    )
    .join("")}</div>`;
}

function renderAbout() {
  return `<main class="about-layout page-content">
    <nav class="about-index" aria-label="About sections">
      <a href="#about">about</a>
      <a href="#exhibitions">exhibitions</a>
      <a href="#current">current</a>
    </nav>
    <div class="about-content">
      <section id="about" class="about-intro">
        <img class="portrait" src="${assetPath("profile.jpg")}" alt="Portrait of Lim Changmin" />
        <h1>Lim Changmin</h1>
        <div class="biography">
          <p>Lim Chang Min is a Korean media artist and Professor in the Department of Video &amp; Animation at Keimyung University. His artistic practice explores the intersection of time, memory, landscape, and moving images through photography, video, and digital media.</p>
          <p>He has served as a juror for the Tashkent International Biennale in Uzbekistan, an executive committee member of the Gwangju Biennale, and a judge for the Korean National Assembly Video Content Awards. He was also a Visiting Professor at Portland State University in the United States.</p>
          <p>Lim's works have been exhibited at leading museums and institutions, including the National Museum of Modern and Contemporary Art, Korea (MMCA), Shanghai Museum of Contemporary Art (MoCA Shanghai), Seoul Museum of Art, and Daegu Art Museum. His works are included in museum and private collections and have been presented internationally in New York, Paris, Tokyo, Hong Kong, Dubai, Shanghai, London, and other cities.</p>
          <p>In recent years, he has collaborated with major organizations and corporations, including LG, ACE Bed, POSCO, GS Caltex, and Incheon International Airport, producing a wide range of public art and media art projects.</p>
        </div>
      </section>
      <section id="exhibitions" class="about-section">
        <span id="history"></span>
        <h2>Selected Solo Exhibitions</h2>
        ${exhibitionList(soloExhibitions)}
        <h2 class="group-heading">Selected Group Exhibitions</h2>
        ${exhibitionList(soloExhibitions)}
        <div class="education-block">
          <h2>Education</h2>
          <ul>
            <li>MFA, Media Art Production, The City University of New York, USA</li>
            <li>MA, Art in Media, New York University, USA</li>
            <li>BFA, Fine Arts, Keimyung University, Republic of Korea</li>
          </ul>
        </div>
      </section>
      <section id="current" class="about-section current-section">
        <h2>Current</h2>
        <div class="current-grid">
          <div>
            <h3>Professor</h3>
            <p>Department of Video &amp; Animation</p>
            <p>College of Fine Arts, Keimyung University</p>
          </div>
          <div>
            <h3>Office</h3>
            <p>Department of Video &amp; Animation, College of Fine Arts (Susan Hall 103)</p>
            <p>Keimyung University 2139 Daemyeong-dong, Nam-gu, Daegu 42403, Korea</p>
          </div>
        </div>
      </section>
    </div>
  </main>`;
}

function renderPress() {
  const items = pressItems
    .map(
      ([title, date, href]) => `<li class="press-item">
        <a href="${href}" target="_blank" rel="noreferrer">${title}</a>
        <time>${date}</time>
      </li>`,
    )
    .join("");
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

async function initializeSite() {
let loadError = false;
if (page === "work" && window.worksStore.configured) {
  try {
    works = await window.worksStore.list();
  } catch (error) {
    console.error("Unable to load updated works.", error);
    loadError = true;
    works = [];
  }
}
app.innerHTML = `${header()}${loadError ? '<p role="alert">최신 작업물을 불러오지 못했습니다. 잠시 후 새로고침해 주세요.</p>' : ""}${(pageContent[page] || renderHome)()}${page === "home" ? "" : footer()}`;

if (page === "home") {
  // Content bounds in 480×270 frames, excluding borders baked into the videos.
  const homeVideos = [
    { source: "home-videos/work-003.mp4?v=2", bounds: [45, 3, 391, 264] },
    { source: "home-videos/work-005.mp4?v=2", bounds: [36, 8, 412, 250] },
    { source: "home-videos/work-045.mp4?v=2", bounds: [42, 2, 397, 266] },
    { source: "home-videos/work-016.mp4?v=2", bounds: [39, 2, 403, 268] },
    { source: "home-videos/work-065.mp4?v=2", bounds: [37, 0, 406, 270] },
  ];
  const video = document.querySelector(".hero-video");
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
    updateVideoScale();
    video.src = assetPath(lastVideo);
    video.load();
    playVideo();
  }

  retry.addEventListener("click", playVideo);
  video.addEventListener("playing", () => {
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
      if (isIntersecting) {
        const source = preview.dataset.src;
        preview.muted = true;
        preview.src = source;
        preview.play().catch((error) => {
          if (preview.getAttribute("src") === source) {
            console.error(`Unable to play work preview "${source}".`, error);
          }
        });
      } else {
        preview.pause();
        preview.removeAttribute("src");
        preview.load();
      }
    });
  });
  document.querySelectorAll(".work-video-preview").forEach((preview) => previewObserver.observe(preview));

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
