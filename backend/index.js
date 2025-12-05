exports.handler = async (event) => {
    console.log("Request: ", JSON.stringify(event));
  
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Hello from Club SaaS backend!",
        path: event.rawPath,
      }),
      headers: {
        "Content-Type": "application/json"
      }
    };
  };
  