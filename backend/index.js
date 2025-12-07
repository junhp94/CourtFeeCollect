exports.handler = async (event) => {
  console.log("Request: ", JSON.stringify(event));

  // Get the origin from the request headers
  const origin = event.headers?.origin || event.headers?.Origin || '*';

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "Hello from Club SaaS backend!",
      path: event.rawPath,
    }),
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Credentials": "true"
    }
  };
};
