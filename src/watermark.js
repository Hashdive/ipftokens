import Jimp from 'jimp';
import { PDFDocument, rgb, degrees } from 'pdf-lib';
import crypto from 'crypto';
import { ethers } from 'ethers';

function encodeWatermark(image, watermarkText) {
  const watermarkBinary = Buffer.from(watermarkText).toString('binary');
  let pixelIndex = 0;

  for (let i = 0; i < watermarkBinary.length; i++) {
    const char = watermarkBinary.charCodeAt(i);
    for (let j = 0; j < 8; j++) {
      const bit = (char >> j) & 1;
      const x = pixelIndex % image.bitmap.width;
      const y = Math.floor(pixelIndex / image.bitmap.width);
      const rgba = Jimp.intToRGBA(image.getPixelColor(x, y));

      const newColor = Jimp.rgbaToInt(
        rgba.r,
        rgba.g,
        rgba.b,
        (rgba.a & 0xfe) | bit
      );

      image.setPixelColor(newColor, x, y);
      pixelIndex++;
    }
  }
}

function decodeWatermark(image) {
  let watermarkBinary = '';
  let char = 0;
  let bitCount = 0;

  for (let i = 0; i < image.bitmap.width * image.bitmap.height; i++) {
    const x = i % image.bitmap.width;
    const y = Math.floor(i / image.bitmap.width);
    const rgba = Jimp.intToRGBA(image.getPixelColor(x, y));
    const bit = rgba.a & 1;
    char |= bit << bitCount;
    bitCount++;

    if (bitCount === 8) {
      watermarkBinary += String.fromCharCode(char);
      char = 0;
      bitCount = 0;

      if (watermarkBinary.endsWith('\0')) {
        break;
      }
    }
  }

  return watermarkBinary.replace(/\0/g, '');
}

export async function watermarkImage(imageBuffer, signedHash) {
  const image = await Jimp.read(imageBuffer);

  // Embed the signed hash as invisible text in the image
  encodeWatermark(image, signedHash + '\0'); // Null-terminate the signature

  return await image.getBufferAsync(Jimp.MIME_PNG);
}

export async function readWatermarkFromImage(imageBuffer) {
  const image = await Jimp.read(imageBuffer);
  const watermark = decodeWatermark(image);
  return watermark;
}

export async function watermarkPDF(pdfBuffer, signedHash) {
  const pdfDoc = await PDFDocument.load(pdfBuffer);
  const pages = pdfDoc.getPages();
  const { width, height } = pages[0].getSize();

  // Add the signed hash as an invisible watermark
  pages.forEach(page => {
    page.drawText(signedHash, {
      x: 10,
      y: height / 2,
      size: 1,
      color: rgb(1, 1, 1),
      opacity: 0.0, // Make the watermark invisible
      rotate: degrees(-45)
    });
  });

  return await pdfDoc.save();
}

export async function verifySignature(hash, walletSignature, expectedWalletAddress) {
  // Verify the wallet signature
  const signerAddress = ethers.utils.verifyMessage(hash, walletSignature);
  return signerAddress.toLowerCase() === expectedWalletAddress.toLowerCase();
}
