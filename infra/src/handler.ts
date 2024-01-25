export const main = async (event: any) => {
  let who = "world";

  if (event.queryStringParameters && event.queryStringParameters.name) {
    who = event.queryStringParameters.name;
  }
  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Credentials": true,
    },
    body: `Hello ${who}, this is an AWS Lambda HTTP request`,
  };
};
