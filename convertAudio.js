const fs = require("node:fs");
const path = require("node:path");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("ffmpeg-static");

ffmpeg.setFfmpegPath(ffmpegPath);

const inputDir = process.argv[2];

if (!inputDir) {
  console.log("❌ Use: node convert.js <pasta>");
  process.exit(1);
}

// 🎯 CONFIGURAÇÃO
const BITRATE = "24k"; // 16k, 24k, 32k, 64k...
const CHANNELS = 1;    // 1 = mono (voz), 2 = stereo

function convertFile(filePath) {
  const outputPath = filePath.replace(/\.m4a$/i, ".webm");

  if (fs.existsSync(outputPath)) {
    console.log("⏭️ Já existe:", outputPath);
    return;
  }

  console.log("🎧 Convertendo:", filePath);

  ffmpeg(filePath)
    .audioCodec("libopus")
    .audioBitrate(BITRATE)
    .audioChannels(CHANNELS)
    .format("webm")
    .on("end", () => console.log("✅ OK:", outputPath))
    .on("error", err => console.log("❌ Erro:", err.message))
    .save(outputPath);
}

function walk(dir) {
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      walk(fullPath); // 🔁 recursivo
    } else if (file.toLowerCase().endsWith(".m4a")) {
      convertFile(fullPath);
    }
  });
}

walk(path.resolve(inputDir));