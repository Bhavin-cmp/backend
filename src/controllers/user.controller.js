import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

//? here we are uisng async handler to handle async request
const registerUser = asyncHandler(async (req, res) => {
  const { userName, fullName, email, password } = req.body;

  //! Checking fields are not empty using if else
  /* if (userName === "") {
    throw new ApiError(400, "fullName is required");
  } */

  //! Checking fields are not empty using advanced if else inside array
  if (
    [fullName, email, userName, password].some((field) => field?.trim() === "")
  ) {
    //! we are using ApiError uility module to throw error, so we no need to write error every time
    throw new ApiError(400, "All field are required");
  }

  //! checking if user already exixst
  const existedUser = User.findOne({
    $or: [{ userName }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with Email or Username already exist");
  }

  //! getting uploaded image path from local
  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.coverImage[0]?.path;

  //! if avatar image not found throw a error
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar files is required");
  }

  //! Upload image in Cloudinary
  //? calling uploadOnCloudinary method to upload image on cloud.
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  //* Checking avatar image uploaded on cloud or not
  if (!avatar) {
    throw new ApiError(400, "Avatar file is required");
  }

  //! creating user in Database
  const createNewUser = await User.create({
    userName: userName.toLowerCase(),
    fullName,
    avatar: avatar.url,
    email,
    coverImage: coverImage?.url || "",
    password,
  });

  //! Getting new created user Data, but without password and refresh Token
  const createdUser = await User.findById(createNewUser._id).select(
    "-password -refreshToken"
  );

  //! If user not Found
  if (!createNewUser) {
    throw new ApiError(500, "Something Went wrong while registering the user");
  }

  //! If user created return Response
  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User Registered Successfully"));
});

export { registerUser };

//! Steps to user Registration
//* 1. GET USER's DETAILS FROM FRONTEND
//* 2. Add Validation - Not empty
//* 3. Check if user already exixst : userName and Email
//* 4. Check for images , Check for avatar is uploaded
//* 5. upload image to cloudinary, avatar
//* 6. create user object to send userData in mongoDb - create entry in db
//* 7. remove password and refresh Token field from response
//* 8. check for user creation
//* 9. return response
