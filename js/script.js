(() => {
  const storageKey = "link-collection-config";
  const configUrl = "./config.json";
  const titleEl = document.getElementById("site-title");
  const subtitleEl = document.getElementById("site-subtitle");
  const linksEl = document.getElementById("links");
  const messageEl = document.getElementById("message");
  const adminPanel = document.getElementById("admin-panel");
  const adminBody = document.getElementById("admin-body");
  const adminToggle = document.getElementById("admin-toggle");
  const adminLinks = document.getElementById("admin-links");
  const addLinkButton = document.getElementById("add-link");
  const resetButton = document.getElementById("reset-default");
  const exportButton = document.getElementById("export-config");
  const inputTitle = document.getElementById("input-title");
  const inputSubtitle = document.getElementById("input-subtitle");
  const pageName = window.location.pathname.split("/").pop();
  const isAdmin = pageName === "admin.html";
  let hasLocalData = false;

  const makeIcon = (label, start, end) => {
    const svg = `
      <svg width="160" height="160" viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${label}">
        <defs>
          <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop stop-color="${start}" offset="0%"/>
            <stop stop-color="${end}" offset="100%"/>
          </linearGradient>
        </defs>
        <rect width="160" height="160" rx="38" fill="url(#g)"/>
        <path d="M28 52a24 24 0 0124-24h56a24 24 0 0124 24v56a24 24 0 01-24 24H52a24 24 0 01-24-24z" fill="rgba(5,11,22,0.08)"/>
        <text x="50%" y="55%" text-anchor="middle" font-family="Space Grotesk, Arial, sans-serif" font-weight="700" font-size="54" fill="#ffffff">${label}</text>
      </svg>
    `;
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  };

  const defaultData = {
    title: "つぼっち＆VOLANTE",
    subtitle: "webデザイナー / アビスパDAOモデレーター\nはなうたFC / VOLANTEデザイナー",
    links: [
      { label: "Instagram", url: "https://www.instagram.com/tsubo_tsubo17/", iconText: "Ig", startColor: "#f8a5c2", endColor: "#c06f98" },
      { label: "X (Twitter)", url: "https://x.com/tsubo_volante", iconText: "X", startColor: "#0f203c", endColor: "#4ed0ff" },
    ],
  };

  const clone = (data) => JSON.parse(JSON.stringify(data));

  const loadData = () => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return clone(defaultData);
      hasLocalData = true;
      const parsed = JSON.parse(raw);
      return {
        title: parsed.title || defaultData.title,
        subtitle: parsed.subtitle || defaultData.subtitle,
        links: Array.isArray(parsed.links) && parsed.links.length ? parsed.links : clone(defaultData.links),
      };
    } catch (e) {
      console.warn("ローカルデータの読み込みに失敗しました。初期値を使用します。", e);
      return clone(defaultData);
    }
  };

  let state = loadData();

  const persist = () => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(state));
    } catch (e) {
      console.warn("保存に失敗しました。", e);
    }
  };

  const normalizeLink = (link) => ({
    label: link.label || "無題リンク",
    url: link.url || "",
    iconText: link.iconText || (link.label || "?"),
    startColor: link.startColor || "#1e3358",
    endColor: link.endColor || "#73c9ff",
    iconUrl: link.iconUrl || "",
  });

  const renderSubtitle = (text) => {
    if (!subtitleEl) return;
    subtitleEl.innerHTML = "";
    const lines = (text || "").split("\n").map((line) => line.trim());
    lines.forEach((line, index) => {
      subtitleEl.appendChild(document.createTextNode(line));
      if (index < lines.length - 1) {
        subtitleEl.appendChild(document.createElement("br"));
      }
    });
  };

  const renderLinks = () => {
    if (!linksEl) return;
    linksEl.innerHTML = "";
    if (!state.links.length) {
      if (messageEl) messageEl.textContent = "まだリンクがありません。";
      return;
    }
    if (messageEl) messageEl.textContent = "";
    state.links.forEach((link) => {
      const normalized = normalizeLink(link);
      const card = document.createElement("a");
      card.className = "link-card";
      card.href = normalized.url || "#";
      card.target = "_blank";
      card.rel = "noopener noreferrer";

      const img = document.createElement("img");
      img.className = "link-icon";
      img.src = normalized.iconUrl || makeIcon(normalized.iconText, normalized.startColor, normalized.endColor);
      img.alt = normalized.label;
      img.loading = "lazy";

      const label = document.createElement("p");
      label.className = "link-label";
      label.textContent = normalized.label;

      card.appendChild(img);
      card.appendChild(label);
      linksEl.appendChild(card);
    });
  };

  const renderPublic = () => {
    if (titleEl) {
      titleEl.textContent = state.title || defaultData.title;
    }
    renderSubtitle(state.subtitle || "");
    renderLinks();
  };

  const buildInput = (type, value, placeholder) => {
    const input = document.createElement("input");
    input.className = "admin-input";
    input.type = type;
    input.value = value || "";
    if (placeholder) input.placeholder = placeholder;
    return input;
  };

  const buildColorInput = (value) => {
    const input = document.createElement("input");
    input.type = "color";
    input.value = value || "#1e3358";
    input.className = "admin-color";
    return input;
  };

  const renderAdminLinks = () => {
    if (!adminLinks) return;
    adminLinks.innerHTML = "";
    if (!state.links.length) {
      const empty = document.createElement("p");
      empty.className = "admin-panel__note";
      empty.textContent = "リンクがありません。「＋ リンクを追加」で登録してください。";
      adminLinks.appendChild(empty);
      return;
    }

    state.links.forEach((link, index) => {
      const wrapper = document.createElement("div");
      wrapper.className = "admin-link";

      const labelInput = buildInput("text", link.label, "ラベル");
      labelInput.addEventListener("input", () => {
        state.links[index] = normalizeLink({ ...state.links[index], label: labelInput.value });
        persist();
        renderPublic();
      });

      const urlInput = buildInput("url", link.url, "https://example.com");
      urlInput.addEventListener("input", () => {
        state.links[index] = normalizeLink({ ...state.links[index], url: urlInput.value });
        persist();
        renderPublic();
      });

      const iconInput = buildInput("text", link.iconText, "2文字程度");
      iconInput.maxLength = 4;
      iconInput.addEventListener("input", () => {
        state.links[index] = normalizeLink({ ...state.links[index], iconText: iconInput.value });
        persist();
        renderPublic();
      });

      const startColorInput = buildColorInput(link.startColor);
      startColorInput.addEventListener("input", () => {
        state.links[index] = normalizeLink({ ...state.links[index], startColor: startColorInput.value });
        persist();
        renderPublic();
      });

      const endColorInput = buildColorInput(link.endColor);
      endColorInput.addEventListener("input", () => {
        state.links[index] = normalizeLink({ ...state.links[index], endColor: endColorInput.value });
        persist();
        renderPublic();
      });

      const removeButton = document.createElement("button");
      removeButton.type = "button";
      removeButton.className = "admin-button admin-button--ghost";
      removeButton.textContent = "削除";
      removeButton.addEventListener("click", () => {
        state.links.splice(index, 1);
        persist();
        renderPublic();
        renderAdminLinks();
      });

      const labelGroup = document.createElement("div");
      labelGroup.className = "admin-link__field";
      labelGroup.appendChild(createFieldLabel("ラベル"));
      labelGroup.appendChild(labelInput);

      const urlGroup = document.createElement("div");
      urlGroup.className = "admin-link__field";
      urlGroup.appendChild(createFieldLabel("URL"));
      urlGroup.appendChild(urlInput);

      const iconGroup = document.createElement("div");
      iconGroup.className = "admin-link__field admin-link__icon-row";
      iconGroup.appendChild(createFieldLabel("アイコンテキスト"));
      iconGroup.appendChild(iconInput);

      const iconUrlGroup = document.createElement("div");
      iconUrlGroup.className = "admin-link__field admin-link__icon-row";
      iconUrlGroup.appendChild(createFieldLabel("アイコンURL（未入力なら生成）"));
      const iconUrlInput = buildInput("text", link.iconUrl, "https://example.com/icon.png または data:image/...");
      iconUrlInput.addEventListener("input", () => {
        state.links[index] = normalizeLink({ ...state.links[index], iconUrl: iconUrlInput.value.trim() });
        persist();
        renderPublic();
      });
      iconUrlGroup.appendChild(iconUrlInput);

      const uploadGroup = document.createElement("div");
      uploadGroup.className = "admin-link__field admin-link__upload";
      const uploadLabel = createFieldLabel("画像をアップロード（ローカル保存）");
      const uploadInput = document.createElement("input");
      uploadInput.type = "file";
      uploadInput.accept = "image/*";
      uploadInput.className = "admin-input";
      uploadInput.addEventListener("change", (ev) => {
        const file = ev.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
          const dataUrl = typeof reader.result === "string" ? reader.result : "";
          state.links[index] = normalizeLink({ ...state.links[index], iconUrl: dataUrl });
          iconUrlInput.value = dataUrl;
          persist();
          renderPublic();
        };
        reader.readAsDataURL(file);
      });
      uploadGroup.appendChild(uploadLabel);
      uploadGroup.appendChild(uploadInput);

      const clearIconButton = document.createElement("button");
      clearIconButton.type = "button";
      clearIconButton.className = "admin-button admin-button--ghost";
      clearIconButton.textContent = "生成アイコンに戻す";
      clearIconButton.addEventListener("click", () => {
        state.links[index] = normalizeLink({ ...state.links[index], iconUrl: "" });
        iconUrlInput.value = "";
        if (uploadInput) uploadInput.value = "";
        persist();
        renderPublic();
      });

      const colorGroup = document.createElement("div");
      colorGroup.className = "admin-link__colors";
      const startWrap = document.createElement("div");
      startWrap.className = "admin-link__color";
      startWrap.appendChild(createFieldLabel("開始色"));
      startWrap.appendChild(startColorInput);
      const endWrap = document.createElement("div");
      endWrap.className = "admin-link__color";
      endWrap.appendChild(createFieldLabel("終了色"));
      endWrap.appendChild(endColorInput);
      colorGroup.appendChild(startWrap);
      colorGroup.appendChild(endWrap);

      const actions = document.createElement("div");
      actions.className = "admin-link__actions";
      actions.appendChild(clearIconButton);
      actions.appendChild(removeButton);

      wrapper.appendChild(labelGroup);
      wrapper.appendChild(urlGroup);
      wrapper.appendChild(iconGroup);
      wrapper.appendChild(iconUrlGroup);
      wrapper.appendChild(uploadGroup);
      wrapper.appendChild(colorGroup);
      wrapper.appendChild(actions);

      adminLinks.appendChild(wrapper);
    });
  };

  function createFieldLabel(text) {
    const label = document.createElement("span");
    label.className = "admin-label";
    label.textContent = text;
    return label;
  }

  const syncForm = () => {
    if (inputTitle) inputTitle.value = state.title || "";
    if (inputSubtitle) inputSubtitle.value = state.subtitle || "";
  };

  const attachFormHandlers = () => {
    if (inputTitle) {
      inputTitle.addEventListener("input", () => {
        state.title = inputTitle.value || "";
        persist();
        renderPublic();
      });
    }
    if (inputSubtitle) {
      inputSubtitle.addEventListener("input", () => {
        state.subtitle = inputSubtitle.value || "";
        persist();
        renderPublic();
      });
    }
    if (addLinkButton) {
      addLinkButton.addEventListener("click", () => {
        state.links.push(
          normalizeLink({
            label: "New Link",
            url: "https://",
            iconText: "N",
            startColor: "#1e3358",
            endColor: "#73c9ff",
          }),
        );
        persist();
        renderPublic();
        renderAdminLinks();
      });
    }
    if (resetButton) {
      resetButton.addEventListener("click", () => {
        if (!confirm("初期データに戻しますか？")) return;
        state = clone(defaultData);
        persist();
        syncForm();
        renderPublic();
        renderAdminLinks();
      });
    }
    if (adminToggle && adminBody) {
      adminToggle.addEventListener("click", () => {
        const isHidden = adminBody.classList.toggle("is-hidden");
        adminToggle.textContent = isHidden ? "開く" : "閉じる";
      });
    }
    if (exportButton) {
      exportButton.addEventListener("click", () => {
        const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "config.json";
        a.click();
        URL.revokeObjectURL(url);
      });
    }
  };

  const loadConfigFile = async () => {
    if (hasLocalData) return;
    try {
      const res = await fetch(configUrl, { cache: "no-store" });
      if (!res.ok) return;
      const json = await res.json();
      if (!json || typeof json !== "object") return;
      state = {
        title: json.title || state.title,
        subtitle: json.subtitle || state.subtitle,
        links: Array.isArray(json.links) && json.links.length ? json.links : state.links,
      };
      renderPublic();
      if (isAdmin) {
        syncForm();
        renderAdminLinks();
      }
    } catch (e) {
      console.warn("config.json の読み込みに失敗しました。", e);
    }
  };

  renderPublic();
  if (isAdmin) {
    syncForm();
    renderAdminLinks();
    attachFormHandlers();
  } else if (adminPanel) {
    adminPanel.classList.add("admin-panel--hidden");
  }
  loadConfigFile();
})();
