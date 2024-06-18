import jwt from 'jsonwebtoken';

export function generateJWT(payload, secretKey, expiresIn) {
  return jwt.sign(payload, secretKey, { expiresIn });
}

export function verifyJWT(token, secretKey) {
  try {
    return jwt.verify(token, secretKey);
  } catch (e) {
    throw new Error('Invalid Token');
  }
}
