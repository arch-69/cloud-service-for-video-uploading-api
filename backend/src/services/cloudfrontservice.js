import { getSignedUrl } from "@aws-sdk/cloudfront-signer";
import fs from "fs";

const generateSignedUrl = async ({ key }) => {
  const privateKey = fs.readFileSync("private_key.pem", "utf8");
  return getSignedUrl({
    url: `${process.env.CLOUDFRONT_URL}/${key}`,

    keyPairId: process.env.CF_KEY_PAIR_ID,

    privateKey,

    dateLessThan: new Date(Date.now() + 60 * 60).toISOString(),
  });
};

export default {
  generateSignedUrl,
};
