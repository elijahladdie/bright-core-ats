const userAgent = process.env.npm_config_user_agent ?? "";

if (!/^yarn\/1\.22\.22(?:\s|$)/.test(userAgent)) {
  console.error("This project requires Yarn Classic 1.22.22.");
  process.exit(1);
}
