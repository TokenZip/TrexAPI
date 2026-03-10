# TokenZip Protocol (TZP) - TrexAPI CLI (from npm)
# 发布新版本后请更新 url 与 sha256：brew fetch trexapi 可得到新 sha256
class Trexapi < Formula
  desc "TokenZip Protocol (TZP) - TrexAPI edge gateway CLI"
  homepage "https://github.com/tokenzip/trex-api"
  url "https://registry.npmjs.org/trexapi/-/trexapi-0.0.1.tgz"
  sha256 "1611c84e19ce6113940f8690a9d5b55253f4847ae8062f071d3cf13e6c2eb157"
  license "Apache-2.0"
  depends_on "node"

  def install
    system "npm", "install", *std_npm_args
    bin.install_symlink libexec.glob("bin/*")
  end

  test do
    assert_match "trexapi", shell_output("#{bin}/trexapi 2>&1")
  end
end
