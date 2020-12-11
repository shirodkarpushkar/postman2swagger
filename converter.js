const fs = require("fs");
const util = require("util");
const axios = require("axios");
const apimaticURl = "https://www.apimatic.io";
const prompt = require("prompt");
const cliProgress = require("cli-progress");
const getPrompt = util.promisify(prompt.get).bind(prompt);
const userCookie =
  "ARRAffinity=c4cced93e081fc84252c23f77fbd1dc046c6a93848216c1b7fe9d02c3b3aae19; _ga=GA1.2.622330100.1602079268; _hjTLDTest=1; _hjid=f0664776-36e2-4008-8a2c-612005c2b363; __zlcmid=10YjUY7mCVwtOph; ASP.NET_SessionId=iuev3kmsg2wo5yrfgt4pxvg2; ajs_anonymous_id=%220e5c0b74-d427-4ef4-8737-57cbaf81ffb1%22; ajs_user_id=%225f7dca646d4a3b2b5ca494dc%22; __hstc=245086810.de786c70f41fba724aec6d032283843c.1602079339139.1602079339139.1602079339139.1; hubspotutk=de786c70f41fba724aec6d032283843c; __hssrc=1; __RequestVerificationToken=Wp3ZEbLoOtg1kBOiP4yRp8LheNgpbdYNTO9qmhTNj841sgaH1K-DL4Q7sWWBoZ5RHretMgTbDBjsOUwf-2rxXKQ-36Q5A_2OCgusDIiP82o1; ARRAffinity=d4a4560214f4dc85d7daee51e6fc1642f6c8b71311c4f3e8914ffd673aff1e15; ARRAffinitySameSite=d4a4560214f4dc85d7daee51e6fc1642f6c8b71311c4f3e8914ffd673aff1e15; mp_c20ead2eb17ee9ae6aad08545e86c00d_mixpanel=%7B%22distinct_id%22%3A%20%22175035daafe74f-0c6b84c61cc6cd-333376b-1aeaa0-175035daaff600%22%2C%22%24device_id%22%3A%20%22175035daafe74f-0c6b84c61cc6cd-333376b-1aeaa0-175035daaff600%22%2C%22%24initial_referrer%22%3A%20%22%24direct%22%2C%22%24initial_referring_domain%22%3A%20%22%24direct%22%2C%22mp_lib%22%3A%20%22Segment%3A%20web%22%2C%22__alias%22%3A%20%225f7dca646d4a3b2b5ca494dc%22%2C%22%24user_id%22%3A%20%225f7dca646d4a3b2b5ca494dc%22%2C%22mp_name_tag%22%3A%20%22shirodkarpushkar.9%40gmail.com%22%2C%22userName%22%3A%20%22shirodkarpushkar.9%40gmail.com%22%2C%22id%22%3A%20%225f7dca646d4a3b2b5ca494dc%22%2C%22%24email%22%3A%20%22shirodkarpushkar.9%40gmail.com%22%2C%22%24username%22%3A%20%22shirodkarpushkar.9%40gmail.com%22%7D; .AspNet.ApplicationCookie=Yzyj85caea2KeVj6TNkKdpbgvvjRiVXF2XrAJhvLFOsoVEU9RPO_E80OC6QeNSVW1QtpMKTuuvjI-EKH9Pd2F3wD__br3RFYkuDWezEhiVz2K-zPcmjeMAbEzSYp0La9pO4tP2kbRY3vI0LsPqetYcXcFySEXEMW-nPg2Le3BKG6X40lxTId6yv2yYXVKR7VH3gF2wDPJp0hITqTQa7ruOKo92u4e1XSQqnUhpdjHYI6znF1A3TajcfdVK4BVGNOzKUJVtQqUBltxjEowboRPwXAgY49WRmJQjSrJvWu01i8AtcmY2ika95ygf8YQsgG-3gCXCsGbsQhggzU1fR5ZcxENWVMGngBuAAz6-yTvyI8hx84vcpVRo66jYG-hBXYLSKZ-iYh6KS4rliGf-A1jI3BCTK1Atec3EqI66phQ7_2R1JvIRyjjAys98O044UV4ytL21tpxo5g7EXU0E28Mv_WmBBRJtq8_7KHIITUP3U; _gid=GA1.2.1399286211.1607662398; _gat=1; _hjIncludedInPageviewSample=1; _hjAbsoluteSessionInProgress=0; _hjIncludedInSessionSample=1";

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
