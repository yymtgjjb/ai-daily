# 每日 AI 快报 · 编辑手册

网址：https://yymtgjjb.github.io/ai-daily/ （纯静态，无构建步骤；`index.html` + `style.css` + `app.js` 读取 `data/`）

## 每日流程（北京时间，每天一次）
1. `cd /workspace/ai-daily && git pull`（不存在就先 clone https://github.com/yymtgjjb/ai-daily.git）。
2. **先读往期**：`python3 scripts/used.py` 看已推荐过的项目/链接；必要时读最近几期 `data/*.json`。不要靠记忆。
3. 收集（只用下方来源），选材，写 `data/YYYY-MM-DD.json`（当天北京日期）。**旧文件永不删除、永不改写**。
4. `python3 scripts/repo_stats.py data/YYYY-MM-DD.json` —— 用 GitHub API 实时填 stars / updated / created / url。
5. `python3 scripts/validate.py YYYY-MM-DD` —— 校验字段、条数、搭配、与往期去重，并重建 `data/index.json`。失败就改到通过。
6. 本地自测（可选）：`python3 -m http.server 8000` 打开 `http://localhost:8000/?date=YYYY-MM-DD`。
7. 提交并推送（见下方「推送」）。

## 信息来源（只用这些）
- X 官方账号：@OpenAI @OpenAIDevs @AnthropicAI @claudeai @GoogleDeepMind @GoogleAI @xai @AIatMeta @deepseek_ai @Alibaba_Qwen @karpathy @AndrewYNg @huggingface
  - 先 `get_users_by_usernames` 一次批量核对（verified、粉丝数、简介）；再一次 `search_posts_all`：`(from:A OR from:B …) -is:retweet -is:reply`，`start_time` = 48 小时前，每页最多 25 条，翻页直到没有 next_token。长帖用 `get_posts_by_ids` 取 note_tweet 全文。
  - 不确定是否官方就不引用，并在 `note` 里写明。2026-11-01 核对：@xai 为 0 粉丝 0 帖、简介 “Now at @SpaceXAI”，暂不引用。
- AIHOT（https://aihot.news）作**参考源**（线索，不是原文库）：每天先用匿名只读接口扫精选/热点/日报（如 `curl --compressed https://aihot.news/api/v1/agent/latest` 或 `/api/v1/dailies/latest`；也可用 RSS `https://aihot.news/feed.xml`）。它筛出的好内容可以进我们的要闻/值得试/项目线索；**禁止**把 AIHOT 的标题、摘要、正文原样贴进 `data/*.json` 或页面。每条必须：①自己用白话重写；②核对并链接官方/一手原文（官方博客、官方 X、GitHub、论文页等）；③核对不到原文就不写进本期，可在 `note` 记一句。不把 AIHOT 页面链接当 `url`。公开再分发 AIHOT 原文需书面授权，我们不做。
- 官方博客与更新日志、GitHub Trending（https://github.com/trending）、Hugging Face Papers（https://huggingface.co/papers）、Hacker News 首页（https://hacker-news.firebaseio.com/v0/topstories.json）。
- 国内 AI 官方福利（福利板块必查，优先找「送 token / 免费调用额度 / 新用户赠送额度 / 学生和开发者计划」）：只看各家官方网站、官方文档的定价或活动页、官方公众号或官方 X 账号发布的内容，例如 DeepSeek（platform.deepseek.com）、阿里云百炼和通义千问（bailian.console.aliyun.com、help.aliyun.com）、字节火山方舟和豆包（volcengine.com）、智谱 GLM（bigmodel.cn）、月之暗面 Kimi（platform.moonshot.cn）、百度千帆和文心（cloud.baidu.com）、腾讯混元（cloud.tencent.com）、MiniMax（minimaxi.com）、阶跃星辰（platform.stepfun.com）、硅基流动（siliconflow.cn）、讯飞星火（xfyun.cn）。每条写清送多少 token 或额度、有效期、要不要实名认证。第三方转述的「羊毛」帖不引用，必须找到官方原页面。
- Agent Use Cases（https://agentusecases.ai/）只用于「AI 运用点子库」：每天从首页今日新案例、https://agentusecases.ai/agents/grok-bot ，以及内容/知识库/销售营销/生活办事里能套到 Grok Bot 的案例中选 5 条。自己白话改写，`url` 贴案例页（不要只贴首页）；能找到一手来源就写进 `why`。禁止原样粘贴站点标题或摘要。
- 点子库的第 6 条来自 X 公共搜索：用近期窗口，按真实互动数据（点赞、收藏、讨论度）挑选「有人用 AI 智能体做成了某件事」的案例，不要产品发布或空泛安利，低互动、没人证实的帖不要当成最火。`url` 贴原帖。
- 禁止营销号、搬运号、标题党、二手转述。没有重要消息就让 `news` 为空数组（页面自动显示「今日无重大更新」），不凑数。绝不编造事实、数字、链接。

## 选材规则
- 今日一句话：今天 AI 圈最重要的一件事，一句话。
- 今天最值得试的一件事：只选一件，正好 3 步，偏向读者能马上动手的。
- AI 运用点子库：正好 6 条（5 条站点案例 + 1 条 X 上的智能体真实运用）。优先选读者用现有助手（Grok Bot、主管「小鼻子屎」、知识库、生活咪咪、大肥鱼 dsh、高德地图助手）就能跑、不用自己部署新栈的案例；跟学 AI、做内容、整理知识、生活办事、接单自动化相关的优先。跳过：用非官方工具或爬虫去扰小红书、抖音数据；把发内容主号登录态交给机器人自动发帖；日内交易或土狗币赚钱故事；只适用美国账单、失物招领、在中国用不上的。标成「先懂概念、先别自己装」也可以入选，但必须说清楚，且 6 条里至少要有几条是现在就能试的。按 `url` 与往期点子去重，也不要和当天要闻里已有的同一条 X 链接重复。站点打不开或 X 搜不到够格的，就实话写进 `note`，别凑数、别编造热度数字或链接。
- 要闻：最多 5 条，优先和简历优化、求职、AI 自动化、agent 相关的。
- GitHub 项目：正好 5 个，偏工具类：
  - 2 个 `new`：最近 30 天内创建、增长快（GitHub Trending 或 API `created:>30天前 stars:>300 sort=stars`）。
  - 2 个 `classic`：长期高 Star、近期仍在维护（pushed_at 在近 30 天内）。
  - 1 个 `goal`：简历优化 / 求职 / AI 自动化 / agent / 知识库整理。
  - 同一 owner/repo 历史只推一次（validate.py 会拦）。不推破解、越狱、盗版、ROM 类仓库。
- AI 福利：国内官方送 token 和免费额度的活动优先，每期尽量至少 1 条国内的（查不到就不凑）。只放官方正规的免费额度、学生/新用户优惠、限时试用、比赛黑客松奖励、开源计划。每条写清官方链接、谁能领（地区/学生/邮箱）、截止时间、是否绑卡、是否自动续费；查不到写「官方未说明」。禁止共享账号、破解、中转站/低价 API、多开套利、先交钱带赚钱。没有就 `perks: []`（显示「今日无新福利」）。只找信息，不注册、不填资料、不付款。福利已推荐过的同一链接不重复，除非有新变化（那就换标题写明变化）。

## 读者画像（写每一条前先对一下）
- 学生，AI 还不熟；目前主要只用 **Grok Bot** 和大肥鱼（**dsh** / DeepSeek Harness）——都是在对话框里写东西、改代码，不是自己部署服务器。
- 目标：学 AI + 赚钱（简历优化服务、AI 自动化接单）。
- 他关心高星推荐，但现成「大白话」仍可能有门槛：看完仍不知道「这玩意儿能为我做什么」。
- 他还在做小红书简历图文副业、入门抖音、用 Notion 做个人知识库；秋招已签。
- 因此每条要闻 / 值得试 / 点子库 / 项目 / 福利，除了讲清楚是什么，还要多写一块「对你有什么用」。

## 写法（给小白，简体中文）
- 每条 `plain`（要闻/值得试/福利）或 `what`（项目）开头一句白话：这是什么。
- **`for_you`（对你有什么用）必写公式**：先打一个读者能懂的比方 → 再对比他现在用的 Grok Bot / dsh → 最后明确「现在就能试」还是「先懂概念、先别自己装」，以及跟学习 AI、赚钱的关系。try / news / repos / perks / ideas 每条都要有（从 2026-11-07 起；旧期没有也可以，页面会隐藏这一块）。
- 点子库每条还必须写清四块：`what`（这是做什么的）、`pain`（解决什么痛点）、`how`（2–4 步具体怎么做）、`run_with`（结合 Grok Bot 和现有助手可以怎么跑通：打开谁、怎么说、跑完能看到什么）。
- 少用术语；必须用时：在 JSON 文本里写成 `**术语**（解释）`，只加粗术语本身，不要整段加粗。前端会把 `**…**` 渲染成中等粗的术语样式。英文先写中文再跟原文，例如「**自托管**（把软件装在你自己的电脑或服务器上跑，不像打开 Grok Bot 就能用）」「仓库说明里的**快速开始**（Quick start）」。禁止留下未解释的行话（如 README Quick start、Slack/Teams、回路、自托管、Diff、MoE 等）。
- 小标题（「这是什么」「我怎么用」「对你有什么用」「推荐理由」，以及点子库的「这是做什么的」「解决什么痛点」「具体可以怎么做」「结合 Grok Bot 和现有助手可以怎么跑通」）要比术语更显眼；术语用中等粗，不要压过小标题。
- 每条都有 `why`（推荐理由）、链接、可信度。
- 可信度：`official` 官方（公司官方账号/博客/官方仓库）；`first` 一手（项目作者本人的仓库或帖子、论文原文）；`media` 媒体（新闻报道、HN 讨论）。
- 时间一律写北京时间，如「10月31日 07:08（北京时间）」。X/API 时间是 UTC，要 +8 小时。
- 数据里不要加 emoji（页面栏目标题已自带图标）。

## 推荐指数与方向标签（v2 起每天都要填；字段可选，旧期没有也兼容）
- `stars_rec`：1–5 的整数，填在 try / news / repos / perks 每条上。5=和读者（简历优化、求职、AI 自动化）直接相关且今天就能用；4=很相关；3=值得了解；2=背景信息；1=一般。不要人人 5 星。
- `tags`：数组，只能从这些里选：简历、求职、智能体、自动化、知识库、模型、安全、福利、工具、研究。页面顶部的筛选栏靠它过滤（「我的方向」= 简历/求职/智能体/自动化/知识库）。
- 命令或代码在 `steps` / `how` 里用反引号包起来，例如 `` `npx n8n` ``，页面会显示成等宽字体浅底色块。
- 图标：页面已固定在栏目标题和今日一句话上加图标，数据里不要再加 emoji。

## JSON 结构（`data/YYYY-MM-DD.json`）
```json
{
  "date": "2026-11-07",
  "headline": {"text": "一句话", "url": "https://…", "credibility": "official"},
  "try": {"title": "…", "plain": "这是什么", "for_you": "比方→对比 Grok Bot/dsh→现在试还是先懂→和学/赚的关系",
          "steps": ["第1步","第2步","第3步"],
          "why": "推荐理由", "url": "https://…", "credibility": "first", "stars_rec": 5, "tags": ["简历","求职"]},
  "news": [{"title": "…", "plain": "…", "for_you": "…", "why": "…", "source_name": "@claudeai",
            "url": "https://…", "published": "10月31日 01:29（北京时间）", "credibility": "official", "stars_rec": 4, "tags": ["模型"]}],
  "repos": [{"repo": "owner/name", "category": "new|classic|goal", "what": "一句话这是什么",
             "how": "一句话我怎么用（具体到第一步）", "for_you": "…", "difficulty": "简单|一般|较难", "why": "推荐理由",
             "credibility": "first", "stars_rec": 5, "tags": ["自动化"], "stars": 0, "updated": "YYYY-MM-DD", "created": "YYYY-MM-DD",
             "url": "https://github.com/owner/name", "stats_checked": "YYYY-MM-DD"}],
  "ideas": [{"title": "…", "source_kind": "site", "what": "这是做什么的", "pain": "解决什么痛点",
             "how": ["第1步", "第2步", "第3步"],
             "run_with": "打开谁、怎么说、跑完能看到什么",
             "for_you": "比方→对比 Grok Bot/dsh→现在试还是先懂→和学/赚的关系",
             "why": "推荐理由", "url": "https://…", "source_name": "Agent Use Cases",
             "published": "11月7日（北京时间）", "credibility": "first", "stars_rec": 5,
             "tags": ["智能体","知识库"]}],
  "perks": [{"title": "…", "plain": "…", "for_you": "…", "why": "…", "who": "谁能领", "deadline": "截止时间",
             "card": "是否绑卡", "auto_renew": "是否自动续费", "url": "官方链接", "credibility": "official", "stars_rec": 3, "tags": ["福利"]}],
  "note": "可选：本期说明，如哪些来源读不到、哪个账号无法核实"
}
```
`stars/updated/created/url/stats_checked` 由 `scripts/repo_stats.py` 自动填，不要手写。
从 `2026-11-07` 起，`try` / `news[]` / `repos[]` / `perks[]` / `ideas[]` 每条都应有非空 `for_you`（某段是空数组则跳过）。旧期没有 `for_you` 时页面隐藏这一块，校验也不拦。
从 `2026-11-07` 起，`ideas` 必有且正好 6 条：恰好 5 个 `source_kind` 为 `site`、1 个为 `x`。`source_kind` 为 `x` 的那张卡片加角标「X 上最火」。旧期没有 `ideas` 时页面隐藏整栏，校验也不拦。点子库的 `tags` 除了下面的标准方向标签，也可以加简短说明性标签（例如「现在就能试」）。

`data/index.json`（由 validate.py 生成，勿手改）：`{"updated": "YYYY-MM-DD", "days": [{"date": "…", "headline": "…"}]}`，按日期倒序。

## 页面功能
- 页面栏目顺序：今日一句话、今天最值得试的一件事、AI 运用点子库、今日 AI 要闻、GitHub 项目、AI 福利。
- 顶部筛选栏：全部 / 🎯 我的方向 / 简历·求职 / 智能体 / 自动化 / 知识库，另有「按推荐排序」；要闻、点子库和项目卡片可「展开详情」。
- 默认显示最新一期；`?date=YYYY-MM-DD` 或 `#YYYY-MM-DD` 直达；顶部前一天/后一天/下拉选日期；「往期」列表；「我的收藏」（localStorage，只在用户浏览器）。
- 页面里不放任何个人信息、密码或密钥。

## 推送
- commit 作者：`AI Daily Bot <ai-daily@users.noreply.github.com>`，信息如 `daily: 2026-11-02`。
- 令牌来自环境变量 `AI_DAILY_GITHUB_TOKEN`（细粒度，只有本仓库 Contents 读写）。绝不打印、不写入文件、git config 或 remote URL。临时推送：
```bash
git -c http.extraheader="AUTHORIZATION: basic $(printf 'x-access-token:%s' "$AI_DAILY_GITHUB_TOKEN" | base64 -w0)" \
  push https://github.com/yymtgjjb/ai-daily.git main
```
- 推送后 1–2 分钟 GitHub Pages 自动更新。令牌 401/403 时停止并提醒用户令牌可能过期（90 天），在 https://github.com/settings/personal-access-tokens 重新生成。
