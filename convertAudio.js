const fs = require("fs");
const path = require("path");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("ffmpeg-static");

ffmpeg.setFfmpegPath(ffmpegPath);

const inputDir = process.argv[2];

if (!inputDir) {
  console.log("❌ Use: node convert.js <pasta>");
  process.exit(1);
}

const BITRATE = "24k";
const CHANNELS = 1;
const EXTENSIONS = [".m4a", ".mp3"];

let queue = [];

function collectFiles(dir) {
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      collectFiles(fullPath);
    } else if (EXTENSIONS.includes(path.extname(file).toLowerCase())) {
      const output = fullPath.replace(/\.(m4a|mp3)$/i, ".webm");

      if (!fs.existsSync(output)) {
        queue.push({ input: fullPath, output });
      }
    }
  });
}

function runQueue() {
  if (queue.length === 0) {
    console.log("🎉 Tudo convertido!");
    return;
  }

  const file = queue.shift();

  console.log(`🎧 Convertendo (${queue.length} restantes):`, file.input);

  ffmpeg(file.input)
    .audioCodec("libopus")
    .audioBitrate(BITRATE)
    .audioChannels(CHANNELS)
    .format("webm")
    .on("progress", p => {
      if (p.percent) {
        process.stdout.write(`⏳ ${p.percent.toFixed(1)}%   \r`);
      }
    })
    .on("end", () => {
      console.log("\n✅ OK:", file.output);
      runQueue();
    })
    .on("error", err => {
      console.log("\n❌ Erro:", err.message);
      runQueue();
    })
    .save(file.output);
}

collectFiles(path.resolve(inputDir));

console.log(`📂 ${queue.length} arquivos para converter\n`);

runQueue();