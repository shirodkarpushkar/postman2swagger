const fs = require("fs");
const util = require("util");
const axios = require("axios");
const apimaticURl = "https://www.apimatic.io";
const prompt = require("prompt");
const cliProgress = require("cli-progress");
const getPrompt = util.promisify(prompt.get).bind(prompt);

const userCookie = `ARRAffinity=71a26b5c846459951f8d7bf956be3364b8ad4e7d672c943078cd65b033398998; ARRAffinitySameSite=71a26b5c846459951f8d7bf956be3364b8ad4e7d672c943078cd65b033398998; nf_ab=0.934573; ARRAffinity=981f3d81822bb570ce45620bd56586a1002677567fb7bf724ec01907bc8b82b7; ARRAffinitySameSite=981f3d81822bb570ce45620bd56586a1002677567fb7bf724ec01907bc8b82b7; __RequestVerificationToken=1180GcqKB6geF2-62qt8vp8EYRKrc3ot6XtiEm8YyVzwQmaLuRD_r2VLYppZkt0smRanx54NjQD2kW2Wl-Fko9zqYI6lzHtEZ4M9ZRyC5YU1; _hjid=d5797c63-9c50-4156-9e8c-a1978e9dedcb; _hjFirstSeen=1; .AspNet.ApplicationCookie=iYPUbdElyjiW7GmJBGtBV3PUJQkgDHlr1X15BHrxLnU1jT_qYQVznVFxjXfFqr4gL7QAVFh-rIh42k5309Qe1DU7WZEjD_O1CI1CF13arX5QGWeHpj0nRVeD5uEnz3XUQV9vbNHkcIE7P9bJiBS35sOFQ4RyQCO8cQ5dIVdTGhcq0raRTDYpG7HrpNqd-bFZM-WtG2Z6_6qxdP7VOXllXXeUY873lo5P2GAz9E3epNmjXTf01GKA8L3r8EqDXFtzDvPOGxGlww478fDk-3Byx5ZG12V05zBZHy7aSvs-EPKOecZIjZft-cqHBqwtCUGEcIbBEurVaBbmGtcHq1PhO88_YJt8YB1xlQpR5EUkcPXMlaKEhUThsSBbG5ouncYJm5dSEZCzWjWN_h8-5dIjVgIbM5r4PfWcRkQY5RRerRt77xRQrVqTcBOpSmSd5PXUJvrS8KHom7IZ3_OlRQqXrgpIWnLRqRVZVpBiCj-AM84; _ga=GA1.2.1017778832.1629891155; _gid=GA1.2.1941000283.1629891155; __zlcmid=15kkHVurn2P0Dpb`;

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

const basePath = "";
const securityDefinitions = {
  Authorization: {
    type: "apiKey",
    name: "Authorization",
    in: "header",
    default: "Bearer {token}",
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
          let authParam = reqType.parameters.filter(
            (el) => el.name === "Authorization"
          );
          if (authParam.length) {
            reqType.parameters = reqType.parameters.filter(
              (el) => el.name !== "Authorization"
            );
            reqType.security = security;
          }
        }
        /* query */
        for (let qObj of reqType.parameters) {
          if (qObj.in === "query") {
            qObj.required = false;
          }
          if (qObj.in === "formData") {
            qObj.type = "file";
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
