import {
  S3Client,
  GetObjectCommand,
  GetObjectCommandInput,
} from "@aws-sdk/client-s3";
const client = new S3Client({ region: "eu-west-2" });
const BUCKET_NAME = process.env.BUCKET_NAME;
const FILE_NAME = "wine-data-set.json";

export const main = async (event: any) => {
  const params: GetObjectCommandInput = {
    Bucket: BUCKET_NAME,
    Key: FILE_NAME,
  };
  const command = new GetObjectCommand(params);

  try {
    const s3ResponseStream = (await client.send(command)).Body;
    const chunks = [];
    //@ts-ignore
    for await (const chunk of s3ResponseStream) {
      chunks.push(chunk);
    }
    const responseBuffer = Buffer.concat(chunks);
    const body = JSON.parse(responseBuffer.toString());
    const filtered = body.filter((wine: any) => wine.country === "Chile");
    const filteredScore = filtered.filter((wine: any) => wine.points >= 90);

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify(filteredScore),
    };
  } catch (e) {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify(e),
    };
  }
};
