# 占位包发布说明

本目录包含用于在 **npm** 和 **PyPI** 上抢占 `tzp`、`tokenzip` 名称的占位包。按下列步骤在本地完成发布。

---

## 一、发布到 npm

1. **登录 npm**（若未登录）：
   ```bash
   npm login
   ```
   按提示输入 npm 用户名、密码与邮箱。

2. **发布两个包**（或直接运行脚本）：
   ```bash
   ./publish-npm.sh
   ```
   或手动：
   ```bash
   cd npm-trexapi && npm publish --access public && cd ..
   cd npm-tokenzip && npm publish --access public && cd ..
   ```

   **说明：** npm 短名 `tzp`/`tkzp` 受限，此处用 **`trexapi`** 占位（与参考实现同名）。安装：`npm install trexapi`，CLI 命令：`trexapi`。

3. 若某包名已被占用，会报 `403 Forbidden`，可改用备选名或 scoped 名（如 `@tokenzip/xxx`）并修改对应 `package.json` 的 `name` 后再发布。

---

## 二、发布到 PyPI

1. **安装构建与上传工具**：
   ```bash
   pip install build twine
   ```

2. **PyPI 认证**（二选一）：
   - **API Token（推荐）**：登录 https://pypi.org → Account → API tokens → Add API token，复制 token。  
   - 环境变量：`export TWINE_USERNAME=__token__` 与 `export TWINE_PASSWORD=pypi-你的token`。  
   - 或写入 `~/.pypirc`：
     ```ini
     [pypi]
     username = __token__
     password = pypi-你的token
     ```

3. **构建并上传**（或直接运行脚本）：
   ```bash
   ./publish-pypi.sh
   ```
   或分别进入 `pypi-tzp`、`pypi-tokenzip` 执行：
   ```bash
   python3 -m build && twine upload dist/*
   ```

若某包名已被占用，会报 `403` 或名称冲突，需改用其他包名。

---

## 三、Homebrew Tap

1. 在 GitHub 创建仓库 **`homebrew-tap`**（则用户执行 `brew tap tokenzip/tap`）。
2. 将 **`homebrew-tap/Formula/trexapi.rb`** 和 **`homebrew-tap/README.md`** 放入该仓库（Formula 放于仓库根目录下的 `Formula/` 中）。
3. 推送后用户即可：
   ```bash
   brew tap tokenzip/tap
   brew install trexapi
   ```

详见 `homebrew-tap/README.md`。若 npm 包 `trexapi` 发布新版本，需更新 Formula 中的 `url` 与 `sha256`。

---

## 四、Docker Hub

1. 在 https://hub.docker.com 注册/登录，创建组织 **`tokenzip`**。
2. 在组织下创建仓库 **`trexapi`**（可选再建 `tzp-cli` 等）。
3. 推送占位镜像（可选）：
   ```bash
   cd docker
   docker build -t tokenzip/trexapi:0.0.1 .
   docker login
   docker push tokenzip/trexapi:0.0.1
   docker push tokenzip/trexapi:latest
   ```

详见 `docker/README.md`。

---

## 目录结构

- `npm-trexapi/` — npm 包 `trexapi`（已发布则无需再发）
- `npm-tokenzip/` — npm 包 `tokenzip`
- `pypi-tzp/` — PyPI 包 `tzp`
- `pypi-tokenzip/` — PyPI 包 `tokenzip`
- `homebrew-tap/` — Homebrew Formula（trexapi）与 Tap 说明
- `docker/` — Docker 占位 Dockerfile 与推送说明

发布完成后可按需将本目录加入 `.gitignore`，避免提交到公开仓库。
