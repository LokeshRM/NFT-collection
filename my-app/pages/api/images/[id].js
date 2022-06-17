import fs from "fs";
import path from "path";

export default function handler(req, res) {
  const { id } = req.query;
  const filePath = path.resolve(".", process.cwd() + `/public/img (${id}).png`);
  const imageBuffer = fs.readFileSync(filePath);
  res.setHeader("Content-Type", "image/png");
  res.send(imageBuffer);
}
