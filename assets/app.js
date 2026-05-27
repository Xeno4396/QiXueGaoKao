const state = {
  groups: [],
  majorsByGroup: new Map(),
  provinces: {},
  category: "历史类",
  sortKey: "ZYZZDF",
  sortDir: "desc",
  expandedKey: "",
};

const els = {
  subjectButtons: [...document.querySelectorAll(".subject-button")],
  provinceFilter: document.querySelector("#provinceFilter"),
  minScore: document.querySelector("#minScore"),
  maxScore: document.querySelector("#maxScore"),
  majorQuery: document.querySelector("#majorQuery"),
  schoolQuery: document.querySelector("#schoolQuery"),
  resetFilters: document.querySelector("#resetFilters"),
  resultCount: document.querySelector("#resultCount"),
  filterSummary: document.querySelector("#filterSummary"),
  unmatchedNotice: document.querySelector("#unmatchedNotice"),
  resultsBody: document.querySelector("#resultsBody"),
  sortButtons: [...document.querySelectorAll("[data-sort]")],
};

const numberFields = new Set(["ZYZLQRS", "ZYZZGF", "ZYZZDF"]);

function groupKey(row) {
  return [row.PCDM, row.KLDM, row.YXDH.trim(), row.ZYZDH.trim()].join("|");
}

function normalize(text) {
  return String(text || "").trim().toLowerCase();
}

function toNumber(value) {
  const num = Number(value);
  return Number.isFinite(num) ? num : -1;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function highlight(value, query) {
  const text = escapeHtml(value);
  const q = String(query || "").trim();
  if (!q) return text;
  const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return text.replace(new RegExp(escaped, "gi"), (match) => `<mark>${match}</mark>`);
}

function deriveCategory(row) {
  return row.KLMC.includes("历史") ? "历史类" : "物理类";
}

async function loadData() {
  const [groups, majors, provinces] = await Promise.all([
    fetch("data/lq2.json").then((res) => res.json()),
    fetch("data/lq.json").then((res) => res.json()),
    fetch("data/school-provinces.json").then((res) => res.json()),
  ]);

  state.provinces = provinces;
  state.groups = groups.map((row) => {
    const school = row.YXMC.trim();
    return {
      ...row,
      YXDH: row.YXDH.trim(),
      ZYZDH: row.ZYZDH.trim(),
      YXMC: school,
      province: provinces[school] || "未匹配",
      category: deriveCategory(row),
      _key: groupKey(row),
    };
  });

  for (const major of majors) {
    const key = groupKey(major);
    const entry = {
      ...major,
      YXDH: major.YXDH.trim(),
      ZYZDH: major.ZYZDH.trim(),
      ZYDH: major.ZYDH.trim(),
      _key: key,
    };
    if (!state.majorsByGroup.has(key)) state.majorsByGroup.set(key, []);
    state.majorsByGroup.get(key).push(entry);
  }

  fillProvinceOptions();
  updateUnmatchedNotice();
  render();
}

function fillProvinceOptions() {
  const provinceOrder = [...new Set(Object.values(state.provinces))]
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b, "zh-Hans-CN"));

  els.provinceFilter.innerHTML = [
    '<option value="">全部省份</option>',
    ...provinceOrder.map((province) => `<option value="${escapeHtml(province)}">${escapeHtml(province)}</option>`),
  ].join("");
}

function updateUnmatchedNotice() {
  const unmatchedCount = state.groups.filter((row) => row.province === "未匹配").length;
  els.unmatchedNotice.textContent = unmatchedCount
    ? `有 ${unmatchedCount} 条记录暂未匹配省份，可在 data/school-provinces.json 中补充。`
    : "院校省份映射已覆盖当前本科数据。";
}

function getFilters() {
  return {
    province: els.provinceFilter.value,
    minScore: els.minScore.value === "" ? null : Number(els.minScore.value),
    maxScore: els.maxScore.value === "" ? null : Number(els.maxScore.value),
    majorQuery: normalize(els.majorQuery.value),
    schoolQuery: normalize(els.schoolQuery.value),
  };
}

function groupMatchesMajor(row, majorQuery) {
  if (!majorQuery) return true;
  const majors = state.majorsByGroup.get(row._key) || [];
  return majors.some((major) => normalize(major.ZYMC).includes(majorQuery));
}

function getFilteredGroups() {
  const filters = getFilters();
  return state.groups.filter((row) => {
    const score = toNumber(row.ZYZZDF);
    return row.category === state.category
      && (!filters.province || row.province === filters.province)
      && (filters.minScore === null || score >= filters.minScore)
      && (filters.maxScore === null || score <= filters.maxScore)
      && (!filters.schoolQuery || normalize(row.YXMC).includes(filters.schoolQuery))
      && groupMatchesMajor(row, filters.majorQuery);
  });
}

function sortGroups(rows) {
  const direction = state.sortDir === "asc" ? 1 : -1;
  return [...rows].sort((a, b) => {
    const av = numberFields.has(state.sortKey) ? toNumber(a[state.sortKey]) : String(a[state.sortKey] || "");
    const bv = numberFields.has(state.sortKey) ? toNumber(b[state.sortKey]) : String(b[state.sortKey] || "");
    if (typeof av === "number" && typeof bv === "number") return (av - bv) * direction;
    return av.localeCompare(bv, "zh-Hans-CN", { numeric: true }) * direction;
  });
}

function render() {
  const rows = sortGroups(getFilteredGroups());
  const filters = getFilters();
  els.resultCount.textContent = `${rows.length} 条结果`;
  els.filterSummary.textContent = `${state.category}，含普通类与专项类`;

  if (!rows.length) {
    els.resultsBody.innerHTML = '<tr><td colspan="9" class="empty">没有匹配结果，试试放宽分数或关键词。</td></tr>';
    return;
  }

  els.resultsBody.innerHTML = rows.map((row) => renderGroupRow(row, filters.majorQuery)).join("");
}

function renderGroupRow(row, majorQuery) {
  const majors = state.majorsByGroup.get(row._key) || [];
  const isExpanded = state.expandedKey === row._key;
  const summary = `
    <tr>
      <td><div class="school">${highlight(row.YXMC, els.schoolQuery.value)}</div><div class="muted">${escapeHtml(row.YXDH)}</div></td>
      <td>${escapeHtml(row.province)}</td>
      <td>${escapeHtml(row.JHLBMC)}</td>
      <td><span class="tag">${escapeHtml(row.KLMC)}</span></td>
      <td>${escapeHtml(row.ZYZDH)}</td>
      <td class="score">${escapeHtml(row.ZYZLQRS)}</td>
      <td class="score">${escapeHtml(row.ZYZZGF)}</td>
      <td class="score">${escapeHtml(row.ZYZZDF)}</td>
      <td><button class="detail-button" type="button" data-key="${escapeHtml(row._key)}">${isExpanded ? "收起" : `查看 ${majors.length}`}</button></td>
    </tr>`;

  if (!isExpanded) return summary;
  return `${summary}${renderDetailsRow(row, majors, majorQuery)}`;
}

function renderDetailsRow(row, majors, majorQuery) {
  const visibleMajors = majorQuery
    ? majors.filter((major) => normalize(major.ZYMC).includes(majorQuery))
    : majors;
  const body = visibleMajors.length
    ? visibleMajors.map((major) => `
      <article class="major-item">
        <div class="major-name">${highlight(major.ZYMC, els.majorQuery.value)}</div>
        <div class="major-meta">
          <span>代码 ${escapeHtml(major.ZYDH)}</span>
          <span>录取 ${escapeHtml(major.LQRS)} 人</span>
          <span>最高 ${escapeHtml(major.ZGF)}</span>
          <span>最低 ${escapeHtml(major.ZDF)}</span>
        </div>
      </article>`).join("")
    : '<div class="empty">该专业组没有匹配当前专业关键词的明细。</div>';

  return `
    <tr class="details-row">
      <td colspan="9">
        <div class="details">
          <div class="details-title">
            <span>${escapeHtml(row.YXMC)} · ${escapeHtml(row.ZYZDH)} 专业组</span>
            <span>${visibleMajors.length}/${majors.length} 个专业</span>
          </div>
          <div class="major-grid">${body}</div>
        </div>
      </td>
    </tr>`;
}

function bindEvents() {
  els.subjectButtons.forEach((button) => {
    button.addEventListener("click", () => {
      state.category = button.dataset.category;
      state.expandedKey = "";
      els.subjectButtons.forEach((item) => {
        const active = item === button;
        item.classList.toggle("active", active);
        item.setAttribute("aria-selected", String(active));
      });
      render();
    });
  });

  [els.provinceFilter, els.minScore, els.maxScore, els.majorQuery, els.schoolQuery].forEach((control) => {
    control.addEventListener("input", () => {
      state.expandedKey = "";
      render();
    });
  });

  els.resetFilters.addEventListener("click", () => {
    els.provinceFilter.value = "";
    els.minScore.value = "";
    els.maxScore.value = "";
    els.majorQuery.value = "";
    els.schoolQuery.value = "";
    state.expandedKey = "";
    render();
  });

  els.sortButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const key = button.dataset.sort;
      if (state.sortKey === key) {
        state.sortDir = state.sortDir === "asc" ? "desc" : "asc";
      } else {
        state.sortKey = key;
        state.sortDir = numberFields.has(key) ? "desc" : "asc";
      }
      render();
    });
  });

  els.resultsBody.addEventListener("click", (event) => {
    const button = event.target.closest(".detail-button");
    if (!button) return;
    state.expandedKey = state.expandedKey === button.dataset.key ? "" : button.dataset.key;
    render();
  });
}

bindEvents();
loadData().catch((error) => {
  console.error(error);
  els.resultCount.textContent = "加载失败";
  els.filterSummary.textContent = "请通过本地服务器打开页面，例如 npm-free 的 python -m http.server。";
  els.resultsBody.innerHTML = '<tr><td colspan="9" class="empty">无法读取 data 目录中的 JSON 文件。</td></tr>';
});
