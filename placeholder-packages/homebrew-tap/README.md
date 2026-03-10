# Homebrew Tap: tokenzip/tap

TokenZip Protocol (TZP) 相关 Formula，当前提供 **trexapi** CLI。

## 使用方式

1. **添加 Tap**（只需执行一次）：
   ```bash
   brew tap tokenzip/tap
   ```

2. **安装 trexapi**：
   ```bash
   brew install trexapi
   ```

3. **升级**：
   ```bash
   brew upgrade trexapi
   ```

## 发布此 Tap

1. 在 GitHub 上创建仓库，名称为 **`homebrew-tap`**（则 tap 名为 `tokenzip/tap`）。
2. 将本目录下的 **`Formula/trexapi.rb`** 放入该仓库的 `Formula/` 目录。
3. 推送后用户即可 `brew tap tokenzip/tap` 与 `brew install trexapi`。

若将来发布新版本 npm 包，需更新 Formula 中的 `url` 与 `sha256`。获取新 sha256：
```bash
brew fetch trexapi  # 会下载并输出正确 sha256，或
curl -sL "https://registry.npmjs.org/trexapi/-/trexapi-新版本.tgz" | shasum -a 256
```
