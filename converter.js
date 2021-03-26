const fs = require("fs");
const util = require("util");
const axios = require("axios");
const apimaticURl = "https://www.apimatic.io";
const prompt = require("prompt");
const cliProgress = require("cli-progress");
const getPrompt = util.promisify(prompt.get).bind(prompt);

const userCookie =
  "ARRAffinity=a6b2330be52e6c9af6cafe1b09151775637b5a8b7c30c12e61f1e07c8d2bdfd0; ARRAffinitySameSite=a6b2330be52e6c9af6cafe1b09151775637b5a8b7c30c12e61f1e07c8d2bdfd0; nf_ab=0.406456; ARRAffinity=d4a4560214f4dc85d7daee51e6fc1642f6c8b71311c4f3e8914ffd673aff1e15; ARRAffinitySameSite=d4a4560214f4dc85d7daee51e6fc1642f6c8b71311c4f3e8914ffd673aff1e15; _ga=GA1.2.418011580.1616733739; _gid=GA1.2.135197888.1616733739; _gat=1; _hjTLDTest=1; _hjid=9cc46880-56ca-4e47-88de-d0864f71e5ab; _hjFirstSeen=1; __zlcmid=13IjuLj3Q6Na2sg; __RequestVerificationToken=5Ih8ca3KFcSrKbR68MKTq7PMuuI5lTXONIGhfWCsWpah-3WeB52PkbgLuKx6y0yBAfu_xrY2wjxfYpUdEO5OWzIQRk1T4P4JRlPu2NmRDM41; .AspNet.ApplicationCookie=LIp2WPPMq4QT-G8DXoqYOfsNIHWqBWRF2cCTF2pSJumCRZuxQ5QluCkKoPtmfJDBdZB3f2bXEDJPajOigZV9U9dlYtWbJ9AqHSjA1QUNRTaZgau8fSwH_8FBnpLNbicVHC-cxWTaARwnhw1Kis9uSLQkq8SjcWWzBv1QsC_uggkC6nPrkcH5VwdIH8s5wDV0E38dNdAqbTVbgBibNltgb4FZrSrsupDng4BMX2Jkpib-MVqHTjKVudjebjBegtGsQ4Q5Rf2LFTaTagRp64l0B7L66s3p4jWfiHkoEuYFEMp3aJPIl9aztUfoXuDfUyibcD9Mr5R_7JeSOh51IxszF85TF7YbSBw9pBqS45ABA5HUzVPmGcxlFewNvLx5cwaW-jzZLob1XkaKdvSQwq5q4HXJJ-RZdxpbVryUVDciRMp7DIVDx_eqEkkIQu_S1Jw0ovO4Wkpv3TFbh4EV1v6xFObIC5hkFRWOhtOFjF_KAUs; ajs_user_id=%225f7dca646d4a3b2b5ca494dc%22; ajs_anonymous_id=%2237df0466-f20d-4acc-9d0d-04f3b5447dc3%22";

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
