# Docker Hub 占位

在 Docker Hub 抢占 **tokenzip** 命名空间及 **trexapi** 仓库名。

## 步骤

1. **注册/登录 Docker Hub**  
   https://hub.docker.com → 注册或登录。

2. **创建命名空间（组织）**  
   - 若用组织：Create Organization → 名称填 **`tokenzip`**。  
   - 若用个人账号：则镜像将为 `你的用户名/trexapi`，建议仍申请组织 `tokenzip` 以便统一。

3. **创建仓库**  
   - 在组织 `tokenzip` 下 Create Repository，名称 **`trexapi`**。  
   - 可选：再创建 `tzp-cli`、`tzp-gateway` 等占位仓库（空仓库或仅 README 即可）。

4. **推送占位镜像**（可选，用于占位并显示说明）：
   ```bash
   cd placeholder-packages/docker
   docker build -t tokenzip/trexapi:0.0.1 .
   docker tag tokenzip/trexapi:0.0.1 tokenzip/trexapi:latest
   docker login
   docker push tokenzip/trexapi:0.0.1
   docker push tokenzip/trexapi:latest
   ```

5. **后续**  
   正式实现 TrexAPI 后，在同一仓库推送新 tag 即可（如 `tokenzip/trexapi:1.0.0`）。
