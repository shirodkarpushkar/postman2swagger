const fs = require("fs");
const util = require("util");
const axios = require("axios");
const apimaticURl = "https://www.apimatic.io";
const prompt = require("prompt");
const cliProgress = require("cli-progress");
const getPrompt = util.promisify(prompt.get).bind(prompt);

const userCookie =
  "_hjid=7dd7ac19-c82b-449f-bc4d-eb7bfe0c3d6a; _ga=GA1.2.1304799149.1610536209; ajs_user_id=%225f7dca646d4a3b2b5ca494dc%22; ajs_anonymous_id=%224718dda9-71a4-4a59-9cf1-c9e52e6eb228%22; __zlcmid=128jjREo5giTzpT; nf_ab=0.841181; ARRAffinity=d4a4560214f4dc85d7daee51e6fc1642f6c8b71311c4f3e8914ffd673aff1e15; ARRAffinitySameSite=d4a4560214f4dc85d7daee51e6fc1642f6c8b71311c4f3e8914ffd673aff1e15; __RequestVerificationToken=n2FXcyKuAlkM4OPCDwUYtgWYi06qsa5untxRfRUFY4OO-7ZCL0z5z8SPCbsH58CerB3kzs1YarEK8SQFv9WWDelNUyhG4ijjD_TUku7pnYs1; _gid=GA1.2.609894242.1615545822; .AspNet.ApplicationCookie=5q7qCOoU4qMaKh0sBDOEEFr-e-PQ69y_v9iezzdTxn5rNBzSjivmMXpfAm6uoQWJZ4SgFUnCtzRAteA1CaVYM2gXXnTpgzpQAvXOk6SKddXhOIbpLNObO_LjagDu8uUq6FF49h4KhWpECLElc0dH3YSqZCxGShbiER8GrkJWmdNHw0irHje4uVR2KYJGkdk0-zjcE3li26hzwpvBEgB2YRpUxkTc_nUoPdl83Be9S0drM265Q7oDk4q2HGO21XJ9GBiv2wPpFZf66OrAp8ty56SBk0if02c8fKdsFL_2XUJi2XD6-4k1RPzVK11zjLRUPuoWu6vfiSTJgoZxXQrpmuVMZA2eqomSr8m9wvu29GUZF9w1Xh81ofGcWsy6whHu6W2pe6w-opja0RvEstyD4aTNTs25ZPt64hwAKUSxeRTpvIgxc3h01Eo_1z-x0Wt9-7jMId2xuv8DC-bYrZqcgfpCjDe5BJlovC6Zjp059mc";

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
