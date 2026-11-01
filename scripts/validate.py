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
