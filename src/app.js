const data = window.COURSE_DATA || { courses: [], meta: {} };

const DAY_LABELS = ["星期一", "星期二", "星期三", "星期四", "星期五", "星期六", "星期日"];
const PERIODS = [
  "08:00-08:45",
  "08:55-09:40",
  "10:10-10:55",
  "11:05-11:50",
  "13:30-14:15",
  "14:25-15:10",
  "15:30-16:15",
  "16:25-17:10",
  "18:30-19:15",
  "19:20-20:05",
  "20:15-21:00",
  "21:10-21:55",
  "22:00-22:45",
];
const BLOCK_COLORS = ["#0f766e", "#315f8c", "#836a1f", "#7a4f96", "#b15d3a", "#3d7864", "#5d6f32"];
const STYLE_STORAGE_KEY = "classScheduleHelper.courseStyles.v2";
const LEGACY_COLOR_STORAGE_KEY = "classScheduleHelper.courseColors.v1";
const COURSE_TYPES = [
  { id: "auto", label: "自动", color: "" },
  { id: "required", label: "必修", color: "#008060" },
  { id: "elective", label: "选修", color: "#0057d9" },
  { id: "audit", label: "旁听", color: "#8b3ff2" },
  { id: "backup", label: "备选", color: "#ffcc00", textColor: "#17231f" },
];
const EXCLUSION_PATTERNS = [
  { id: "none", label: "无互斥", shortLabel: "无", pattern: "none", size: "auto" },
  {
    id: "pair-a",
    label: "互斥A 斜线",
    shortLabel: "互斥A",
    pattern: "repeating-linear-gradient(135deg, var(--block-pattern-ink) 0 4px, transparent 4px 10px)",
    size: "auto",
  },
  {
    id: "pair-b",
    label: "互斥B 横线",
    shortLabel: "互斥B",
    pattern: "repeating-linear-gradient(0deg, var(--block-pattern-ink) 0 3px, transparent 3px 9px)",
    size: "auto",
  },
  {
    id: "pair-c",
    label: "互斥C 网格",
    shortLabel: "互斥C",
    pattern: "linear-gradient(90deg, var(--block-pattern-ink) 1px, transparent 1px), linear-gradient(0deg, var(--block-pattern-ink) 1px, transparent 1px)",
    size: "10px 10px",
  },
  {
    id: "pair-d",
    label: "互斥D 点纹",
    shortLabel: "互斥D",
    pattern: "radial-gradient(circle at 2px 2px, var(--block-pattern-ink) 0 1.6px, transparent 1.9px)",
    size: "8px 8px",
  },
  {
    id: "pair-e",
    label: "互斥E 棋盘",
    shortLabel: "互斥E",
    pattern: "conic-gradient(from 90deg, var(--block-pattern-ink) 0 25%, transparent 0 50%, var(--block-pattern-ink) 0 75%, transparent 0)",
    size: "12px 12px",
  },
];
const LEGACY_COLOR_MAP = {
  "#0f766e": { type: "required" },
  "#047857": { type: "required" },
  "#008060": { type: "required" },
  "#315f8c": { type: "elective" },
  "#2563eb": { type: "elective" },
  "#0057d9": { type: "elective" },
  "#836a1f": { type: "audit" },
  "#a16207": { type: "audit" },
  "#6b7280": { type: "audit" },
  "#8b3ff2": { type: "audit" },
  "#7a4f96": { type: "backup" },
  "#7c3aed": { type: "backup" },
  "#ffd23f": { type: "backup" },
  "#ffcc00": { type: "backup" },
  "#c43d32": { pattern: "pair-a" },
  "#dc2626": { pattern: "pair-a" },
  "#d00000": { pattern: "pair-a" },
  "#b15d3a": { pattern: "pair-b" },
  "#be185d": { pattern: "pair-b" },
  "#c6007e": { pattern: "pair-b" },
  "#ea580c": { pattern: "pair-c" },
  "#ff6b00": { pattern: "pair-c" },
  "#0891b2": { pattern: "pair-d" },
  "#00a6d6": { pattern: "pair-d" },
  "#334155": { pattern: "pair-e" },
  "#111827": { pattern: "pair-e" },
};
const LEGACY_PATTERN_ALIASES = {
  "exclusive-a": "pair-a",
  "exclusive-b": "pair-b",
  "exclusive-c": "pair-c",
  "exclusive-d": "pair-d",
  "exclusive-e": "pair-e",
  "mutex-a": "pair-a",
  "mutex-b": "pair-b",
  "mutex-c": "pair-c",
  "mutex-d": "pair-d",
  "mutex-e": "pair-e",
};

function normalizeCourseStyle(style = {}) {
  const type = COURSE_TYPES.some((item) => item.id === style.type) ? style.type : "auto";
  const patternId = LEGACY_PATTERN_ALIASES[style.pattern] || style.pattern;
  const pattern = EXCLUSION_PATTERNS.some((item) => item.id === patternId) ? patternId : "none";
  return { type, pattern };
}

function loadCourseStyles() {
  try {
    const saved = JSON.parse(localStorage.getItem(STYLE_STORAGE_KEY) || "{}");
    if (saved && Object.keys(saved).length) {
      return Object.fromEntries(Object.entries(saved).map(([courseId, style]) => [courseId, normalizeCourseStyle(style)]));
    }
    const legacyColors = JSON.parse(localStorage.getItem(LEGACY_COLOR_STORAGE_KEY) || "{}");
    return Object.fromEntries(Object.entries(legacyColors).map(([courseId, color]) => [courseId, normalizeCourseStyle(LEGACY_COLOR_MAP[color])]));
  } catch {
    return {};
  }
}

const state = {
  selected: new Set(),
  activeId: "",
  courseStyles: loadCourseStyles(),
  filters: {
    search: "",
    category: "",
    department: "",
    day: "",
    teachingClass: "",
    seats: "",
  },
};

const courseById = new Map(data.courses.map((course) => [course.id, course]));

const el = {
  dataStatus: document.querySelector("#dataStatus"),
  searchInput: document.querySelector("#searchInput"),
  categoryFilter: document.querySelector("#categoryFilter"),
  departmentFilter: document.querySelector("#departmentFilter"),
  dayFilter: document.querySelector("#dayFilter"),
  classFilter: document.querySelector("#classFilter"),
  seatFilter: document.querySelector("#seatFilter"),
  resetFilters: document.querySelector("#resetFilters"),
  exportSchedule: document.querySelector("#exportSchedule"),
  clearSelection: document.querySelector("#clearSelection"),
  visibleCount: document.querySelector("#visibleCount"),
  selectedCount: document.querySelector("#selectedCount"),
  scheduleSummary: document.querySelector("#scheduleSummary"),
  creditTotal: document.querySelector("#creditTotal"),
  scheduleGrid: document.querySelector("#scheduleGrid"),
  catalogStats: document.querySelector("#catalogStats"),
  courseTable: document.querySelector("#courseTable"),
  conflictBadge: document.querySelector("#conflictBadge"),
  summaryCourses: document.querySelector("#summaryCourses"),
  summaryCredits: document.querySelector("#summaryCredits"),
  summaryConflicts: document.querySelector("#summaryConflicts"),
  conflictList: document.querySelector("#conflictList"),
  selectedList: document.querySelector("#selectedList"),
  detailContent: document.querySelector("#detailContent"),
};

function formatCredits(value) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function sectionText(section) {
  if (!section || !section.parsed) return section?.raw || "时间待确认";
  return `${section.weekday} ${section.startPeriod}-${section.endPeriod} [${section.weekStart}-${section.weekEnd}] ${section.location}`;
}

function courseTimeText(course) {
  return course.sections.length ? course.sections.map(sectionText).join("；") : "时间待确认";
}

function courseTeacher(course) {
  return course.teacher || course.sections.find((section) => section.teacher)?.teacher || "待公布";
}

function courseClassText(course) {
  return course.teachingClass || "未注明教学班";
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function saveCourseStyles() {
  localStorage.setItem(STYLE_STORAGE_KEY, JSON.stringify(state.courseStyles));
}

function getStoredCourseStyle(courseId) {
  return normalizeCourseStyle(state.courseStyles[courseId]);
}

function getCourseStyle(course) {
  return getStoredCourseStyle(course.id);
}

function getCourseTypeMarker(course) {
  const style = getCourseStyle(course);
  return COURSE_TYPES.find((marker) => marker.id === style.type) || COURSE_TYPES[0];
}

function getCoursePatternMarker(course) {
  const style = getCourseStyle(course);
  return EXCLUSION_PATTERNS.find((marker) => marker.id === style.pattern) || EXCLUSION_PATTERNS[0];
}

function getCourseColor(course, index = 0) {
  const marker = getCourseTypeMarker(course);
  return marker.color || BLOCK_COLORS[index % BLOCK_COLORS.length];
}

function getCourseTextColor(course) {
  return getCourseTypeMarker(course).textColor || "#ffffff";
}

function getTypeLabel(course) {
  return getCourseTypeMarker(course).label;
}

function getPatternLabel(course) {
  return getCoursePatternMarker(course).shortLabel;
}

function getPatternInk(course) {
  return getCourseTextColor(course) === "#17231f" ? "rgba(23, 35, 31, 0.28)" : "rgba(255, 255, 255, 0.36)";
}

function getStyleSummary(course) {
  const pattern = getCoursePatternMarker(course);
  return pattern.id === "none" ? getTypeLabel(course) : `${getTypeLabel(course)} · ${pattern.shortLabel}`;
}

function persistCourseStyle(courseId, nextStyle) {
  const style = normalizeCourseStyle(nextStyle);
  if (style.type === "auto" && style.pattern === "none") {
    delete state.courseStyles[courseId];
  } else {
    state.courseStyles[courseId] = style;
  }
  saveCourseStyles();
  render();
}

function setCourseType(courseId, type) {
  persistCourseStyle(courseId, { ...getStoredCourseStyle(courseId), type });
}

function setCoursePattern(courseId, pattern) {
  persistCourseStyle(courseId, { ...getStoredCourseStyle(courseId), pattern });
}

function populateSelect(select, values, allLabel = "全部") {
  select.innerHTML = "";
  const all = document.createElement("option");
  all.value = "";
  all.textContent = allLabel;
  select.appendChild(all);
  values.forEach((value) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    select.appendChild(option);
  });
}

function courseMatches(course) {
  const keyword = state.filters.search.trim().toLowerCase();
  if (keyword) {
    const haystack = [
      course.courseNo,
      course.code,
      course.name,
      course.category,
      course.department,
      courseTeacher(course),
      course.arrangement,
      course.teachingClass,
      course.teacherDepartment,
      ...course.sections.map((section) => section.location),
    ]
      .join(" ")
      .toLowerCase();
    if (!haystack.includes(keyword)) return false;
  }

  if (state.filters.category && course.category !== state.filters.category) return false;
  if (state.filters.department && course.department !== state.filters.department) return false;
  if (state.filters.day && !course.sections.some((section) => section.weekday === state.filters.day)) return false;
  if (state.filters.teachingClass && !courseClassText(course).toLowerCase().includes(state.filters.teachingClass.toLowerCase())) return false;
  if (state.filters.seats === "available" && course.seatsLeft <= 0) return false;
  if (state.filters.seats === "full" && course.seatsLeft > 0) return false;
  return true;
}

function weeksOverlap(a, b) {
  return Math.max(a.weekStart, b.weekStart) <= Math.min(a.weekEnd, b.weekEnd);
}

function periodsOverlap(a, b) {
  return Math.max(a.startPeriod, b.startPeriod) <= Math.min(a.endPeriod, b.endPeriod);
}

function computeConflicts(selectedCourses) {
  const conflicts = [];
  const conflictCourseIds = new Set();
  const conflictSectionKeys = new Set();

  for (let i = 0; i < selectedCourses.length; i += 1) {
    for (let j = i + 1; j < selectedCourses.length; j += 1) {
      const a = selectedCourses[i];
      const b = selectedCourses[j];
      for (const sectionA of a.sections.filter((section) => section.parsed)) {
        for (const sectionB of b.sections.filter((section) => section.parsed)) {
          const hasConflict =
            sectionA.weekday === sectionB.weekday &&
            periodsOverlap(sectionA, sectionB) &&
            weeksOverlap(sectionA, sectionB);
          if (!hasConflict) continue;

          conflicts.push({
            a,
            b,
            sectionA,
            sectionB,
            weekday: sectionA.weekday,
            startPeriod: Math.max(sectionA.startPeriod, sectionB.startPeriod),
            endPeriod: Math.min(sectionA.endPeriod, sectionB.endPeriod),
            weekStart: Math.max(sectionA.weekStart, sectionB.weekStart),
            weekEnd: Math.min(sectionA.weekEnd, sectionB.weekEnd),
          });
          conflictCourseIds.add(a.id);
          conflictCourseIds.add(b.id);
          conflictSectionKeys.add(`${a.id}:${sectionA.id}`);
          conflictSectionKeys.add(`${b.id}:${sectionB.id}`);
        }
      }
    }
  }

  return { conflicts, conflictCourseIds, conflictSectionKeys };
}

function selectedCourses() {
  return [...state.selected].map((id) => courseById.get(id)).filter(Boolean);
}

function buildScheduleBase() {
  el.scheduleGrid.innerHTML = "";
  const corner = document.createElement("div");
  corner.className = "corner-cell";
  el.scheduleGrid.appendChild(corner);

  DAY_LABELS.forEach((day, index) => {
    const header = document.createElement("div");
    header.className = "day-header";
    header.style.gridColumn = `${index + 2}`;
    header.style.gridRow = "1";
    header.textContent = day.replace("星期", "周");
    el.scheduleGrid.appendChild(header);
  });

  PERIODS.forEach((time, index) => {
    const period = index + 1;
    const label = document.createElement("div");
    label.className = "period-label";
    label.style.gridRow = `${period + 1}`;
    label.innerHTML = `<strong>第 ${period} 节</strong><span>${time}</span>`;
    el.scheduleGrid.appendChild(label);

    DAY_LABELS.forEach((_, dayIndex) => {
      const cell = document.createElement("div");
      cell.className = "grid-cell";
      cell.style.gridColumn = `${dayIndex + 2}`;
      cell.style.gridRow = `${period + 1}`;
      el.scheduleGrid.appendChild(cell);
    });
  });
}

function renderSchedule(courses, conflictSectionKeys) {
  buildScheduleBase();
  const slotCounts = new Map();

  courses.forEach((course, courseIndex) => {
    course.sections
      .filter((section) => section.parsed)
      .forEach((section) => {
        const key = `${section.dayOrder}-${section.startPeriod}-${section.endPeriod}`;
        const stackIndex = slotCounts.get(key) || 0;
        slotCounts.set(key, stackIndex + 1);

        const block = document.createElement("div");
        const conflictKey = `${course.id}:${section.id}`;
        block.className = `course-block stack-${Math.min(stackIndex, 2)}${conflictSectionKeys.has(conflictKey) ? " conflict" : ""}`;
        block.style.gridColumn = `${section.dayOrder + 1}`;
        block.style.gridRow = `${section.startPeriod + 1} / span ${section.endPeriod - section.startPeriod + 1}`;
        const pattern = getCoursePatternMarker(course);
        block.style.setProperty("--block-color", getCourseColor(course, courseIndex));
        block.style.setProperty("--block-text-color", getCourseTextColor(course));
        block.style.setProperty("--block-pattern", pattern.pattern);
        block.style.setProperty("--block-pattern-size", pattern.size);
        block.style.setProperty("--block-pattern-ink", getPatternInk(course));
        block.innerHTML = `
          <button type="button" data-detail-id="${course.id}">
            <span class="block-title">${course.name}</span>
            <span class="block-meta">${courseTeacher(course)} · ${section.weekStart}-${section.weekEnd}周</span>
            <span class="block-room">${section.location || "地点待确认"}</span>
          </button>
        `;
        el.scheduleGrid.appendChild(block);
      });
  });
}

function renderCatalog(courses) {
  el.courseTable.innerHTML = "";
  courses.forEach((course) => {
    const isSelected = state.selected.has(course.id);
    const tr = document.createElement("tr");
    tr.className = state.activeId === course.id ? "active" : "";
    tr.dataset.detailId = course.id;
    tr.innerHTML = `
      <td>
        <button class="row-action ${isSelected ? "selected" : ""}" type="button" data-toggle-id="${course.id}">
          ${isSelected ? "移除" : "加入"}
        </button>
      </td>
      <td>${course.courseNo || "-"}</td>
      <td>
        <div class="course-name">${course.name || "-"}</div>
        <div class="muted">${course.category || "未分类"} · ${course.department || "未知院系"}</div>
      </td>
      <td class="class-cell">${courseClassText(course)}</td>
      <td>${courseTeacher(course)}</td>
      <td>${courseTimeText(course)}</td>
      <td>
        <span class="seat-tag ${course.seatsLeft <= 0 ? "full" : ""}">
          ${course.current}/${course.limit || "-"}
        </span>
      </td>
      <td>${formatCredits(course.credits)}</td>
    `;
    el.courseTable.appendChild(tr);
  });
}

function renderConflicts(conflicts) {
  el.conflictList.innerHTML = "";
  if (!conflicts.length) {
    el.conflictList.innerHTML = '<div class="empty-state">无时间冲突</div>';
    return;
  }

  conflicts.forEach((conflict) => {
    const item = document.createElement("div");
    item.className = "message-item";
    item.textContent = `${conflict.a.name} 与 ${conflict.b.name}：${conflict.weekday} 第 ${conflict.startPeriod}-${conflict.endPeriod} 节，第 ${conflict.weekStart}-${conflict.weekEnd} 周重叠`;
    el.conflictList.appendChild(item);
  });
}

function renderSelectedList(courses) {
  el.selectedList.innerHTML = "";
  if (!courses.length) {
    el.selectedList.innerHTML = '<div class="empty-state">暂无已选课程</div>';
    return;
  }

  courses.forEach((course, courseIndex) => {
    const color = getCourseColor(course, courseIndex);
    const style = getCourseStyle(course);
    const pattern = getCoursePatternMarker(course);
    const patternInk = getPatternInk(course);
    const item = document.createElement("div");
    item.className = "selected-item";
    item.style.setProperty("--selected-color", color);
    item.style.setProperty("--selected-pattern", pattern.pattern);
    item.style.setProperty("--selected-pattern-size", pattern.size);
    item.style.setProperty("--block-pattern-ink", patternInk);
    item.innerHTML = `
      <div>
        <div class="selected-title-row">
          <span class="selected-color-dot" aria-hidden="true"></span>
          <strong>${course.name}</strong>
        </div>
        <span>${courseTeacher(course)} · ${formatCredits(course.credits)} 学分 · ${getStyleSummary(course)}</span>
      </div>
      <button class="remove-button" type="button" data-toggle-id="${course.id}" aria-label="移除 ${course.name}">×</button>
      <div class="style-picker" role="group" aria-label="${course.name} 课程类型">
        <span class="picker-label">类型</span>
        ${COURSE_TYPES.map((marker) => {
          const isActive = style.type === marker.id;
          const swatchColor = marker.color || color;
          return `
            <button
              class="style-chip type-chip ${isActive ? "active" : ""} ${marker.id === "auto" ? "auto" : ""}"
              type="button"
              title="${marker.label}"
              aria-label="${course.name} 类型标记为${marker.label}"
              data-type-course-id="${course.id}"
              data-type-value="${marker.id}"
              style="--swatch-color:${swatchColor};"
            >
              <span aria-hidden="true"></span>
              ${marker.label}
            </button>
          `;
        }).join("")}
      </div>
      <div class="style-picker pattern-picker" role="group" aria-label="${course.name} 互斥纹理">
        <span class="picker-label">互斥</span>
        ${EXCLUSION_PATTERNS.map((marker) => {
          const isActive = style.pattern === marker.id;
          return `
            <button
              class="style-chip pattern-chip ${isActive ? "active" : ""} ${marker.id === "none" ? "none" : ""}"
              type="button"
              title="${marker.label}"
              aria-label="${course.name} 设置为${marker.label}"
              data-pattern-course-id="${course.id}"
              data-pattern-value="${marker.id}"
              style="--swatch-color:${color};--swatch-pattern:${marker.pattern};--swatch-pattern-size:${marker.size};--block-pattern-ink:${patternInk};"
            >
              <span aria-hidden="true"></span>
              ${marker.shortLabel}
            </button>
          `;
        }).join("")}
      </div>
    `;
    item.addEventListener("click", (event) => {
      if (event.target.closest("button")) return;
      state.activeId = course.id;
      render();
    });
    el.selectedList.appendChild(item);
  });
}

function renderDetail(course) {
  if (!course) {
    el.detailContent.innerHTML = '<div class="empty-state">未选择课程</div>';
    return;
  }

  const rows = [
    ["课程序号", course.courseNo || "-"],
    ["课程代码", course.code || "-"],
    ["课程类别", course.category || "-"],
    ["开课院系", course.department || "-"],
    ["教师", courseTeacher(course)],
    ["教师部门", course.teacherDepartment || "-"],
    ["时间地点", courseTimeText(course)],
    ["教学班", course.teachingClass || "-"],
    ["人数", `${course.current}/${course.limit || "-"}，余量 ${course.seatsLeft}`],
    ["学分学时", `${formatCredits(course.credits)} 学分，${course.hours || "-"} 学时`],
    ["周次", course.startWeek && course.weekCount ? `第 ${course.startWeek} 周起，共 ${course.weekCount} 周` : "-"],
  ];

  el.detailContent.innerHTML = `
    <h4 class="detail-title">${course.name}</h4>
    ${rows.map(([label, value]) => `<div class="detail-row"><span>${label}</span><span>${value}</span></div>`).join("")}
  `;
}

function renderSummary(courses, conflicts) {
  const totalCredits = courses.reduce((sum, course) => sum + Number(course.credits || 0), 0);
  const files = data.meta?.sourceFiles || [];
  const source = files.length > 1 ? `${files.length} 个导出文件` : files[0] || "本地数据";
  const deduped = data.meta?.dedupedCount ? ` · 已去重 ${data.meta.dedupedCount} 条` : "";
  el.dataStatus.textContent = `${source} · ${data.meta?.courseCount || data.courses.length} 个教学班 · ${data.meta?.sectionCount || 0} 段时间${deduped}`;
  el.selectedCount.textContent = String(courses.length);
  el.summaryCourses.textContent = String(courses.length);
  el.summaryCredits.textContent = formatCredits(totalCredits);
  el.creditTotal.textContent = formatCredits(totalCredits);
  el.summaryConflicts.textContent = String(conflicts.length);
  el.scheduleSummary.textContent = courses.length ? `${courses.length} 个教学班已放入课表` : "未选择课程";

  el.conflictBadge.textContent = conflicts.length ? `${conflicts.length} 个冲突` : "无冲突";
  el.conflictBadge.className = `status-badge ${conflicts.length ? "warn" : "ok"}`;
  el.exportSchedule.disabled = courses.length === 0;
}

function buildExportGrid(courses, conflictSectionKeys) {
  const cells = Array.from({ length: PERIODS.length + 1 }, () => Array.from({ length: DAY_LABELS.length + 1 }, () => []));

  courses.forEach((course, courseIndex) => {
    course.sections
      .filter((section) => section.parsed)
      .forEach((section) => {
        for (let period = section.startPeriod; period <= section.endPeriod; period += 1) {
          if (!cells[period]?.[section.dayOrder]) continue;
          cells[period][section.dayOrder].push({
            course,
            section,
            color: getCourseColor(course, courseIndex),
            textColor: getCourseTextColor(course),
            pattern: getCoursePatternMarker(course).pattern,
            patternSize: getCoursePatternMarker(course).size,
            patternInk: getPatternInk(course),
            conflict: conflictSectionKeys.has(`${course.id}:${section.id}`),
          });
        }
      });
  });

  return cells;
}

function exportScheduleHtml(courses, conflicts, conflictSectionKeys) {
  const totalCredits = courses.reduce((sum, course) => sum + Number(course.credits || 0), 0);
  const cells = buildExportGrid(courses, conflictSectionKeys);
  const now = new Date();
  const dateText = now.toLocaleString("zh-CN", { hour12: false });

  const rows = PERIODS.map((time, periodIndex) => {
    const period = periodIndex + 1;
    const dayCells = DAY_LABELS.map((day, dayIndex) => {
      const blocks = cells[period][dayIndex + 1];
      if (!blocks.length) return "<td></td>";
      return `
        <td>
          ${blocks
            .map(
              ({ course, section, color, textColor, pattern, patternSize, patternInk, conflict }) => `
            <div class="course-block ${conflict ? "conflict" : ""}" style="--block-color:${color};--block-text-color:${textColor};--block-pattern:${pattern};--block-pattern-size:${patternSize};--block-pattern-ink:${patternInk};">
              <strong>${escapeHtml(course.name)}</strong>
              <span>${escapeHtml(courseTeacher(course))} · ${escapeHtml(section.weekday)} ${escapeHtml(section.startPeriod)}-${escapeHtml(section.endPeriod)} · ${escapeHtml(section.weekStart)}-${escapeHtml(section.weekEnd)}周</span>
              <span>${escapeHtml(section.location || "地点待确认")}</span>
              <small>${escapeHtml(course.courseNo || "-")} · ${escapeHtml(formatCredits(course.credits))} 学分</small>
            </div>
          `,
            )
            .join("")}
        </td>
      `;
    }).join("");

    return `
      <tr>
        <th><strong>第 ${period} 节</strong><span>${escapeHtml(time)}</span></th>
        ${dayCells}
      </tr>
    `;
  }).join("");

  const selectedRows = courses
    .map(
      (course) => `
        <tr>
          <td>${escapeHtml(course.courseNo || "-")}</td>
          <td>${escapeHtml(course.name)}</td>
          <td>${escapeHtml(getTypeLabel(course))}</td>
          <td>${escapeHtml(getPatternLabel(course))}</td>
          <td>${escapeHtml(courseTeacher(course))}</td>
          <td>${escapeHtml(courseTimeText(course))}</td>
          <td>${escapeHtml(courseClassText(course))}</td>
          <td>${escapeHtml(formatCredits(course.credits))}</td>
        </tr>
      `,
    )
    .join("");

  const conflictItems = conflicts.length
    ? conflicts
        .map(
          (conflict) => `
            <li>${escapeHtml(conflict.a.name)} 与 ${escapeHtml(conflict.b.name)}：${escapeHtml(conflict.weekday)} 第 ${escapeHtml(conflict.startPeriod)}-${escapeHtml(conflict.endPeriod)} 节，第 ${escapeHtml(conflict.weekStart)}-${escapeHtml(conflict.weekEnd)} 周重叠</li>
          `,
        )
        .join("")
    : "<li>无时间冲突</li>";

  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <title>选课课表</title>
  <style>
    :root { color-scheme: light; --line:#d9e4df; --text:#17231f; --muted:#60716b; --danger:#c43d32; }
    * { box-sizing: border-box; }
    body { margin: 24px; color: var(--text); font-family: "Microsoft YaHei UI", "Microsoft YaHei", "PingFang SC", "Segoe UI", sans-serif; background: #f7f9f8; }
    header { display: flex; justify-content: space-between; gap: 16px; align-items: flex-end; margin-bottom: 18px; }
    h1 { margin: 0 0 8px; font-size: 26px; }
    p { margin: 0; color: var(--muted); font-size: 13px; }
    .stats { display: flex; gap: 10px; }
    .stat { min-width: 92px; padding: 10px 12px; border: 1px solid var(--line); border-radius: 8px; background: #fff; text-align: center; }
    .stat strong { display: block; font-size: 20px; color: #0a5f59; }
    section { margin-top: 18px; padding: 16px; border: 1px solid var(--line); border-radius: 8px; background: #fff; }
    h2 { margin: 0 0 12px; font-size: 18px; }
    table { width: 100%; border-collapse: collapse; table-layout: fixed; }
    th, td { border: 1px solid var(--line); padding: 8px; vertical-align: top; }
    thead th { background: #eef7f4; font-size: 13px; }
    tbody th { width: 82px; background: #fbfcfc; text-align: left; }
    tbody th strong, tbody th span { display: block; }
    tbody th span { margin-top: 4px; color: var(--muted); font-size: 11px; font-weight: 400; }
    .course-block { min-height: 62px; padding: 8px; border-radius: 8px; color: var(--block-text-color, #fff); background-color: var(--block-color); background-image: var(--block-pattern, none); background-size: var(--block-pattern-size, auto); background-repeat: repeat; box-shadow: inset 0 0 0 1px rgba(255,255,255,.28); }
    .course-block.conflict { outline: 3px solid var(--danger); box-shadow: 0 0 0 1px #fff inset; }
    .course-block strong, .course-block span, .course-block small { display: block; line-height: 1.35; }
    .course-block strong { font-size: 13px; }
    .course-block span, .course-block small { font-size: 11px; opacity: .94; }
    .plain-table { table-layout: auto; }
    .plain-table th { background: #eef7f4; text-align: left; }
    .plain-table td { font-size: 13px; }
    .conflicts li { margin: 6px 0; color: ${conflicts.length ? "var(--danger)" : "var(--muted)"}; }
    @media print {
      body { margin: 10mm; background: #fff; }
      section { break-inside: avoid; box-shadow: none; }
      .course-block { color: #111; background-color: #eef7f4 !important; background-image: var(--block-pattern, none) !important; border: 1px solid #9bbdb3; }
      .course-block.conflict { border-color: var(--danger); }
    }
  </style>
</head>
<body>
  <header>
    <div>
      <h1>选课课表</h1>
      <p>导出时间：${escapeHtml(dateText)} · 数据来源：${escapeHtml(data.meta?.sourceFiles?.length ? `${data.meta.sourceFiles.length} 个导出文件` : "本地导入数据")}</p>
    </div>
    <div class="stats">
      <div class="stat"><strong>${escapeHtml(courses.length)}</strong><span>课程</span></div>
      <div class="stat"><strong>${escapeHtml(formatCredits(totalCredits))}</strong><span>学分</span></div>
      <div class="stat"><strong>${escapeHtml(conflicts.length)}</strong><span>冲突</span></div>
    </div>
  </header>
  <section>
    <h2>周课表</h2>
    <table>
      <thead>
        <tr><th>节次</th>${DAY_LABELS.map((day) => `<th>${escapeHtml(day.replace("星期", "周"))}</th>`).join("")}</tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  </section>
  <section class="conflicts">
    <h2>冲突提醒</h2>
    <ul>${conflictItems}</ul>
  </section>
  <section>
    <h2>已选课程明细</h2>
    <table class="plain-table">
      <thead><tr><th>课程序号</th><th>课程</th><th>类型</th><th>互斥纹理</th><th>教师</th><th>时间地点</th><th>教学班</th><th>学分</th></tr></thead>
      <tbody>${selectedRows}</tbody>
    </table>
  </section>
</body>
</html>`;
}

function exportSchedule() {
  const courses = selectedCourses();
  if (!courses.length) return;
  const { conflicts, conflictSectionKeys } = computeConflicts(courses);
  const html = exportScheduleHtml(courses, conflicts, conflictSectionKeys);
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const stamp = new Date().toISOString().slice(0, 10);
  link.href = url;
  link.download = `选课课表-${stamp}.html`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function render() {
  const visibleCourses = data.courses.filter(courseMatches);
  const selected = selectedCourses();
  const { conflicts, conflictSectionKeys } = computeConflicts(selected);
  const active = courseById.get(state.activeId) || visibleCourses[0] || selected[0] || null;
  if (active) state.activeId = active.id;

  el.visibleCount.textContent = String(visibleCourses.length);
  el.catalogStats.textContent = `${visibleCourses.length} 条`;
  renderSummary(selected, conflicts);
  renderSchedule(selected, conflictSectionKeys);
  renderCatalog(visibleCourses);
  renderConflicts(conflicts);
  renderSelectedList(selected);
  renderDetail(active);
}

function toggleCourse(id) {
  if (state.selected.has(id)) {
    state.selected.delete(id);
  } else {
    state.selected.add(id);
    state.activeId = id;
  }
  render();
}

function seedDemoSelection() {
  const demoIds = ["course-0010", "course-0050", "course-0247", "course-1234"];
  demoIds.forEach((id) => {
    if (courseById.has(id)) state.selected.add(id);
  });
  state.activeId = demoIds.find((id) => courseById.has(id)) || data.courses[0]?.id || "";
}

function bindEvents() {
  el.searchInput.addEventListener("input", (event) => {
    state.filters.search = event.target.value;
    render();
  });
  el.categoryFilter.addEventListener("change", (event) => {
    state.filters.category = event.target.value;
    render();
  });
  el.departmentFilter.addEventListener("change", (event) => {
    state.filters.department = event.target.value;
    render();
  });
  el.dayFilter.addEventListener("change", (event) => {
    state.filters.day = event.target.value;
    render();
  });
  el.classFilter.addEventListener("input", (event) => {
    state.filters.teachingClass = event.target.value.trim();
    render();
  });
  el.seatFilter.addEventListener("change", (event) => {
    state.filters.seats = event.target.value;
    render();
  });
  el.resetFilters.addEventListener("click", () => {
    state.filters = { search: "", category: "", department: "", day: "", teachingClass: "", seats: "" };
    el.searchInput.value = "";
    el.categoryFilter.value = "";
    el.departmentFilter.value = "";
    el.dayFilter.value = "";
    el.classFilter.value = "";
    el.seatFilter.value = "";
    render();
  });
  el.clearSelection.addEventListener("click", () => {
    state.selected.clear();
    render();
  });
  el.exportSchedule.addEventListener("click", exportSchedule);
  document.addEventListener("click", (event) => {
    const typeChip = event.target.closest("[data-type-course-id]");
    if (typeChip) {
      setCourseType(typeChip.dataset.typeCourseId, typeChip.dataset.typeValue);
      return;
    }
    const patternChip = event.target.closest("[data-pattern-course-id]");
    if (patternChip) {
      setCoursePattern(patternChip.dataset.patternCourseId, patternChip.dataset.patternValue);
      return;
    }
    const toggle = event.target.closest("[data-toggle-id]");
    if (toggle) {
      toggleCourse(toggle.dataset.toggleId);
      return;
    }
    const detail = event.target.closest("[data-detail-id]");
    if (detail) {
      state.activeId = detail.dataset.detailId;
      render();
    }
  });
}

function init() {
  populateSelect(el.categoryFilter, data.meta?.categories || []);
  populateSelect(el.departmentFilter, data.meta?.departments || []);
  seedDemoSelection();
  bindEvents();
  render();
}

init();
