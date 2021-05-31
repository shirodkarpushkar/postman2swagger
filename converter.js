const fs = require("fs");
const util = require("util");
const axios = require("axios");
const apimaticURl = "https://www.apimatic.io";
const prompt = require("prompt");
const cliProgress = require("cli-progress");
const getPrompt = util.promisify(prompt.get).bind(prompt);

const userCookie =
  "nf_ab=0.406456; _ga=GA1.2.418011580.1616733739; _hjTLDTest=1; _hjid=9cc46880-56ca-4e47-88de-d0864f71e5ab; __zlcmid=13IjuLj3Q6Na2sg; __RequestVerificationToken=5Ih8ca3KFcSrKbR68MKTq7PMuuI5lTXONIGhfWCsWpah-3WeB52PkbgLuKx6y0yBAfu_xrY2wjxfYpUdEO5OWzIQRk1T4P4JRlPu2NmRDM41; ajs_user_id=%225f7dca646d4a3b2b5ca494dc%22; ajs_anonymous_id=%2237df0466-f20d-4acc-9d0d-04f3b5447dc3%22; ARRAffinity=7e14c25011784097ddc0d451abe3b6b5c9a519b22541648dfe2b37449bd7f226; ARRAffinitySameSite=7e14c25011784097ddc0d451abe3b6b5c9a519b22541648dfe2b37449bd7f226; ARRAffinity=fbc2632af13217317a11d5c6d93867e552ddc39c6ce27390238fc67b383cc91c; ARRAffinitySameSite=fbc2632af13217317a11d5c6d93867e552ddc39c6ce27390238fc67b383cc91c; .AspNet.ApplicationCookie=C00IcJtTzDhG4eNSEGs9dzWMHZLhJSsZwHmbzIjp5JbbI72_B0RsXE1_Vdn8vcmhU_wfV1whoJ8V_cvGW0WkEYeuNzTwfCE5A7VWKelU7D0VlpHVV8wnydhQxozynPTSvdiVQqulDUmB2HHCqUfpM2yUxgxVBDMFLPauA3WWR_htdG4YLoE9zbPcSlyaLw57yWszi0a24Qn_EGu2LL9U5dDb928uthqrIsENvjStkooPT2D4DPuW6LJP195-4cA8jUMcBmhyoUuopXjaxI_SynBB_flOiXGJqJsJMgOhy-rapzDmwX5pAunnCoBcBkvHRX3-J-nzUJfhaN1-Y7tv-xtSsGleRXZONcqy8eb7CdwdD7m_IsnDD_yA9o852qhjUn582qDN7ErPXqEJatrlcu7jFKmKBHVQ98Atv1LbXdxZb8mJMvGOMcD6IEs7mtphE968I79V9qig0oeNP62BuuOSpKtY26ns5KWLbDgNlBFrf2G45jWV0C66qwT0Tyjj; _gid=GA1.2.1012742715.1622474473; _gat=1";

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
