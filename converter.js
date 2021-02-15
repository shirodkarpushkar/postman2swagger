const fs = require("fs");
const util = require("util");
const axios = require("axios");
const apimaticURl = "https://www.apimatic.io";
const prompt = require("prompt");
const cliProgress = require("cli-progress");
const getPrompt = util.promisify(prompt.get).bind(prompt);
const userCookie =
  "_hjid=7dd7ac19-c82b-449f-bc4d-eb7bfe0c3d6a; _ga=GA1.2.1304799149.1610536209; ajs_user_id=%225f7dca646d4a3b2b5ca494dc%22; ajs_anonymous_id=%224718dda9-71a4-4a59-9cf1-c9e52e6eb228%22; __zlcmid=128jjREo5giTzpT; nf_ab=0.841181; ARRAffinity=46354f6246a23c337ae821e7570371294b619eb2ebe060a4d733138ae5834fcf; ARRAffinitySameSite=46354f6246a23c337ae821e7570371294b619eb2ebe060a4d733138ae5834fcf; __RequestVerificationToken=Tz3igYsZwplzyjzGlQnVL7-Qhuw4kzVTla0LhrtESws6I6OOmfQyp6dGVLg2KQj8j5SS4-7vQ9psZ8OWjT2RHfm9Aaf0bkbTYZeh-18vXY01; .AspNet.ApplicationCookie=Al3ytmkE8mGYXgj13aduTWe_Keo400b15RCbnbss1jD-ayVRak9PyJaSZOf7d7agYCYQxww3k2s0soQJNy3V7eajdNHLVCL9qcxwoFicvdwcmj8AUmaWD3sqMwMHezPIBYjsob5CMhK1bUjPYBJaDE6tI-DDCEN1-Z32-WbWu1QjCjZHf2rm4gsZqjK0-V-Wwt_E4HCbS0nQOvJDbM-dNd6hCTUIAC462iJgoajAE9ZpeTy0f_vXAv_kVd4Nq48gRlJkZOxINPXGd0qPeDrCtCAzbHkx_34eSzjd-od3XEdQddiDU9kOTyaTPPTid09CwtOa7E4XZCPXu1FjfhhetwhgfPyUbVnbpu0PkwatifB3zudRTrAFv4nxRsGU0a_NDbO6y4q2ZCPZqCShr3if38Q6vz9CnblfBvMYc2VtXhhKLbAvZa-8WFOjpTcYaSImLpm61fqkS_gmxOLr7UsHNv8tO_p-Z0bLreK28YmOELYH3Ce4dfkFuPGSE6WhRKaD; _gid=GA1.2.552124411.1612966730; _gat=1";

const progress = new cliProgress.SingleBar({
  format: "Progress |" + "{bar}" + "| {percentage}%",
  barCompleteChar: "\u2588",
  barIncompleteChar: "\u2591",
  hideCursor: true,
});

const schema = {
  properties: {
    fileUrl: {
      description: "Enter Postman Collection Url",
      required: true,
      type: "string",
    },
  },
};

const host = "52.140.79.232:5124";
const basePath = "";
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
  400: {
    description: "Bad Request",
  },
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
async function transformFile(fileUrl) {
  try {
    const response = await axios({
      method: "post",
      url: `${apimaticURl}/api/transformations`,
      headers: {
        "Content-Type": "application/vnd.apimatic.urlTransformDto.v1+json",
        cookie: userCookie,
      },
      data: {
        exportFormat: "Swagger20",
        transformationSource: "ViaWeb",
        fileUrl,
      },
    });
    const result = response.data;
    return result;
  } catch (error) {
    throw error.message;
  }
}
async function getTransformFile(fileUrl) {
  try {
    const response = await axios({
      method: "get",
      url: `${apimaticURl}${fileUrl}`,
      headers: {
        cookie: userCookie,
      },
    });
    const result = response.data;
    return result;
  } catch (error) {
    throw error.message;
  }
}
async function convertSwaggerJSON(swaggerJson) {
  try {
    delete swaggerJson.host;
    swaggerJson.basePath = basePath;
    swaggerJson.securityDefinitions = securityDefinitions;

    for (let i in swaggerJson.paths) {
      for (let j in swaggerJson.paths[i]) {
        let reqType = swaggerJson.paths[i][j];

        if (reqType.hasOwnProperty("parameters")) {
          let authParam = reqType.parameters.filter((el) => el.name === "auth");
          if (authParam.length) {
            reqType.parameters = reqType.parameters.filter(
              (el) => el.name !== "auth"
            );
            reqType.security = security;
          }
        }
        /* query */
        for (let qObj of reqType.parameters) {
          if (qObj.in === "query") {
            qObj.required = false;
          }
        }
        /* responses */
        for (let status in defaultResponses) {
          if (!reqType.responses.hasOwnProperty(status)) {
            reqType.responses[status] = defaultResponses[status];
          }
        }
      }
    }
    const data = JSON.stringify(swaggerJson);
    fs.writeFileSync("result.json", data);
  } catch (error) {
    throw error.message;
  }
}

async function main() {
  try {
    const question = await getPrompt(schema);
    const fileUrl = question.fileUrl;
    console.log("...   Converting Postman Collection to Swagger JSON");

    progress.start(100, 0);
    const convertedFile = await transformFile(fileUrl);
    progress.update(50);
    const convertedJson = await getTransformFile(convertedFile.generatedFile);
    progress.update(75);
    const result = await convertSwaggerJSON(convertedJson);
    progress.update(100);
    progress.stop();
    console.log(
      "...   Swagger JSON created successfully, output file ==> result.json"
    );
  } catch (error) {
    progress.stop();
    console.log(" main ~ error", error);
  }
}
main();
