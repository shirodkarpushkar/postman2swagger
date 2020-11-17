const fs = require("fs");
const util = require("util");
var swaggerJson = require("./fd8280dd9ee9de9d96ec-Swagger20 (2).json");
const host = "localhost:5124";
const basePath = "/api/v1";
const securityDefinitions = {
  Authorization: {
    type: "apiKey",
    name: "auth",
    in: "header",
    description: "Standard Authorization header using the Bearer scheme.",
  },
};
const security = [
  {
    Authorization: [],
  },
];
const defaultResponses = {
  401: {
    description: "Unauthorized",
  },
  403: {
    description: "Forbidden",
  },
  404: {
    description: "Resource Not Found",
  },
  500: {
    description: "Internal Server Error",
  },
};
swaggerJson.host = host;
swaggerJson.basePath = basePath;
swaggerJson.securityDefinitions = securityDefinitions;

async function convertSwaggerJSON() {
  try {
    for (let i in swaggerJson.paths) {
      for (let j in swaggerJson.paths[i]) {
        let reqType = swaggerJson.paths[i][j];

        if (reqType.hasOwnProperty("parameters")) {
          let authParam = reqType.parameters.filter((el) => el.name === "auth");
          if (authParam) {
            reqType.parameters = reqType.parameters.filter(
              (el) => el.name !== "auth"
            );
            reqType.security = security;
          }
        }
      }
    }
    const data = JSON.stringify(swaggerJson);
    fs.writeFileSync("result.json", data);
  } catch (error) {
    console.log("error", error);
  }
}

async function main() {
  const result = await convertSwaggerJSON();
}
main();
