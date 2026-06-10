window.COURSE_DATA = {
  "generatedAt": "sample",
  "meta": {
    "importedCourseCount": 6,
    "courseCount": 6,
    "sectionCount": 6,
    "dedupedCount": 0,
    "categories": [
      "专业必修",
      "专业选修",
      "通识选修",
      "体育课程"
    ],
    "departments": [
      "示例学院",
      "通识教学中心",
      "体育教学中心"
    ],
    "sourceFiles": [
      "sample-data.xlsx"
    ]
  },
  "courses": [
    {
      "id": "course-0010",
      "sourceFile": "sample-data.xlsx",
      "courseNo": "0010",
      "code": "SAMPLE-ECON-A",
      "name": "课程A：宏观经济分析",
      "category": "专业必修",
      "department": "示例学院",
      "arrangement": "教师A 星期三 3-4 [1-16] 示例楼201",
      "teachingClass": "示例班1",
      "teacher": "教师A",
      "teacherDepartment": "示例学院",
      "current": 18,
      "limit": 45,
      "seatsLeft": 27,
      "credits": 2,
      "hours": 32,
      "startWeek": 1,
      "weekCount": 16,
      "sections": [
        {
          "id": "3-3-4-1-16-1",
          "raw": "教师A 星期三 3-4 [1-16] 示例楼201",
          "weekday": "星期三",
          "dayOrder": 3,
          "startPeriod": 3,
          "endPeriod": 4,
          "weekStart": 1,
          "weekEnd": 16,
          "location": "示例楼201",
          "teacher": "教师A",
          "parsed": true
        }
      ]
    },
    {
      "id": "course-0050",
      "sourceFile": "sample-data.xlsx",
      "courseNo": "0050",
      "code": "SAMPLE-DATA-B",
      "name": "课程B：商业数据分析",
      "category": "专业选修",
      "department": "示例学院",
      "arrangement": "教师B 星期三 3-4 [1-16] 示例楼305",
      "teachingClass": "示例班2",
      "teacher": "教师B",
      "teacherDepartment": "示例学院",
      "current": 30,
      "limit": 45,
      "seatsLeft": 15,
      "credits": 2,
      "hours": 32,
      "startWeek": 1,
      "weekCount": 16,
      "sections": [
        {
          "id": "3-3-4-1-16-1",
          "raw": "教师B 星期三 3-4 [1-16] 示例楼305",
          "weekday": "星期三",
          "dayOrder": 3,
          "startPeriod": 3,
          "endPeriod": 4,
          "weekStart": 1,
          "weekEnd": 16,
          "location": "示例楼305",
          "teacher": "教师B",
          "parsed": true
        }
      ]
    },
    {
      "id": "course-0247",
      "sourceFile": "sample-data.xlsx",
      "courseNo": "0247",
      "code": "SAMPLE-FIN-C",
      "name": "课程C：金融科技导论",
      "category": "专业必修",
      "department": "示例学院",
      "arrangement": "教师C 星期三 6-7 [1-16] 示例楼408",
      "teachingClass": "示例班3",
      "teacher": "教师C",
      "teacherDepartment": "示例学院",
      "current": 26,
      "limit": 50,
      "seatsLeft": 24,
      "credits": 2,
      "hours": 32,
      "startWeek": 1,
      "weekCount": 16,
      "sections": [
        {
          "id": "3-6-7-1-16-1",
          "raw": "教师C 星期三 6-7 [1-16] 示例楼408",
          "weekday": "星期三",
          "dayOrder": 3,
          "startPeriod": 6,
          "endPeriod": 7,
          "weekStart": 1,
          "weekEnd": 16,
          "location": "示例楼408",
          "teacher": "教师C",
          "parsed": true
        }
      ]
    },
    {
      "id": "course-1234",
      "sourceFile": "sample-data.xlsx",
      "courseNo": "1234",
      "code": "SAMPLE-MATH-D",
      "name": "课程D：随机过程基础",
      "category": "专业选修",
      "department": "示例学院",
      "arrangement": "教师D 星期一 1-2 [1-12] 示例楼101",
      "teachingClass": "示例班4",
      "teacher": "教师D",
      "teacherDepartment": "示例学院",
      "current": 16,
      "limit": 40,
      "seatsLeft": 24,
      "credits": 3,
      "hours": 48,
      "startWeek": 1,
      "weekCount": 12,
      "sections": [
        {
          "id": "1-1-2-1-12-1",
          "raw": "教师D 星期一 1-2 [1-12] 示例楼101",
          "weekday": "星期一",
          "dayOrder": 1,
          "startPeriod": 1,
          "endPeriod": 2,
          "weekStart": 1,
          "weekEnd": 12,
          "location": "示例楼101",
          "teacher": "教师D",
          "parsed": true
        }
      ]
    },
    {
      "id": "course-0188",
      "sourceFile": "sample-data.xlsx",
      "courseNo": "0188",
      "code": "SAMPLE-LANG-E",
      "name": "课程E：英语沟通训练",
      "category": "通识选修",
      "department": "通识教学中心",
      "arrangement": "教师E 星期五 5-6 [3-18] 示例楼502",
      "teachingClass": "示例班5",
      "teacher": "教师E",
      "teacherDepartment": "通识教学中心",
      "current": 20,
      "limit": 35,
      "seatsLeft": 15,
      "credits": 2,
      "hours": 32,
      "startWeek": 3,
      "weekCount": 16,
      "sections": [
        {
          "id": "5-5-6-3-18-1",
          "raw": "教师E 星期五 5-6 [3-18] 示例楼502",
          "weekday": "星期五",
          "dayOrder": 5,
          "startPeriod": 5,
          "endPeriod": 6,
          "weekStart": 3,
          "weekEnd": 18,
          "location": "示例楼502",
          "teacher": "教师E",
          "parsed": true
        }
      ]
    },
    {
      "id": "course-0316",
      "sourceFile": "sample-data.xlsx",
      "courseNo": "0316",
      "code": "SAMPLE-PE-F",
      "name": "课程F：体育健康",
      "category": "体育课程",
      "department": "体育教学中心",
      "arrangement": "教师F 星期二 9-10 [1-16] 示例场馆",
      "teachingClass": "示例班6",
      "teacher": "教师F",
      "teacherDepartment": "体育教学中心",
      "current": 28,
      "limit": 30,
      "seatsLeft": 2,
      "credits": 1,
      "hours": 32,
      "startWeek": 1,
      "weekCount": 16,
      "sections": [
        {
          "id": "2-9-10-1-16-1",
          "raw": "教师F 星期二 9-10 [1-16] 示例场馆",
          "weekday": "星期二",
          "dayOrder": 2,
          "startPeriod": 9,
          "endPeriod": 10,
          "weekStart": 1,
          "weekEnd": 16,
          "location": "示例场馆",
          "teacher": "教师F",
          "parsed": true
        }
      ]
    }
  ]
};
