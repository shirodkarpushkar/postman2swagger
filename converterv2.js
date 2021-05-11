const fs = require("fs");
const util = require("util");
const axios = require("axios");
const apimaticURl = "https://www.apimatic.io";
const prompt = require("prompt");
const cliProgress = require("cli-progress");
const getPrompt = util.promisify(prompt.get).bind(prompt);

const userCookie =
  "nf_ab=0.406456; _ga=GA1.2.418011580.1616733739; _hjTLDTest=1; _hjid=9cc46880-56ca-4e47-88de-d0864f71e5ab; __zlcmid=13IjuLj3Q6Na2sg; __RequestVerificationToken=5Ih8ca3KFcSrKbR68MKTq7PMuuI5lTXONIGhfWCsWpah-3WeB52PkbgLuKx6y0yBAfu_xrY2wjxfYpUdEO5OWzIQRk1T4P4JRlPu2NmRDM41; ajs_user_id=%225f7dca646d4a3b2b5ca494dc%22; ajs_anonymous_id=%2237df0466-f20d-4acc-9d0d-04f3b5447dc3%22; ARRAffinity=b6842ded35e60cb41912163207fae9c9c29821f1eeb9acbb8afd841bb6bae68b; ARRAffinitySameSite=b6842ded35e60cb41912163207fae9c9c29821f1eeb9acbb8afd841bb6bae68b; ARRAffinity=dd1b90cf7e395bf59499f21ae117170b49fe853c5a333dd0448004f87b4913ea; ARRAffinitySameSite=dd1b90cf7e395bf59499f21ae117170b49fe853c5a333dd0448004f87b4913ea; .AspNet.ApplicationCookie=V_q9dvyAbfpUNThurSfDrrpLhIXlWXwqB20yddnH_5u07tm_iCL1kHHpVzL2-WjmMGcfi3_1pcm52owLcyIyGidGdAV3whGD8zVkElijIlNUsbS6JQpsiBEzVMAHZtE3FgJN-7OwSzyQ0PZb2PWpiyAI_876ZRapVGEtP0V4bSzwzqrY2SCmyw8C40XMWsVqYM_ErKTjTCyEGJCRAae3W9sZ5dhiTzqkl5_uschNnlLLJlx_SKUVvkqmtWRCsomFsoZXNyWqKDv9iNd9UpAGV5UxlDfMk3-KRNB4Uy38OME66mBfZ3gd_R-wJHrAz_2hX6RQsxk4toT5d4cqtY7usI_Zez-7J1rnYIJ1NSSDqcZ2WK2tXAQC_F5z-FhakF-0Jqr7SWksSbiTKFsJkzjayB0pwXhd9NJqUHsWLepQCX3zkXf_KVPokTse_U8K_K-Dh7_FhLyg9k0CTnNVEb0xsGvt7d5ku9ghMI__rW2HHVc; _gid=GA1.2.1641445358.1620730793; _gat=1";

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
