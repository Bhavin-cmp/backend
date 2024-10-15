import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    //generating tokens
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    //save into databse
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something Went Wrong While generating refresh and access Tokens"
    );
  }
};

//? here we are uisng async handler to handle async request
const registerUser = asyncHandler(async (req, res) => {
  //    console.log("checking avatar", req.files?.avatar[0]?.path);
  //   return;
  /*   console.log("checking req body response ::::::::::", req.body);
  console.log(
    "checking req body response :::::::================:::",
    req.files
  ); */
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
  const existedUser = await User.findOne({
    $or: [{ userName }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with Email or Username already exist");
  }

  //! getting uploaded image path from local, here req.files this "Files" is we are getting using multer
  const avatarLocalPath = req.files?.avatar[0]?.path;
  //   console.log("avatarLocalPath", avatarLocalPath);
  // const coverImageLocalPath = req.files?.coverImage[0]?.path;

  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  //! if avatar image not found throw a error
  if (!avatarLocalPath) {
    throw new Error(400, "Avatar files is required in local");
  }

  //! Upload image in Cloudinary
  //? calling uploadOnCloudinary method to upload image on cloud.
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  //* Checking avatar image uploaded on cloud or not
  if (!avatar) {
    throw new ApiError(400, "Avatar file is required to upload in cloudinary");
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

const loginUser = asyncHandler(async (req, res) => {
  const { email, userName, password } = req.body;

  if (!userName || !email) {
    throw new ApiError(400, "userName or Email is required");
  }

  // Finding user using userName and email for that we use below $ syntax
  const user = await User.findOne({
    $or: [{ userName }, { email }],
  });

  if (!user) {
    throw new ApiError(404, "User does not exist with this userName or Email");
  }

  // ahiya je user return thayo che eno use karvano
  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid User Credentials");
  }

  const { refreshToken, accessToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  //send tokens in cookies
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  //set Cookie
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged In Successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User Logged Out Successfully"));
});

export { registerUser, loginUser, logoutUser };

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

//! Steps to user Login
//* 1. req body => data
//* 2. userName or email
//* 3. find the user usgin email or uname
//* 4. if find user check password
//* 5. if user found generate access token and reefresh token
//* 6.send token using cookies
//* 7. send response
