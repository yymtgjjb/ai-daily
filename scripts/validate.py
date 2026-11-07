#!/usr/bin/env python3
"""校验某天的 JSON，检查与往期是否重复，然后重建 data/index.json。
用法: python3 scripts/validate.py 2026-11-02     （只读校验加 --check）"""
import json, glob, os, sys, re
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "data")
CRED = {"official", "first", "media"}; CAT = {"new", "classic", "goal"}; DIFF = {"简单", "一般", "较难"}
errs = []
def need(obj, keys, where):
    for k in keys:
        if not str(obj.get(k, "")).strip(): errs.append(f"{where}: 缺少 {k}")
def url_ok(u, where):
    if not re.match(r"^https://", u or ""): errs.append(f"{where}: url 必须是 https 链接")
date = sys.argv[1]; path = os.path.join(ROOT, f"{date}.json")
d = json.load(open(path, encoding="utf-8"))
if d.get("date") != date: errs.append("date 字段与文件名不一致")
need(d.get("headline", {}), ["text"], "headline")
if d.get("try"):
    t = d["try"]; need(t, ["title", "plain", "why", "url", "credibility"], "try"); url_ok(t.get("url"), "try")
    if len(t.get("steps", [])) != 3: errs.append("try.steps 必须正好 3 步")
news = d.get("news", [])
if len(news) > 5: errs.append("news 最多 5 条")
for i, n in enumerate(news):
    need(n, ["title", "plain", "why", "source_name", "url", "credibility"], f"news[{i}]"); url_ok(n.get("url"), f"news[{i}]")
repos = d.get("repos", [])
if repos and len(repos) != 5: errs.append("repos 应为 5 个")
cats = [r.get("category") for r in repos]
if repos and (cats.count("new") != 2 or cats.count("classic") != 2 or cats.count("goal") != 1): errs.append("repos 搭配应为 2 new + 2 classic + 1 goal")
for i, r in enumerate(repos):
    need(r, ["repo", "what", "how", "difficulty", "why", "stars", "updated", "url", "stats_checked"], f"repos[{i}]")
    if r.get("difficulty") not in DIFF: errs.append(f"repos[{i}]: difficulty 只能是 简单/一般/较难")
for i, p in enumerate(d.get("perks", [])):
    need(p, ["title", "plain", "why", "who", "deadline", "card", "auto_renew", "url", "credibility"], f"perks[{i}]"); url_ok(p.get("url"), f"perks[{i}]")
for sec in ["news", "perks"]:
    for i, x in enumerate(d.get(sec, [])):
        if x.get("credibility") not in CRED: errs.append(f"{sec}[{i}]: credibility 只能是 official/first/media")
# 可选新字段：stars_rec(1-5 整数) / tags(字符串数组)，旧期没有也能通过
TAGS = {"简历","求职","智能体","自动化","知识库","模型","安全","福利","工具","研究"}
items = [("try", d["try"])] if d.get("try") else []
items += [(f"{k}[{i}]", x) for k in ("news", "repos", "perks") for i, x in enumerate(d.get(k, []))]
for where, x in items:
    if "stars_rec" in x and x["stars_rec"] not in (1, 2, 3, 4, 5): errs.append(f"{where}: stars_rec 必须是 1-5 的整数")
    if "tags" in x:
        if not isinstance(x["tags"], list): errs.append(f"{where}: tags 必须是数组")
        else:
            bad = [t for t in x["tags"] if t not in TAGS]
            if bad: errs.append(f"{where}: 未知标签 {bad}，可选 {sorted(TAGS)}")
# 从 2026-11-07 起建议每条 try/news/repos/perks 都有 for_you；旧期没有也能通过；空数组段落跳过
if date >= "2026-11-07":
    for where, x in items:
        if not str(x.get("for_you", "")).strip():
            errs.append(f"{where}: 缺少 for_you（对你有什么用）")
# 从 2026-11-07 起必须有 ideas：正好 6 条（5 个 site + 1 个 x）。旧期没有不拦。
ideas = d.get("ideas")
if date >= "2026-11-07":
    if not isinstance(ideas, list) or len(ideas) != 6:
        errs.append("ideas 必须正好 6 条")
        ideas = ideas if isinstance(ideas, list) else []
    kinds = [x.get("source_kind") for x in ideas]
    if ideas and (kinds.count("site") != 5 or kinds.count("x") != 1):
        errs.append("ideas 应为 5 个 site + 1 个 x")
    news_urls = {n.get("url") for n in news}
    seen_idea_urls = set()
    for i, x in enumerate(ideas):
        where = f"ideas[{i}]"
        need(x, ["title", "source_kind", "what", "pain", "run_with", "for_you", "why", "url", "source_name", "published", "credibility"], where)
        url_ok(x.get("url"), where)
        if x.get("source_kind") not in {"site", "x"}:
            errs.append(f"{where}: source_kind 只能是 site 或 x")
        how = x.get("how")
        if not isinstance(how, list) or not (2 <= len(how) <= 4):
            errs.append(f"{where}: how 必须是 2-4 步")
        elif any(not str(step).strip() for step in how):
            errs.append(f"{where}: how 不能有空步骤")
        if x.get("credibility") not in CRED:
            errs.append(f"{where}: credibility 只能是 official/first/media")
        if "stars_rec" in x and x["stars_rec"] not in (1, 2, 3, 4, 5):
            errs.append(f"{where}: stars_rec 必须是 1-5 的整数")
        if "tags" in x and not isinstance(x["tags"], list):
            errs.append(f"{where}: tags 必须是数组")
        u = x.get("url")
        if u in news_urls:
            errs.append(f"{where} 与当天 news 链接重复 {u}")
        if u in seen_idea_urls:
            errs.append(f"{where} 与本期其他点子链接重复 {u}")
        if u:
            seen_idea_urls.add(u)
elif ideas:
    ideas = ideas if isinstance(ideas, list) else []
else:
    ideas = []
# 与往期去重
for f in glob.glob(os.path.join(ROOT, "*.json")):
    n = os.path.basename(f)
    if not re.match(r"\d{4}-\d{2}-\d{2}\.json$", n) or n == f"{date}.json": continue
    old = json.load(open(f, encoding="utf-8"))
    old_repos = {r["repo"].lower() for r in old.get("repos", [])}
    for r in repos:
        if r["repo"].lower() in old_repos: errs.append(f"重复项目 {r['repo']}（{old['date']} 推荐过）")
    old_urls = {x["url"] for x in old.get("news", []) + old.get("perks", [])}
    for x in news + d.get("perks", []):
        if x["url"] in old_urls: errs.append(f"重复链接 {x['url']}（{old['date']} 出现过，除非有新进展请换掉）")
    old_idea_urls = {x.get("url") for x in old.get("ideas", []) if x.get("url")}
    for x in ideas:
        if x.get("url") in old_idea_urls:
            errs.append(f"重复点子链接 {x['url']}（{old['date']} 出现过）")
if errs:
    print("校验失败:"); [print(" -", e) for e in errs]; sys.exit(1)
print("校验通过", date)
if "--check" in sys.argv: sys.exit(0)
days = []
for f in sorted(glob.glob(os.path.join(ROOT, "*.json")), reverse=True):
    n = os.path.basename(f)
    if re.match(r"\d{4}-\d{2}-\d{2}\.json$", n):
        x = json.load(open(f, encoding="utf-8")); days.append({"date": x["date"], "headline": x["headline"]["text"]})
json.dump({"updated": date, "days": days}, open(os.path.join(ROOT, "index.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print("index.json 已更新，共", len(days), "期")
