import { ApiError } from "../utils/ApiError";
import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler";
import { User } from "../models/user.model";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  // Accessing token from cookies or header for logout

  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Beared ", "");

    if (!token) {
      throw new ApiError(401, "Unaauthorized request");
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      //TODO : Discuss about frontend
      throw new ApiError(401, "Invalid access token");
    }

    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid access token");
  }
});
