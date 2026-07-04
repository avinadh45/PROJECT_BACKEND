import jwt from "jsonwebtoken";

// export const generateAccessToken = (userId: string) => {
//   const secret = process.env.JWT_ACCESS_SECRET;
//   if (!secret) {
//     throw new Error("JWT_ACCESS_SECRET not defined");
//   }
//   return jwt.sign(
//     { id: userId },
//     secret,
//     { expiresIn: process.env.ACCESS_TOKEN_EXPIRY as jwt.SignOptions["expiresIn"] }
//   );
// };
// export const generateRefreshToken = (userId: string) => {
//   const secret = process.env.JWT_REFRESH_SECRET;
//   if (!secret) {
//     throw new Error("JWT_REFRESH_SECRET not defined");
//   }
//   return jwt.sign(
//     { id: userId },
//     secret,
//     { expiresIn: process.env.REFRESH_TOKEN_EXPIRY as jwt.SignOptions["expiresIn"] }
//   );

// };


export const generateAccessToken = (payload: { id: string; role: string }) => {
  const secret = process.env.JWT_ACCESS_SECRET;
  if (!secret) {
    throw new Error("JWT_ACCESS_SECRET not defined");
  }

  return jwt.sign(payload, secret, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRY as jwt.SignOptions["expiresIn"]
  });
};

export const generateRefreshToken = (payload: { id: string; role: string }) => {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret) {
    throw new Error("JWT_REFRESH_SECRET not defined");
  }

  return jwt.sign(payload, secret, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRY as jwt.SignOptions["expiresIn"]
  });
};