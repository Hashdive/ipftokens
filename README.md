# IPFTokens

IPFTokens is an open source library for granting temporary access to encrypted data stored on IPFS using JWTs and digital signatures. It provides functionality for encrypting/decrypting data, uploading/downloading files to/from IPFS, generating/verifying JWTs, and watermarking files with digital signatures.

The libary currently supports images and PDF.

## Example Workflow

1. **Encrypt a file**
2. **Upload Encrypted File to IPFS**
3. **Generate a JWT**
4. **User requests access using the JWT**
5. **Retrieve the File from IPFS & Decrypt**
6. **OPTIONAL**: Send a hash of the file for the user to sign, and watermark before sending to the user.

The idea is that if the file is tampered with (watermark removed), the original hash will no longer match. Copies of the original document will trace back to the signing address.

## Installation

```bash
npm install ipftokens
```

## Clone and Test Locally

```bash
git clone https://github.com/hashdive/ipftokens.git
cd ipftokens
npm install
npm run test
```

## Usage
```Javascript
import {
  generateJWT,
  verifyJWT,
  uploadToIPFS,
  getFromIPFS,
  watermarkImage,
  watermarkPDF,
  encryptData,
  decryptData,
  verifySignature,
  readWatermarkFromImage
} from 'ipftokens';

import fs from 'fs';
import crypto from 'crypto';
import { ethers } from 'ethers';

// Example usage
(async () => {
  // Create a wallet
  const wallet = ethers.Wallet.createRandom();

  // Sign a message
  const message = 'Hello, IPFS!';
  const signature = await wallet.signMessage(message);

  // Upload a file to IPFS
  const data = fs.readFileSync('./test.jpg');
  const cid = await uploadToIPFS(data);
  const retrievedData = await getFromIPFS(cid);

  // Generate and verify JWT
  const secretKey = 'your_secret_key';
  const payload = { cid: cid, wallet: wallet.address };
  const token = generateJWT(payload, secretKey, '1h'); // 60 (seconds), 1m, 1h, 1d, 1w
  const decoded = verifyJWT(token, secretKey);

  // Encrypt and decrypt data
  const secretKeyEnc = crypto.randomBytes(32);
  const encryptedData = encryptData(data, secretKeyEnc);
  const decryptedData = decryptData(encryptedData, secretKeyEnc);

  // Add an invisible watermark to an image and sign it with the wallet
  const imageBuffer = fs.readFileSync('./test.jpg');
  const imageHash = crypto.createHash('sha256').update(imageBuffer).digest('hex');
  const signedImageHash = await wallet.signMessage(imageHash);
  const watermarkedImage = await watermarkImage(imageBuffer, signedImageHash);
  fs.writeFileSync('./watermarked_image.png', watermarkedImage);

  // Read the invisible watermark from the image
  const readWatermark = await readWatermarkFromImage(watermarkedImage);

  // Verify the image signature
  const isValidImageSignature = verifySignature(imageHash, readWatermark, wallet.address);

  // Watermark a PDF and sign it with the wallet
  const pdfBuffer = fs.readFileSync('./test.pdf');
  const pdfHash = crypto.createHash('sha256').update(pdfBuffer).digest('hex');
  const signedPdfHash = await wallet.signMessage(pdfHash);
  const watermarkedPDF = await watermarkPDF(pdfBuffer, signedPdfHash);
  fs.writeFileSync('./watermarked_pdf.pdf', watermarkedPDF);

  // Verify the PDF signature
  const isValidPDFSignature = verifySignature(pdfHash, signedPdfHash, wallet.address);
})();
```

## Licence
This project is licensed under the MIT License -- feel free to use as you see fit

## Contributions
Contributions are welcome! Feel free to open a pull request or issue.