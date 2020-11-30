const fs = require("fs");
const util = require("util");
var swaggerJson = require("./input.json");
const axios = require("axios");
const apimaticURl = "https://www.apimatic.io";
const prompt = require("prompt");
const getPrompt = util.promisify(prompt.get).bind(prompt);

const schema = {
  properties: {
    fileUrl: {
      description: "Enter Postman Collection Url",
      required: true,
      type: "string",
    },
  },
};


const host = "52.172.133.91:5124";
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
        cookie:
          "ARRAffinity=c4cced93e081fc84252c23f77fbd1dc046c6a93848216c1b7fe9d02c3b3aae19; _ga=GA1.2.622330100.1602079268; _hjTLDTest=1; _hjid=f0664776-36e2-4008-8a2c-612005c2b363; __zlcmid=10YjUY7mCVwtOph; ASP.NET_SessionId=iuev3kmsg2wo5yrfgt4pxvg2; ajs_anonymous_id=%220e5c0b74-d427-4ef4-8737-57cbaf81ffb1%22; ajs_user_id=%225f7dca646d4a3b2b5ca494dc%22; __hstc=245086810.de786c70f41fba724aec6d032283843c.1602079339139.1602079339139.1602079339139.1; hubspotutk=de786c70f41fba724aec6d032283843c; __hssrc=1; __RequestVerificationToken=Wp3ZEbLoOtg1kBOiP4yRp8LheNgpbdYNTO9qmhTNj841sgaH1K-DL4Q7sWWBoZ5RHretMgTbDBjsOUwf-2rxXKQ-36Q5A_2OCgusDIiP82o1; ARRAffinity=d4a4560214f4dc85d7daee51e6fc1642f6c8b71311c4f3e8914ffd673aff1e15; ARRAffinitySameSite=d4a4560214f4dc85d7daee51e6fc1642f6c8b71311c4f3e8914ffd673aff1e15; mp_c20ead2eb17ee9ae6aad08545e86c00d_mixpanel=%7B%22distinct_id%22%3A%20%22175035daafe74f-0c6b84c61cc6cd-333376b-1aeaa0-175035daaff600%22%2C%22%24device_id%22%3A%20%22175035daafe74f-0c6b84c61cc6cd-333376b-1aeaa0-175035daaff600%22%2C%22%24initial_referrer%22%3A%20%22%24direct%22%2C%22%24initial_referring_domain%22%3A%20%22%24direct%22%2C%22mp_lib%22%3A%20%22Segment%3A%20web%22%2C%22__alias%22%3A%20%225f7dca646d4a3b2b5ca494dc%22%2C%22%24user_id%22%3A%20%225f7dca646d4a3b2b5ca494dc%22%2C%22mp_name_tag%22%3A%20%22shirodkarpushkar.9%40gmail.com%22%2C%22userName%22%3A%20%22shirodkarpushkar.9%40gmail.com%22%2C%22id%22%3A%20%225f7dca646d4a3b2b5ca494dc%22%2C%22%24email%22%3A%20%22shirodkarpushkar.9%40gmail.com%22%2C%22%24username%22%3A%20%22shirodkarpushkar.9%40gmail.com%22%7D; _gid=GA1.2.1625385776.1606452397; .AspNet.ApplicationCookie=WfCVu75xSKBnJh0bTjY7fyvNJdgoDTa85m0Uv9uQYivk0lQQvDdlGC1YhkXLDK4_yhY-n2otGMbSFplk_KChcaYN6k578pVCEYko1rxIaz23evp7H3YkXpdCsJW17Ejm7KLtOeDT9clt7e0Fv2HTXVdyvSabXv4VXEJo3320asnHGUMvo13-SWkd_tkGf9wiue7igHHDcppPzKPUeUB2dsB1U0QLC0jzCIu-KFpGAgLpZ9juX5EraJ2daKZKuKeAV0GyLgaQwFhIbLb2nNgKj1THYeMamdtpKAKl8byQw2IoLQsGYE2RrPQSlacGckw3Byvpvn_SsVsLdIDllufc3yZfI2FBYusiZEjihOubca6U6apBLWJ5f_kpxxj41NSqbnynbJNrgxrZrV4Ax0ASr_SF9ovdjY54XA5uoJSMeoLXRI9dNNJVkm5XS9zQlg5VqbJD6qP7xRG7dOefRebqvxWZhEtzMVhNVf7uFjnVaYw; .AspNet.ApplicationCookie=tUkdE6OpqcbiE6uNMu9-S-Py-so-6_ZO-HL7y3bfza7NCSonZWmHJ3oAP84vuxdZAg0OXB-jGxIndVOtMOykgGTt1zpP3IHdw_aHW--vm-ZhNpOjpCjXDW6TUngkxOT8gfc74jMt9TKEEJ5napkvyHhqd4dQmX0oEy25VzL2Ub8ntb7Ec_fDzqFpcjLyXxZuiQ6SMBGShJ42z98nkePrPKiCh98s48ORsTImSKF_sTEigEUr5J398VFd9ODYHrsXomtEyQsoo7vyW7Yo8GIkYMC-EcDdPxPLVFVspaz8DV6bqNzQcLzgOVd6LAkmrSY4srofDp-JyZUaKK-SlkLH_UkqU5Kc7EbUgCDZaYZAHMY5xLaexr4ADkVFdxZkF36rLMo2aJue-20BvXGPxe1T3Y4iq0efcNCV7Dy2vMM2iwJrdJaq8fhfZ_gtf386KzpNp1rlCBeJefNBIKjG8eBjztW48sHxsunYgALMNOiNpZk; ARRAffinity=d4a4560214f4dc85d7daee51e6fc1642f6c8b71311c4f3e8914ffd673aff1e15; ARRAffinitySameSite=d4a4560214f4dc85d7daee51e6fc1642f6c8b71311c4f3e8914ffd673aff1e15",
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
    console.log("error", error);
  }
}
async function getTransformFile(fileUrl) {
  try {
    const response = await axios({
      method: "get",
      url: `${apimaticURl}${fileUrl}`,
      headers: {
        cookie:
          "ARRAffinity=c4cced93e081fc84252c23f77fbd1dc046c6a93848216c1b7fe9d02c3b3aae19; _ga=GA1.2.622330100.1602079268; _hjTLDTest=1; _hjid=f0664776-36e2-4008-8a2c-612005c2b363; __zlcmid=10YjUY7mCVwtOph; ASP.NET_SessionId=iuev3kmsg2wo5yrfgt4pxvg2; ajs_anonymous_id=%220e5c0b74-d427-4ef4-8737-57cbaf81ffb1%22; ajs_user_id=%225f7dca646d4a3b2b5ca494dc%22; __hstc=245086810.de786c70f41fba724aec6d032283843c.1602079339139.1602079339139.1602079339139.1; hubspotutk=de786c70f41fba724aec6d032283843c; __hssrc=1; __RequestVerificationToken=Wp3ZEbLoOtg1kBOiP4yRp8LheNgpbdYNTO9qmhTNj841sgaH1K-DL4Q7sWWBoZ5RHretMgTbDBjsOUwf-2rxXKQ-36Q5A_2OCgusDIiP82o1; ARRAffinity=d4a4560214f4dc85d7daee51e6fc1642f6c8b71311c4f3e8914ffd673aff1e15; ARRAffinitySameSite=d4a4560214f4dc85d7daee51e6fc1642f6c8b71311c4f3e8914ffd673aff1e15; mp_c20ead2eb17ee9ae6aad08545e86c00d_mixpanel=%7B%22distinct_id%22%3A%20%22175035daafe74f-0c6b84c61cc6cd-333376b-1aeaa0-175035daaff600%22%2C%22%24device_id%22%3A%20%22175035daafe74f-0c6b84c61cc6cd-333376b-1aeaa0-175035daaff600%22%2C%22%24initial_referrer%22%3A%20%22%24direct%22%2C%22%24initial_referring_domain%22%3A%20%22%24direct%22%2C%22mp_lib%22%3A%20%22Segment%3A%20web%22%2C%22__alias%22%3A%20%225f7dca646d4a3b2b5ca494dc%22%2C%22%24user_id%22%3A%20%225f7dca646d4a3b2b5ca494dc%22%2C%22mp_name_tag%22%3A%20%22shirodkarpushkar.9%40gmail.com%22%2C%22userName%22%3A%20%22shirodkarpushkar.9%40gmail.com%22%2C%22id%22%3A%20%225f7dca646d4a3b2b5ca494dc%22%2C%22%24email%22%3A%20%22shirodkarpushkar.9%40gmail.com%22%2C%22%24username%22%3A%20%22shirodkarpushkar.9%40gmail.com%22%7D; _gid=GA1.2.1625385776.1606452397; .AspNet.ApplicationCookie=WfCVu75xSKBnJh0bTjY7fyvNJdgoDTa85m0Uv9uQYivk0lQQvDdlGC1YhkXLDK4_yhY-n2otGMbSFplk_KChcaYN6k578pVCEYko1rxIaz23evp7H3YkXpdCsJW17Ejm7KLtOeDT9clt7e0Fv2HTXVdyvSabXv4VXEJo3320asnHGUMvo13-SWkd_tkGf9wiue7igHHDcppPzKPUeUB2dsB1U0QLC0jzCIu-KFpGAgLpZ9juX5EraJ2daKZKuKeAV0GyLgaQwFhIbLb2nNgKj1THYeMamdtpKAKl8byQw2IoLQsGYE2RrPQSlacGckw3Byvpvn_SsVsLdIDllufc3yZfI2FBYusiZEjihOubca6U6apBLWJ5f_kpxxj41NSqbnynbJNrgxrZrV4Ax0ASr_SF9ovdjY54XA5uoJSMeoLXRI9dNNJVkm5XS9zQlg5VqbJD6qP7xRG7dOefRebqvxWZhEtzMVhNVf7uFjnVaYw; .AspNet.ApplicationCookie=tUkdE6OpqcbiE6uNMu9-S-Py-so-6_ZO-HL7y3bfza7NCSonZWmHJ3oAP84vuxdZAg0OXB-jGxIndVOtMOykgGTt1zpP3IHdw_aHW--vm-ZhNpOjpCjXDW6TUngkxOT8gfc74jMt9TKEEJ5napkvyHhqd4dQmX0oEy25VzL2Ub8ntb7Ec_fDzqFpcjLyXxZuiQ6SMBGShJ42z98nkePrPKiCh98s48ORsTImSKF_sTEigEUr5J398VFd9ODYHrsXomtEyQsoo7vyW7Yo8GIkYMC-EcDdPxPLVFVspaz8DV6bqNzQcLzgOVd6LAkmrSY4srofDp-JyZUaKK-SlkLH_UkqU5Kc7EbUgCDZaYZAHMY5xLaexr4ADkVFdxZkF36rLMo2aJue-20BvXGPxe1T3Y4iq0efcNCV7Dy2vMM2iwJrdJaq8fhfZ_gtf386KzpNp1rlCBeJefNBIKjG8eBjztW48sHxsunYgALMNOiNpZk; ARRAffinity=d4a4560214f4dc85d7daee51e6fc1642f6c8b71311c4f3e8914ffd673aff1e15; ARRAffinitySameSite=d4a4560214f4dc85d7daee51e6fc1642f6c8b71311c4f3e8914ffd673aff1e15",
      },
    });
    const result = response.data;
    return result;
  } catch (error) {
    console.log("error", error);
  }
}
async function convertSwaggerJSON(swaggerJson) {
  try {
    swaggerJson.host = host;
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
    console.log("error", error);
  }
}

async function main() {
  try {
    const question = await getPrompt(schema);
    const fileUrl = question.fileUrl;
    const convertedFile = await transformFile(fileUrl);
    console.log("...   Conversion Succeeded, Now getting JSON.");
    const convertedJson = await getTransformFile(convertedFile.generatedFile);
    console.log("...   Got JSON, Customizing it for better view.");
    const result = await convertSwaggerJSON(convertedJson);
    console.log("...   Swagger JSON created. Output file ==> result.json");
  } catch (error) {
    console.log(" main ~ error", error);
  }
}
main();
