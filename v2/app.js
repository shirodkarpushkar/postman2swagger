const fs = require("fs");
const util = require("util");
const axios = require("axios");
const apimaticURl = "https://www.apimatic.io";
const prompt = require("prompt");
const cliProgress = require("cli-progress");
const getPrompt = util.promisify(prompt.get).bind(prompt);
const userCookie =
  "_hjid=7dd7ac19-c82b-449f-bc4d-eb7bfe0c3d6a; _ga=GA1.2.1304799149.1610536209; ajs_user_id=%225f7dca646d4a3b2b5ca494dc%22; ajs_anonymous_id=%224718dda9-71a4-4a59-9cf1-c9e52e6eb228%22; __zlcmid=128jjREo5giTzpT; nf_ab=0.841181; ARRAffinity=d4a4560214f4dc85d7daee51e6fc1642f6c8b71311c4f3e8914ffd673aff1e15; ARRAffinitySameSite=d4a4560214f4dc85d7daee51e6fc1642f6c8b71311c4f3e8914ffd673aff1e15; __RequestVerificationToken=nPAmfiPtyC0JvaqYaN2ZCxBiLCFXTxwSu0BT1_GlBBBMlY9Q6EvtOyD829XmiB0l10pJMR6xY0wIf0Zt3uDnZbzR0ckHrFobAjV7VEQUsi41; .AspNet.ApplicationCookie=xnc0UzB4bEfgqydm0ZORrf7i1_VUiLRu0O-qUcu4ojNJpcVcaFTiJKF2c_nApZL6ftC3DH924Ts-29zgRt4E3nO6eHI4lPaj84syvd0IX0Pr_1kir4y96YJ6gkjXh29nbY1XdcfFSmuiHsHPAwDvXjZ2CQ1PChriW0eVoi5E5tvk49LkfaweMbBlyfeZAr9BUbxHaKWVMRUUf2wv8dgq2q8CebxltL36f_0LPSAZsC3Nzcu-JPHZ7HFAaueAYeqQWO4lNNCHpd4fVIldEpyYYwSxKJyqzEraZSrvdPvsqJ5EIv-CILnsoeKjxCuehtI91Xa4ksFrQVRykY6EA9lIgHd7NL-gqovDKugABjzHMGUP3VbNv_WY4f7hQIjFmWUjDzmra2MFcurv82wv5RY-Lh1CLQSDZDEYziNK16ZwiVDituR2Tp9j6KNxhrNYP08eIfBNWDPWGV6GbXWRB2PONr0QXY5z-MaGkcltunRKtOHU-Kr_xSQVeftgXwYhdURF; _gid=GA1.2.575580872.1614167069; _gat=1";

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
async function getCollection(fileUrl) {
  try {
    const response = await axios({
      method: "get",
      url: fileUrl,
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
    const collection = await getCollection(fileUrl);
    progress.update(50);
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
