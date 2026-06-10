# 选课排课助手

这是一个本地选课测试网页，用学校导出的排课 `.xls` 数据生成可点击的周课表。

## 使用

直接打开 `index.html` 即可使用当前数据。

- 在课程目录中点击“加入”或“移除”测试选课组合。
- 周课表会按星期和节次展示已选课程。
- 如果星期、节次、周次同时重叠，右侧会显示冲突。
- 多次导入同一教学任务时，会按课程序号自动去重；同一课程的不同教学班不会被合并。
- 顶部“全校教学任务”会打开学校全校任务汇总查询页，仅作为补充信息入口。打开后请筛选 `2026-2027` 学年和 `本科生教学项目`；本工具默认仍以 `data/raw/` 中导入的数据为主。

## 更新数据

把新的学校导出 `.xls` 或 `.xlsx` 文件放入 `data/raw/`，然后运行：

```powershell
& 'C:\Users\jiaoo\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe' scripts\parse_courses.py
```

脚本会重新生成 `src/data.js`，刷新网页即可看到新数据。
