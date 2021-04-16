const fs = require("fs");
const util = require("util");
const axios = require("axios");
const apimaticURl = "https://www.apimatic.io";
const prompt = require("prompt");
const cliProgress = require("cli-progress");
const getPrompt = util.promisify(prompt.get).bind(prompt);

const userCookie =
  "nf_ab=0.406456; _ga=GA1.2.418011580.1616733739; _hjTLDTest=1; _hjid=9cc46880-56ca-4e47-88de-d0864f71e5ab; __zlcmid=13IjuLj3Q6Na2sg; __RequestVerificationToken=5Ih8ca3KFcSrKbR68MKTq7PMuuI5lTXONIGhfWCsWpah-3WeB52PkbgLuKx6y0yBAfu_xrY2wjxfYpUdEO5OWzIQRk1T4P4JRlPu2NmRDM41; ajs_user_id=%225f7dca646d4a3b2b5ca494dc%22; ajs_anonymous_id=%2237df0466-f20d-4acc-9d0d-04f3b5447dc3%22; ARRAffinity=e178cdb6e90d408db5018899671eaf69c219a38893ec63a4f3ea53c4db939ae0; ARRAffinitySameSite=e178cdb6e90d408db5018899671eaf69c219a38893ec63a4f3ea53c4db939ae0; ARRAffinity=ba05018c644f7992c2974188376fae09b4c2e35f97fa1f0d928c06d8ea7232ce; ARRAffinitySameSite=ba05018c644f7992c2974188376fae09b4c2e35f97fa1f0d928c06d8ea7232ce; _gid=GA1.2.1103257095.1618548094; .AspNet.ApplicationCookie=jodzBMbhsBU01kaTnDLzyRneVPchCpgO4ZLyYQG32IxkkBu6TfElgxepP_0xo7L59t3HVooNeUyuQQGJglFLuKBWuFIC4DzUcyhG4-KcbG5KvE53cdrI_bCijPtfQLhWj0Ow0A5-aQpj6Yhm7m8QjGOkJekC4Z9mjYhQlWYXO3D6m3s07lFEx3ME_m7fLHjtZPIi7Awfp93LgyZW8OvgyhgkIyJnjUA14Hk3K965_xIAr9iJmFBuwIBFiSW-IiHHGhmO0bLovVAuTFTTA6Vkz5GsO_AaKdktOBoCM21EZ0LErk_v_cSWYwRRpxHIjMG-9VeKqoJZoiYYl2oFt9b2s5gHYO_VnKAQd0t1pKpHVX83YIWCO65RdxQ0KHcVRM8PHGMU0jcM84oFYpKXFO7UG9Uq5w4fsGp4y_LFtuG6z0PzI0PJBhX-Ej58L_zKDNxncCVuQLAhLfYb0iNzBJ5S8OwkUEFu8s9ip02iEsZAGhBEaaexlwsMQblRPYf4Ns3x";

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
