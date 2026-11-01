#!/usr/bin/env python3
"""列出所有往期已推荐过的内容，用于去重。用法: python3 scripts/used.py [--json]"""
import json, glob, os, sys, re
root = os.path.join(os.path.dirname(__file__), "..", "data")
out = {"repos": {}, "news_urls": {}, "perk_urls": {}, "try_urls": {}, "news_titles": {}, "perk_titles": {}}
for f in sorted(glob.glob(os.path.join(root, "*.json"))):
    name = os.path.basename(f)
    if not re.match(r"\d{4}-\d{2}-\d{2}\.json$", name): continue
    d = json.load(open(f, encoding="utf-8")); day = d["date"]
    for r in d.get("repos", []): out["repos"][r["repo"].lower()] = day
    for n in d.get("news", []): out["news_urls"][n["url"]] = day; out["news_titles"][n["title"]] = day
    for p in d.get("perks", []): out["perk_urls"][p["url"]] = day; out["perk_titles"][p["title"]] = day
    if d.get("try"): out["try_urls"][d["try"]["url"]] = day
if "--json" in sys.argv: print(json.dumps(out, ensure_ascii=False, indent=1))
else:
    for k, v in out.items():
        print(f"## {k} ({len(v)})")
        for x, day in v.items(): print(f"  {day}  {x}")
