import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import cloudfrontservice from "../services/cloudfrontservice.js";

const getPresingedUrl = asyncHandler(async (req, res) => {
  console.log(req.body);
  const response = await cloudfrontservice.generateSignedUrl(req.body);
  // console.log(response);
  return res
    .status(200)
    .json(new ApiResponse(200, "url is fetched!!", response));
});

export default {
  getPresingedUrl,
};
