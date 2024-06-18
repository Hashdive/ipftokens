import { ethers } from 'ethers';

export function verifySignature(message, signature, expectedAddress) {
  const signerAddress = ethers.verifyMessage(message, signature);
  return signerAddress.toLowerCase() === expectedAddress.toLowerCase();
}
