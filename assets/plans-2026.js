const state = {
  datasets: {},
  provinces: {},
  batch: "undergraduate",
  sortKey: "syjh",
  sortDir: "desc",
  page: 1,
  pageSize: 100,
};

const batchConfig = {
  earlyA: {
    label: "本科提前批A段",
    source: "https://www.nm.zsks.cn/26gkwb/26zsjh/gkjh_26_1/jh/jhkl.html",
    categoryUrl: "data/2026-plans/early-a-kl.json",
    schoolUrl: "data/2026-plans/early-a-yx.json",
    majorUrl: "data/2026-plans/early-a-zy.json",
  },
  earlyB: {
    label: "本科提前批B段",
    source: "https://www.nm.zsks.cn/26gkwb/26zsjh/gkjh_26_2/jh/jhkl.html",
    categoryUrl: "data/2026-plans/early-b-kl.json",
    schoolUrl: "data/2026-plans/early-b-yx.json",
    majorUrl: "data/2026-plans/early-b-zy.json",
  },
  undergraduate: {
    label: "本科批",
    source: "https://www.nm.zsks.cn/26gkwb/26zsjh/gkjh_26_3/jh/jhkl.html",
    categoryUrl: "data/2026-plans/undergraduate-kl.json",
    schoolUrl: "data/2026-plans/undergraduate-yx.json",
    majorUrl: "data/2026-plans/undergraduate-zy.json",
  },
  vocationalEarly: {
    label: "高职（专科）提前批",
    source: "https://www.nm.zsks.cn/26gkwb/26zsjh/gkjh_26_6/jh/jhkl.html",
    categoryUrl: "data/2026-plans/vocational-early-kl.json",
    schoolUrl: "data/2026-plans/vocational-early-yx.json",
    majorUrl: "data/2026-plans/vocational-early-zy.json",
  },
  vocational: {
    label: "高职（专科）批",
    source: "https://www.nm.zsks.cn/26gkwb/26zsjh/gkjh_26_7/jh/jhkl.html",
    categoryUrl: "data/2026-plans/vocational-kl.json",
    schoolUrl: "data/2026-plans/vocational-yx.json",
    majorUrl: "data/2026-plans/vocational-zy.json",
  },
};

const els = {
  batchButtons: [...document.querySelectorAll(".batch-button")],
  categoryFilter: document.querySelector("#categoryFilter"),
  provinceFilter: document.querySelector("#provinceFilter"),
  requirementFilter: document.querySelector("#requirementFilter"),
  minPlan: document.querySelector("#minPlan"),
  maxPlan: document.querySelector("#maxPlan"),
  majorQuery: document.querySelector("#majorQuery"),
  schoolQuery: document.querySelector("#schoolQuery"),
  resetFilters: document.querySelector("#resetFilters"),
  resultCount: document.querySelector("#resultCount"),
  filterSummary: document.querySelector("#filterSummary"),
  pageInfo: document.querySelector("#pageInfo"),
  prevPage: document.querySelector("#prevPage"),
  nextPage: document.querySelector("#nextPage"),
  resultsBody: document.querySelector("#resultsBody"),
  sortButtons: [...document.querySelectorAll("[data-sort]")],
};

const numberFields = new Set(["syjh", "xznx", "xf"]);
const missingValue = "未公布";
const provinces = [
  "北京", "天津", "上海", "重庆", "河北", "山西", "辽宁", "吉林", "黑龙江", "江苏", "浙江", "安徽", "福建", "江西",
  "山东", "河南", "湖北", "湖南", "广东", "海南", "四川", "贵州", "云南", "陕西", "甘肃", "青海", "内蒙古", "广西",
  "西藏", "宁夏", "新疆", "香港", "澳门"
];
const provinceRules = {
  北京: ["北京", "首都", "清华", "中国人民大学", "中国政法", "中央财经", "中央民族", "对外经济贸易", "中国农业大学", "中国传媒", "中国音乐", "中央音乐", "北京电影", "北京舞蹈", "北京电子科技", "中国人民公安", "中国刑事警察", "中国消防救援", "外交学院", "国际关系"],
  天津: ["天津", "南开"],
  上海: ["上海", "复旦", "同济", "华东师范", "华东理工", "华东政法", "东华大学", "上海纽约"],
  重庆: ["重庆", "西南大学", "西南政法", "四川外国语", "四川美术"],
  河北: ["河北", "石家庄", "唐山", "保定", "秦皇岛", "邯郸", "邢台", "沧州", "廊坊", "衡水", "承德", "张家口", "燕山大学", "中央司法警官"],
  山西: ["山西", "太原", "大同", "长治", "晋中", "运城", "忻州", "吕梁", "中北大学"],
  辽宁: ["辽宁", "沈阳", "大连", "鞍山", "丹东", "锦州", "营口", "阜新", "辽阳", "盘锦", "铁岭", "葫芦岛", "东北大学", "鲁迅美术"],
  吉林: ["吉林", "长春", "延边", "通化", "白城", "北华大学", "东北电力", "东北师范"],
  黑龙江: ["黑龙江", "哈尔滨", "齐齐哈尔", "牡丹江", "佳木斯", "大庆", "绥化", "东北林业", "东北农业", "哈尔滨音乐"],
  江苏: ["江苏", "南京", "苏州", "无锡", "常州", "镇江", "南通", "扬州", "徐州", "连云港", "淮阴", "盐城", "泰州", "宿迁", "江南大学", "河海大学", "中国矿业大学", "东南大学", "昆山杜克", "南京警察"],
  浙江: ["浙江", "杭州", "宁波", "温州", "嘉兴", "湖州", "绍兴", "台州", "丽水", "衢州", "中国美术", "浙江音乐", "浙江警察"],
  安徽: ["安徽", "合肥", "芜湖", "蚌埠", "淮南", "淮北", "安庆", "黄山", "滁州", "阜阳", "宿州", "皖西", "铜陵", "池州", "中国科学技术大学"],
  福建: ["福建", "福州", "厦门", "泉州", "莆田", "三明", "龙岩", "武夷", "闽江", "集美大学", "华侨大学"],
  江西: ["江西", "南昌", "景德镇", "赣南", "赣东", "井冈山", "九江", "宜春", "上饶", "萍乡", "新余", "华东交通", "东华理工"],
  山东: ["山东", "济南", "济宁", "青岛", "烟台", "潍坊", "临沂", "曲阜", "聊城", "德州", "滨州", "泰山", "菏泽", "枣庄", "鲁东", "齐鲁", "山东艺术", "中国海洋大学", "中国石油大学(华东)"],
  河南: ["河南", "郑州", "洛阳", "开封", "安阳", "新乡", "许昌", "南阳", "信阳", "商丘", "周口", "黄淮", "平顶山", "郑州警察", "中原工学院", "华北水利水电"],
  湖北: ["湖北", "武汉", "武昌", "黄冈", "荆楚", "荆州", "襄阳", "三峡大学", "长江大学", "江汉大学", "武汉音乐", "湖北美术", "华中科技", "华中师范", "华中农业", "中南民族"],
  湖南: ["湖南", "长沙", "湘潭", "衡阳", "邵阳", "怀化", "常德", "湘南", "南华大学", "吉首", "中南大学", "国防科技"],
  广东: ["广东", "广州", "深圳", "珠海", "汕头", "佛山", "东莞", "惠州", "韶关", "肇庆", "岭南师范", "华南理工", "华南农业", "华南师范", "南方科技", "南方医科", "暨南大学", "星海音乐", "广州美术"],
  海南: ["海南", "海口", "三亚", "琼台"],
  四川: ["四川", "成都", "绵阳", "内江", "乐山", "西华", "西昌", "川北", "西南交通", "西南财经", "西南科技", "西南石油", "西南民族", "西南医科", "电子科技大学"],
  贵州: ["贵州", "贵阳", "遵义", "黔南", "六盘水", "铜仁", "凯里", "安顺"],
  云南: ["云南", "昆明", "大理", "玉溪", "红河", "曲靖", "楚雄", "普洱", "丽江", "滇西", "西南林业"],
  陕西: ["陕西", "西安", "延安", "宝鸡", "咸阳", "渭南", "榆林", "商洛", "安康", "西北大学", "西北工业", "西北农林", "西北政法", "西京学院", "长安大学", "火箭军工程"],
  甘肃: ["甘肃", "兰州", "天水", "河西", "陇东", "西北民族", "西北师范"],
  青海: ["青海"],
  内蒙古: ["内蒙古", "呼和浩特", "包头", "赤峰", "通辽", "呼伦贝尔", "鄂尔多斯", "兴安职业", "河套学院", "集宁师范"],
  广西: ["广西", "桂林", "南宁", "柳州", "梧州", "贺州", "玉林", "北部湾", "右江", "百色", "广西艺术"],
  西藏: ["西藏"],
  宁夏: ["宁夏", "银川", "北方民族"],
  新疆: ["新疆", "石河子", "塔里木", "喀什", "伊犁", "昌吉", "新疆艺术"],
  香港: ["香港"],
  澳门: ["澳门"],
};

function normalize(text) {
  return String(text || "").trim().toLowerCase();
}

function toNumber(value) {
  const num = Number(String(value ?? "").replace(/[^\d.-]/g, ""));
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

function displayValue(value) {
  const text = String(value ?? "").trim();
  return text || missingValue;
}

function detectProvince(school) {
  const name = String(school || "").replace(/（.*?）|\(.*?\)/g, "");
  if (state.provinces[school]) return state.provinces[school];
  if (state.provinces[name]) return state.provinces[name];
  for (const province of provinces) {
    if (school.includes(province) || name.includes(province)) return province;
  }
  for (const [province, tokens] of Object.entries(provinceRules)) {
    if (tokens.some((token) => school.includes(token) || name.includes(token))) return province;
  }
  return "未匹配";
}

function currentDataset() {
  return state.datasets[state.batch] || { rows: [], categories: [], provinces: [], requirements: [] };
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`无法读取 ${url}`);
  return response.json();
}

async function ensureBatchLoaded(batch) {
  if (state.datasets[batch]) return;
  const config = batchConfig[batch];
  const [categories, schools, majors] = await Promise.all([
    fetchJson(config.categoryUrl),
    fetchJson(config.schoolUrl),
    fetchJson(config.majorUrl),
  ]);

  state.datasets[batch] = buildDataset(categories, schools, majors);
}

function buildDataset(categories, schools, majors) {
  const schoolsByPath = new Map(schools.map((row) => [row.path, row]));
  const rows = majors.map((major, index) => {
    const school = schoolsByPath.get(major.path) || {};
    const schoolName = displayValue(major.yxmc || school.yxmc);
    return {
      ...major,
      _id: `${major.path || "row"}-${major.zydh || index}-${index}`,
      yxdh: displayValue(major.yxdh || school.yxdh),
      yxmc: schoolName,
      klmc: displayValue(major.klmc || school.klmc),
      pcmc: displayValue(major.pcmc || school.pcmc),
      jhzyzdm: displayValue(major.jhzyzdm),
      zydh: displayValue(major.zydh),
      zymc: displayValue(major.zymc),
      jhxzmc: displayValue(major.jhxzmc),
      jhlbmc: displayValue(major.jhlbmc),
      xznx: displayValue(major.xznx),
      xf: displayValue(major.xf),
      wyyzmc: displayValue(major.wyyzmc),
      kycs: displayValue(major.kycs),
      kskmyqzw: displayValue(major.kskmyqzw),
      bz: displayValue(major.bz),
      bxdd: displayValue(major.bxdd),
      syjh: displayValue(major.syjh),
      province: detectProvince(schoolName),
    };
  });

  const categoryOrder = categories.map((item) => item.klmc).filter(Boolean);
  return {
    rows,
    categories: orderedUnique(categoryOrder, rows.map((row) => row.klmc)),
    provinces: sortedUnique(rows.map((row) => row.province)),
    requirements: sortedUnique(rows.map((row) => row.kskmyqzw)),
  };
}

function orderedUnique(primary, fallback) {
  const seen = new Set();
  return [...primary, ...fallback].filter((item) => {
    const value = displayValue(item);
    if (!value || seen.has(value)) return false;
    seen.add(value);
    return true;
  });
}

function sortedUnique(values) {
  return [...new Set(values.map(displayValue))]
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b, "zh-Hans-CN", { numeric: true }));
}

function fillSelect(select, values, allLabel) {
  const previous = select.value;
  select.innerHTML = [
    `<option value="">${escapeHtml(allLabel)}</option>`,
    ...values.map((value) => `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`),
  ].join("");
  select.value = values.includes(previous) ? previous : "";
}

function fillFilterOptions() {
  const dataset = currentDataset();
  fillSelect(els.categoryFilter, dataset.categories, "全部科类");
  fillSelect(els.provinceFilter, dataset.provinces, "全部省份");
  fillSelect(els.requirementFilter, dataset.requirements, "全部要求");
}

function getFilters() {
  return {
    category: els.categoryFilter.value,
    province: els.provinceFilter.value,
    requirement: els.requirementFilter.value,
    minPlan: els.minPlan.value === "" ? null : Number(els.minPlan.value),
    maxPlan: els.maxPlan.value === "" ? null : Number(els.maxPlan.value),
    majorQuery: normalize(els.majorQuery.value),
    schoolQuery: normalize(els.schoolQuery.value),
  };
}

function getFilteredRows() {
  const filters = getFilters();
  return currentDataset().rows.filter((row) => {
    const planCount = toNumber(row.syjh);
    return (!filters.category || row.klmc === filters.category)
      && (!filters.province || row.province === filters.province)
      && (!filters.requirement || row.kskmyqzw === filters.requirement)
      && (filters.minPlan === null || planCount >= filters.minPlan)
      && (filters.maxPlan === null || planCount <= filters.maxPlan)
      && (!filters.majorQuery || normalize(row.zymc).includes(filters.majorQuery))
      && (!filters.schoolQuery || normalize(`${row.yxmc} ${row.yxdh}`).includes(filters.schoolQuery));
  });
}

function sortRows(rows) {
  const direction = state.sortDir === "asc" ? 1 : -1;
  return [...rows].sort((a, b) => {
    const av = numberFields.has(state.sortKey) ? toNumber(a[state.sortKey]) : String(a[state.sortKey] || "");
    const bv = numberFields.has(state.sortKey) ? toNumber(b[state.sortKey]) : String(b[state.sortKey] || "");
    if (typeof av === "number" && typeof bv === "number") return (av - bv) * direction;
    return av.localeCompare(bv, "zh-Hans-CN", { numeric: true }) * direction;
  });
}

function render() {
  const rows = sortRows(getFilteredRows());
  const pageCount = Math.max(1, Math.ceil(rows.length / state.pageSize));
  if (state.page > pageCount) state.page = pageCount;

  const start = (state.page - 1) * state.pageSize;
  const visibleRows = rows.slice(start, start + state.pageSize);
  const batchLabel = batchConfig[state.batch].label;

  els.resultCount.textContent = `${rows.length} 条结果`;
  els.filterSummary.innerHTML = `${escapeHtml(batchLabel)}，每页 ${state.pageSize} 条，<a href="${batchConfig[state.batch].source}">查看原始来源</a>`;
  els.pageInfo.textContent = `第 ${state.page} / ${pageCount} 页`;
  els.prevPage.disabled = state.page <= 1;
  els.nextPage.disabled = state.page >= pageCount;

  if (!rows.length) {
    els.resultsBody.innerHTML = '<tr><td colspan="16" class="empty">没有匹配结果，试试放宽计划数或关键词。</td></tr>';
    return;
  }

  els.resultsBody.innerHTML = visibleRows.map(renderRow).join("");
}

function renderRow(row) {
  return `
    <tr>
      <td><div class="school">${highlight(row.yxmc, els.schoolQuery.value)}</div><div class="muted">${escapeHtml(row.yxdh)}</div></td>
      <td>${escapeHtml(row.province)}</td>
      <td><span class="tag">${escapeHtml(row.klmc)}</span></td>
      <td class="nowrap">${escapeHtml(row.jhzyzdm)}</td>
      <td class="nowrap">${escapeHtml(row.zydh)}</td>
      <td><div class="cell-strong">${highlight(row.zymc, els.majorQuery.value)}</div></td>
      <td>${escapeHtml(row.jhxzmc)}</td>
      <td>${escapeHtml(row.jhlbmc)}</td>
      <td class="nowrap">${escapeHtml(row.xznx)}</td>
      <td class="nowrap">${escapeHtml(row.xf)}</td>
      <td>${escapeHtml(row.wyyzmc)}</td>
      <td>${escapeHtml(row.kycs)}</td>
      <td>${escapeHtml(row.kskmyqzw)}</td>
      <td class="remarks">${escapeHtml(row.bz)}</td>
      <td>${escapeHtml(row.bxdd)}</td>
      <td class="score">${escapeHtml(row.syjh)}</td>
    </tr>`;
}

function setLoading() {
  els.resultCount.textContent = "加载中...";
  els.filterSummary.textContent = "正在读取本地招生计划数据";
  els.resultsBody.innerHTML = '<tr><td colspan="16" class="empty">正在加载数据...</td></tr>';
}

async function switchBatch(batch) {
  state.batch = batch;
  state.page = 1;
  setLoading();
  await ensureBatchLoaded(batch);
  els.batchButtons.forEach((button) => {
    const active = button.dataset.batch === batch;
    button.classList.toggle("active", active);
    button.setAttribute("aria-selected", String(active));
  });
  fillFilterOptions();
  render();
}

function bindEvents() {
  els.batchButtons.forEach((button) => {
    button.addEventListener("click", () => {
      switchBatch(button.dataset.batch).catch(showLoadError);
    });
  });

  [els.categoryFilter, els.provinceFilter, els.requirementFilter, els.minPlan, els.maxPlan, els.majorQuery, els.schoolQuery].forEach((control) => {
    control.addEventListener("input", () => {
      state.page = 1;
      render();
    });
  });

  els.resetFilters.addEventListener("click", () => {
    els.categoryFilter.value = "";
    els.provinceFilter.value = "";
    els.requirementFilter.value = "";
    els.minPlan.value = "";
    els.maxPlan.value = "";
    els.majorQuery.value = "";
    els.schoolQuery.value = "";
    state.page = 1;
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
      state.page = 1;
      render();
    });
  });

  els.prevPage.addEventListener("click", () => {
    if (state.page <= 1) return;
    state.page -= 1;
    render();
  });

  els.nextPage.addEventListener("click", () => {
    state.page += 1;
    render();
  });
}

function showLoadError(error) {
  console.error(error);
  els.resultCount.textContent = "加载失败";
  els.filterSummary.textContent = "请通过本地服务器打开页面，例如 node scripts\\serve-static.js。";
  els.pageInfo.textContent = "第 1 页";
  els.prevPage.disabled = true;
  els.nextPage.disabled = true;
  els.resultsBody.innerHTML = '<tr><td colspan="16" class="empty">无法读取 data/2026-plans 目录中的 JSON 文件。</td></tr>';
}

bindEvents();
fetchJson("data/school-provinces.json")
  .then((provinces) => {
    state.provinces = provinces;
    return switchBatch(state.batch);
  })
  .catch(showLoadError);
