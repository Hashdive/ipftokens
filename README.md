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

## Importing

### ES Module
The package currently supports ES Modules. Ensure your project has "type": "module" set in package.json, or use the .mjs extension for your JavaScript files.

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

(async () => {
  // 1. Create a wallet
  const wallet = ethers.Wallet.createRandom();
  console.log(`Generated Wallet Address: ${wallet.address}`);
  console.log(`Generated Wallet Private Key: ${wallet.privateKey}`);

  // 2. Sign a message
  const message = 'Hello, IPFS!';
  const signature = await wallet.signMessage(message);
  console.log(`Message: ${message}`);
  console.log(`Signature: ${signature}`);

  // 3. Upload a file to IPFS
  const data = fs.readFileSync(new URL('./test.jpg', import.meta.url)); // Use correct relative path
  const cid = await uploadToIPFS(data);
  console.log('Uploaded CID:', cid);
  const retrievedData = await getFromIPFS(cid);
  //console.log('Retrieved Data:', retrievedData);

  // 4. Generate and verify JWT
  const secretKey = 'your_secret_key'; // Replace with your secret key
  const payload = { cid: cid, wallet: wallet.address };
  const token = generateJWT(payload, secretKey, '1h');
  console.log('Generated JWT:', token);
  const decoded = verifyJWT(token, secretKey);
  console.log('Decoded JWT:', decoded);

  // 5. Encrypt and decrypt data
  const secretKeyEnc = crypto.randomBytes(32);
  const encryptedData = encryptData(data, secretKeyEnc);
  //console.log('Encrypted Data:', encryptedData);
  const decryptedData = decryptData(encryptedData, secretKeyEnc);
  //console.log('Decrypted Data:', decryptedData.toString());

  // 6. Create a hash of the image and sign it with the wallet
  const imageBuffer = fs.readFileSync(new URL('./test.jpg', import.meta.url)); // Use correct relative path
  const imageHash = crypto.createHash('sha256').update(imageBuffer).digest('hex');
  const signedImageHash = await wallet.signMessage(imageHash);

  // 7. Add an invisible watermark to the image using the signed hash
  const watermarkedImage = await watermarkImage(imageBuffer, signedImageHash);
  fs.writeFileSync(new URL('./watermarked_image.png', import.meta.url), watermarkedImage); // Use correct relative path

  // 8. Read the invisible watermark from the image
  const readWatermark = await readWatermarkFromImage(watermarkedImage);
  console.log('Read Watermark:', readWatermark);

  // 9. Verify the image signature
  const isValidImageSignature = verifySignature(imageHash, readWatermark, wallet.address);
  console.log('Is Image Signature Valid:', isValidImageSignature);

  // 10. Create a hash of the PDF and sign it with the wallet
  const pdfBuffer = fs.readFileSync(new URL('./test.pdf', import.meta.url)); // Use correct relative path
  const pdfHash = crypto.createHash('sha256').update(pdfBuffer).digest('hex');
  const signedPdfHash = await wallet.signMessage(pdfHash);

  // 11. Add an invisible watermark to the PDF using the signed hash
  const watermarkedPDF = await watermarkPDF(pdfBuffer, signedPdfHash);
  fs.writeFileSync(new URL('./watermarked_pdf.pdf', import.meta.url), watermarkedPDF); // Use correct relative path

  // 12. Verify the PDF signature
  const isValidPDFSignature = verifySignature(pdfHash, signedPdfHash, wallet.address);
  console.log('Is PDF Signature Valid:', isValidPDFSignature);

  // 13. Verify the message signature
  const expectedAddress = wallet.address;
  const isValidMessageSignature = verifySignature(message, signature, expectedAddress);
  console.log('Is Message Signature Valid:', isValidMessageSignature);
})();
```

## Licence
This project is licensed under the MIT License -- feel free to use as you see fit

## Contributions
Contributions are welcome! Feel free to open a pull request or issue.