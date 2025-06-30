const fg = require('fast-glob');
const cfg = require('../tailwind.config.cjs');

(async () => {
  const files = await fg(cfg.content);
  console.log(`[Tailwind] matched ${files.length} source files`);
  if (!files.length) {
    console.error(
      '\n❌  content glob found **zero** files. Tailwind will emit only base styles.\n'
    );
    process.exit(1);
  }
})();