from __future__ import annotations

import json
import re
import sys
from hashlib import sha1
from datetime import datetime
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
LOCAL_DEPS = ROOT / ".codex_deps" / "python"
if LOCAL_DEPS.exists():
    sys.path.insert(0, str(LOCAL_DEPS))

import pandas as pd


RAW_DIR = ROOT / "data" / "raw"
OUTPUT_FILE = ROOT / "src" / "data.js"

DAY_ORDER = {
    "星期一": 1,
    "星期二": 2,
    "星期三": 3,
    "星期四": 4,
    "星期五": 5,
    "星期六": 6,
    "星期日": 7,
    "星期天": 7,
}

SECTION_RE = re.compile(
    r"^(?P<prefix>.*?)\s*"
    r"(?P<weekday>星期[一二三四五六日天])\s*"
    r"(?P<start>\d+)(?:\s*-\s*(?P<end>\d+))?\s*"
    r"\[(?P<week_start>\d+)(?:\s*-\s*(?P<week_end>\d+))?\]\s*"
    r"(?P<location>.*)$"
)


def clean_value(value: Any) -> str:
    if pd.isna(value):
        return ""
    text = str(value).strip()
    if text.endswith(".0") and text[:-2].isdigit():
        text = text[:-2]
    return re.sub(r"\s+", " ", text)


def to_int(value: Any, default: int = 0) -> int:
    text = clean_value(value)
    if not text:
        return default
    try:
        return int(float(text))
    except ValueError:
        return default


def to_float(value: Any, default: float = 0.0) -> float:
    text = clean_value(value)
    if not text:
        return default
    try:
        return float(text)
    except ValueError:
        return default


def split_arrangement(text: str) -> list[str]:
    text = re.sub(r"</?br\s*/?>", "\n", text, flags=re.IGNORECASE)
    text = text.replace("；", "\n").replace(";", "\n")
    return [part.strip() for part in text.splitlines() if part.strip()]


def parse_sections(arrangement: str, teacher: str) -> list[dict[str, Any]]:
    sections: list[dict[str, Any]] = []
    for index, part in enumerate(split_arrangement(arrangement), start=1):
        match = SECTION_RE.match(part)
        if not match:
            sections.append(
                {
                    "id": f"unparsed-{index}",
                    "raw": part,
                    "weekday": "",
                    "dayOrder": 0,
                    "startPeriod": 0,
                    "endPeriod": 0,
                    "weekStart": 0,
                    "weekEnd": 0,
                    "location": "",
                    "teacher": teacher,
                    "parsed": False,
                }
            )
            continue

        prefix = clean_value(match.group("prefix"))
        weekday = match.group("weekday").replace("星期天", "星期日")
        start_period = int(match.group("start"))
        end_period = int(match.group("end") or start_period)
        week_start = int(match.group("week_start"))
        week_end = int(match.group("week_end") or week_start)
        section_teacher = prefix or teacher
        location = clean_value(match.group("location"))

        sections.append(
            {
                "id": f"{DAY_ORDER[weekday]}-{start_period}-{end_period}-{week_start}-{week_end}-{index}",
                "raw": part,
                "weekday": weekday,
                "dayOrder": DAY_ORDER[weekday],
                "startPeriod": start_period,
                "endPeriod": end_period,
                "weekStart": week_start,
                "weekEnd": week_end,
                "location": location,
                "teacher": section_teacher,
                "parsed": True,
            }
        )
    return sections


def stable_course_id(course_no: str, fallback_parts: list[str]) -> str:
    if course_no:
        return f"course-{course_no}"
    digest = sha1("||".join(fallback_parts).encode("utf-8")).hexdigest()[:12]
    return f"course-{digest}"


def dedupe_key(course: dict[str, Any]) -> tuple[Any, ...]:
    if course["courseNo"]:
        return ("courseNo", course["courseNo"])
    return (
        "fallback",
        course["code"],
        course["name"],
        course["category"],
        course["department"],
        course["teacher"],
        course["teacherDepartment"],
        course["arrangement"],
        course["teachingClass"],
        course["credits"],
        course["hours"],
        course["startWeek"],
        course["weekCount"],
    )


def dedupe_courses(courses: list[dict[str, Any]]) -> tuple[list[dict[str, Any]], int]:
    seen: set[tuple[Any, ...]] = set()
    unique_courses: list[dict[str, Any]] = []
    duplicate_count = 0

    for course in courses:
        key = dedupe_key(course)
        if key in seen:
            duplicate_count += 1
            continue
        seen.add(key)
        unique_courses.append(course)

    return unique_courses, duplicate_count


def read_course_file(path: Path) -> list[dict[str, Any]]:
    suffix = path.suffix.lower()
    if suffix not in {".xls", ".xlsx"}:
        return []

    df = pd.read_excel(path, dtype=str)
    df = df.dropna(how="all")
    courses: list[dict[str, Any]] = []

    for row_index, row in df.iterrows():
        teacher = clean_value(row.get("教师", ""))
        arrangement = clean_value(row.get("课程安排", ""))
        sections = parse_sections(arrangement, teacher)
        course_no = clean_value(row.get("课程序号", ""))
        code = clean_value(row.get("课程代码", ""))
        name = clean_value(row.get("课程名称", ""))
        current = to_int(row.get("实际人数", 0))
        limit = to_int(row.get("人数上限", 0))
        seats_left = max(limit - current, 0) if limit else 0
        course_id = stable_course_id(
            course_no,
            [
                code,
                name,
                teacher,
                arrangement,
                clean_value(row.get("教学班", "")),
                str(row_index),
            ],
        )

        courses.append(
            {
                "id": course_id,
                "sourceFile": path.name,
                "courseNo": course_no,
                "code": code,
                "name": name,
                "category": clean_value(row.get("课程类别", "")),
                "department": clean_value(row.get("开课院系", "")),
                "arrangement": arrangement,
                "teachingClass": clean_value(row.get("教学班", "")),
                "teacher": teacher,
                "teacherDepartment": clean_value(row.get("教师所属部门", "")),
                "current": current,
                "limit": limit,
                "seatsLeft": seats_left,
                "credits": to_float(row.get("学分", 0)),
                "hours": to_int(row.get("学时", 0)),
                "startWeek": to_int(row.get("起始周", 0)),
                "weekCount": to_int(row.get("周数", 0)),
                "sections": sections,
            }
        )

    return courses


def main() -> None:
    source_files = sorted(
        [
            path
            for path in RAW_DIR.iterdir()
            if path.is_file() and path.suffix.lower() in {".xls", ".xlsx"}
        ]
    )
    courses: list[dict[str, Any]] = []
    for source in source_files:
        courses.extend(read_course_file(source))
    imported_course_count = len(courses)
    courses, duplicate_count = dedupe_courses(courses)

    meta = {
        "importedCourseCount": imported_course_count,
        "courseCount": len(courses),
        "sectionCount": sum(len(course["sections"]) for course in courses),
        "dedupedCount": duplicate_count,
        "categories": sorted({course["category"] for course in courses if course["category"]}),
        "departments": sorted({course["department"] for course in courses if course["department"]}),
        "sourceFiles": [path.name for path in source_files],
    }
    payload = {
        "generatedAt": datetime.now().isoformat(timespec="seconds"),
        "meta": meta,
        "courses": courses,
    }

    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    js = "window.COURSE_DATA = "
    js += json.dumps(payload, ensure_ascii=False, indent=2)
    js += ";\n"
    OUTPUT_FILE.write_text(js, encoding="utf-8")
    print(
        f"Wrote {len(courses)} courses from {len(source_files)} file(s) to {OUTPUT_FILE} "
        f"({duplicate_count} duplicate row(s) removed)"
    )


if __name__ == "__main__":
    main()
