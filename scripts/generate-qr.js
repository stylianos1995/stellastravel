/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");
const QRCode = require("qrcode");
const PDFDocument = require("pdfkit");

async function main() {
  const url = process.env.QR_URL || "https://www.stellastravel.com";

  const outDir = path.resolve(process.cwd(), "generated");
  fs.mkdirSync(outDir, { recursive: true });

  const pngPath = path.join(outDir, "stellastravel-qr.png");
  const pdfPath = path.join(outDir, "stellastravel-qr.pdf");

  // Generate QR PNG
  await QRCode.toFile(pngPath, url, {
    errorCorrectionLevel: "M",
    margin: 2,
    width: 1024,
    color: { dark: "#000000", light: "#FFFFFF" },
  });

  // Create PDF with the QR and label
  const doc = new PDFDocument({ size: "A4", margin: 72 }); // 1 inch margins
  const stream = fs.createWriteStream(pdfPath);
  doc.pipe(stream);

  doc.fontSize(22).text("Stella’s Travel Agency", { align: "center" });
  doc.moveDown(0.5);
  doc.fontSize(12).fillColor("#333333").text(url, { align: "center" });
  doc.moveDown(1.5);

  const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const qrSize = Math.min(360, pageWidth);
  const x = doc.page.margins.left + (pageWidth - qrSize) / 2;
  const y = doc.y;

  doc.image(pngPath, x, y, { width: qrSize, height: qrSize });
  doc.moveDown(1);
  doc.fillColor("#666666")
    .fontSize(10)
    .text("Scan to open the website", { align: "center" });

  doc.end();

  await new Promise((resolve, reject) => {
    stream.on("finish", resolve);
    stream.on("error", reject);
  });

  console.log(`QR URL: ${url}`);
  console.log(`Wrote: ${pngPath}`);
  console.log(`Wrote: ${pdfPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

