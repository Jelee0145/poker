# 我们的王牌 —— 扑克游戏平台

中山职业技术学院 20 周年校庆项目。以 52 张扑克牌形式展示创业校友信息,并提供插件式游戏平台。

## 技术栈

- 后端:Python Flask + Flask-SQLAlchemy + Flask-Migrate
- 前端:React + Vite + Tailwind CSS(移动端优先)
- 数据库:SQLite(生产 `/data/poker/poker.db`)
- 认证:JWT 双 Token(Access 24h / Refresh 30d)

## 目录结构

```
backend/        Flask 后端
  app.py        应用工厂
  config.py     配置
  extensions.py 扩展实例
  models.py     SQLAlchemy 模型(8 张表)
  games/        游戏插件目录(自动注册)
  migrations/   Flask-Migrate 迁移
frontend/       React + Vite + Tailwind 前端
docs/           技术文档定稿(PRD / 数据库 / 插件规范 / 安全规范)
开发启动清单.md  开发启动核对单(决策记录)
```

## 本地开发

```bash
# 后端
cd backend
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
flask db upgrade
flask run

# 前端
cd frontend
npm install
npm run dev
```

## Railway 部署（Demo 预览）

仓库现在按“单服务”方式部署：

- `Dockerfile` 先构建 `frontend/dist`
- Flask 生产环境直接托管前端静态文件和 SPA 路由
- 容器启动时自动执行 `flask db upgrade` 和 `python seed.py`
- 最终由 Gunicorn 监听 Railway 注入的 `PORT`

### 推荐配置

在 Railway 为该服务挂一个 Volume，并把挂载路径设为 `/data`。容器内实际数据目录默认使用 `/data/poker`，其中会保存：

- SQLite：`/data/poker/poker.db`
- 上传文件：`/data/poker/uploads/`

如需覆盖，可设置环境变量：

- `DATA_DIR=/data/poker`
- `DATABASE_URL=sqlite:////data/poker/poker.db`
- `UPLOAD_DIR=/data/poker/uploads`
- `SECRET_KEY=...`
- `JWT_SECRET=...`
- `ADMIN_PHONE=...`
- `ADMIN_TEMP_PASSWORD=...`

### 部署步骤

1. 将当前分支推到 GitHub 仓库
2. 在 Railway 中选择 `Deploy from GitHub repo`
3. 选中仓库 `Jelee0145/poker`
4. 确认 Railway 检测到仓库根目录 `Dockerfile`
5. 配置 Volume 挂载到 `/data`
6. 配置上面的环境变量并重新部署

部署完成后：

- 前台首页：`/`
- 健康检查：`/api/health`
- 管理员登录接口：`/api/auth/admin-login`

## 环境

- 开发:dev 本地机
- 测试/调试:106.55.169.208(OpenCloudOS 9,宝塔面板)

## 贡献

本项目走 **GitHub Flow + Fork-and-PR**,`main` 受保护,所有改动通过 PR。

- 第三方插件开发者:先看 [《游戏插件开发指南》](docs/游戏插件开发指南.md),再走 [`CONTRIBUTING.md`](CONTRIBUTING.md) 的 Fork-and-PR 流程。
- 平台改动:直接在主仓开 `feat/<desc>` / `fix/<desc>` / `docs/<desc>` 分支提 PR。
- 测试服一键部署:`./scripts/deploy-test.sh`(首次用前按脚本头部 TODO 改路径/服务名)。
