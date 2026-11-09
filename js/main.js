// Portafolio · Lia De Peña Quiñones
// Menú móvil, enlace activo según la sección visible, buscador,
// animaciones de entrada y visor de imágenes.


(() => {
  const nav = document.querySelector(".nav");
  const toggle = document.querySelector(".nav__toggle");
  const links = [...document.querySelectorAll(".nav__link")];
  const mobileMenu = window.matchMedia("(max-width: 60rem)");

  // ---------- Menú móvil ----------
  const setMenu = (open) => {
    nav.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
  };
  toggle.addEventListener("click", () => setMenu(!nav.classList.contains("is-open")));
  links.forEach((a) => a.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && nav.classList.contains("is-open")) {
      setMenu(false);
      toggle.focus();
    }
  });
  document.addEventListener("click", (e) => {
    if (nav.classList.contains("is-open") && !nav.contains(e.target)) setMenu(false);
  });
  mobileMenu.addEventListener("change", () => setMenu(false));

  // ---------- Enlace activo ----------
  const sections = links
    .map((a) => document.querySelector(a.getAttribute("href")))
    .filter(Boolean);

  const markActive = (id) => {
    links.forEach((a) => {
      const active = a.getAttribute("href") === `#${id}`;
      a.classList.toggle("is-active", active);
      if (active) a.setAttribute("aria-current", "location");
      else a.removeAttribute("aria-current");
    });
  };

  let ticking = false;
  const updateActive = () => {
    ticking = false;
    const line = window.innerHeight * 0.35;
    let current = sections[0];
    for (const s of sections) if (s.getBoundingClientRect().top <= line) current = s;
    const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
    markActive(atBottom ? sections[sections.length - 1].id : current.id);
  };
  const onScroll = () => {
    if (!ticking) { ticking = true; requestAnimationFrame(updateActive); }
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  updateActive();

  // ---------- Buscador ----------
  const form = document.querySelector(".search");
  const input = form.querySelector("input");
  const msg = form.querySelector(".search__msg");
  const normalize = (s) =>
    s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9 ]/g, " ").trim();

  let msgTimer;
  const flash = (text) => {
    msg.textContent = text;
    msg.classList.add("is-visible");
    clearTimeout(msgTimer);
    msgTimer = setTimeout(() => msg.classList.remove("is-visible"), 3000);
  };

  // Los proyectos van primero para que "branding" lleve al proyecto, no a la sección.
  const targets = [
    ...document.querySelectorAll(".project[data-keywords]"),
    ...document.querySelectorAll("section[data-keywords], footer[data-keywords]"),
  ].map((el) => ({ el, kw: normalize(el.dataset.keywords) }));

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const q = normalize(input.value);
    if (!q) return flash("Escribe una palabra para buscar.");

    const words = q.split(/\s+/);
    const hit = targets.find(({ kw }) => kw.includes(q) || words.every((w) => kw.includes(w)));
    if (!hit) return flash(`Sin resultados para "${input.value}". Prueba con branding, educación o habilidades.`);

    setMenu(false);
    input.value = "";
    hit.el.classList.add("is-visible");
    hit.el.scrollIntoView({ behavior: "smooth", block: "start" });
    // Mover el foco al resultado para lectores de pantalla y teclado.
    if (!hit.el.hasAttribute("tabindex")) hit.el.setAttribute("tabindex", "-1");
    hit.el.focus({ preventScroll: true });
  });

  // ---------- Animaciones de entrada ----------
  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.add("is-visible");
          io.unobserve(en.target);
        }
      }),
      { threshold: 0.1, rootMargin: "0px 0px -8% 0px" }
    );
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("is-visible"));
  }

  // ---------- Visor de imágenes ----------
  const dialog = document.querySelector(".lightbox");
  const dImg = dialog.querySelector("img");
  const dCap = dialog.querySelector(".lightbox__caption");
  let opener = null;

  document.querySelectorAll(".zoomable").forEach((fig) => {
    const img = fig.querySelector("img");
    const caption = fig.querySelector("figcaption")?.textContent.trim() || "";
    fig.tabIndex = 0;
    fig.setAttribute("role", "button");
    fig.setAttribute("aria-label", `Ampliar imagen: ${caption || img.alt}`);
    const open = () => {
      opener = fig;
      dImg.src = img.currentSrc || img.src;
      dImg.alt = img.alt;
      dCap.textContent = caption;
      dialog.showModal();
    };
    fig.addEventListener("click", open);
    fig.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); }
    });
  });

  dialog.querySelector(".lightbox__close").addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (e) => { if (e.target === dialog) dialog.close(); });
  dialog.addEventListener("close", () => opener?.focus());

  // ---------- Año ----------
  document.getElementById("year").textContent = new Date().getFullYear();
})();
