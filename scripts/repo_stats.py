#!/usr/bin/env python3
"""用 GitHub API 实时填充 data/<date>.json 里每个项目的 stars / updated / created / url / stats_checked。
用法: python3 scripts/repo_stats.py data/2026-11-01.json
可选环境变量 GITHUB_TOKEN（只用于提高限额，脚本绝不打印它）。"""
import json, os, sys, urllib.request, datetime
def get(repo):
    req = urllib.request.Request(f"https://api.github.com/repos/{repo}", headers={"Accept": "application/vnd.github+json"})
    tok = os.environ.get("GITHUB_TOKEN") or os.environ.get("AI_DAILY_GITHUB_TOKEN")
    if tok: req.add_header("Authorization", "Bearer " + tok)
    return json.load(urllib.request.urlopen(req, timeout=20))
def bj(ts):
    t = datetime.datetime.fromisoformat(ts.replace("Z", "+00:00")).astimezone(datetime.timezone(datetime.timedelta(hours=8)))
    return t.strftime("%Y-%m-%d")
path = sys.argv[1]; d = json.load(open(path, encoding="utf-8"))
today = datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=8))).strftime("%Y-%m-%d")
for r in d.get("repos", []):
    g = get(r["repo"])
    r["repo"] = g["full_name"]; r["url"] = g["html_url"]; r["stars"] = g["stargazers_count"]
    r["updated"] = bj(g["pushed_at"]); r["created"] = bj(g["created_at"]); r["stats_checked"] = today
    print(r["repo"], r["stars"], r["created"], r["updated"])
json.dump(d, open(path, "w", encoding="utf-8"), ensure_ascii=False, indent=1); open(path, "a").write("\n")
