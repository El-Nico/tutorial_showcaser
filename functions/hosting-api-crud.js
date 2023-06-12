require("dotenv").config();
console.log(process.env);
const functions = require("firebase-functions");
// The Firebase Admin SDK to access Firestore.
// const admin = require("firebase-admin");
// admin.initializeApp();

const fs = require("fs");
const https = require("https");
const decompress = require("decompress");
const { google } = require("googleapis");
const crypto = require("crypto");
const { gzip, ungzip } = require("node-gzip");
const { resolve } = require("path");

// ///////////////utilities///////////////////////////////////
// function getAccessToken() {
//   var SCOPES = [
//     "https://www.googleapis.com/auth/cloud-platform",
//     "https://www.googleapis.com/auth/cloud-platform.read-only",
//     "https://www.googleapis.com/auth/firebase",
//     "https://www.googleapis.com/auth/firebase.readonly",
//   ];
//   return new Promise(function (resolve, reject) {
//     var key = require("./tutorial-showcaser-firebase-adminsdk-1fdyi-f647ec7670.json");
//     var jwtClient = new google.auth.JWT(
//       key.client_email,
//       null,
//       key.private_key,
//       SCOPES,
//       null
//     );
//     jwtClient.authorize(function (err, tokens) {
//       if (err) {
//         reject(err);
//         return;
//       }
//       resolve(tokens.access_token);
//     });
//   });
// }

// export async function createFileHashes(fileList) {
//   const mappedFileList = await Promise.all(
//     fileList.map((url) => {
//       const fileBuffer = fs.readFileSync(url);
//       const hashSum = crypto.createHash("sha256");
//       return gzip(fileBuffer).then((compressed) => {
//         hashSum.update(compressed);
//         const hex = hashSum.digest("hex");
//         return { url: url, hex: hex };
//       });
//     })
//   );
//   console.log(mappedFileList);
//   return mappedFileList;
// }
////////////////////////////end of utilities/////////////////////////

/////////////////////////////channel API creation and CRUD///////////////
//create channel
//should return channell url and expiretime
exports.createPreviewChannel = function (site_id, access_token, channelId) {
  return new Promise((resolve, reject) => {
    //request options
    const options = {
      method: "POST",
      hostname: "firebasehosting.googleapis.com",
      port: null,
      path: `/v1beta1/sites/${site_id}/channels?channelId=${channelId}`,
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    };

    const req = https.request(options, function (res) {
      const chunks = [];

      res.on("data", function (chunk) {
        chunks.push(chunk);
      });

      res.on("end", function () {
        const body = Buffer.concat(chunks);
        const bodyString = body.toString();
        console.log(bodyString);
        resolve(bodyString);
      });
    });

    //channel expires in three days
    const myDate = new Date(new Date().getTime() + 3 * 24 * 60 * 60 * 1000);
    const expireTime = myDate.toISOString();

    req.write(
      JSON.stringify({
        expireTime: expireTime,
      })
    );
    req.end();
  });
};

//delete preview channel
//should return?
exports.deletePreviewChannel = function (site_id, access_token, channelId) {
  return new Promise((resolve, reject) => {
    //request options
    const options = {
      method: "DELETE",
      hostname: "firebasehosting.googleapis.com",
      port: null,
      path: `/v1beta1/sites/${site_id}/channels/${channelId}`,
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    };

    const req = https.request(options, function (res) {
      const chunks = [];

      res.on("data", function (chunk) {
        chunks.push(chunk);
      });

      res.on("end", function () {
        const body = Buffer.concat(chunks);
        const bodyString = body.toString();
        console.log(bodyString);
        resolve(bodyString);
      });
    });

    req.end();
  });
};

//NOTE: theres also method, getchannel(id) and listall channels in the api might need in futu
/////////////////////////////end of channel API creation and CRUD///////////////

////////////////////////////version/deploy API and CRUD///////////////////////////
//create version
exports.createVersion = function (site_id, access_token) {
  return new Promise((resolve, reject) => {
    //create a versopm
    const options = {
      method: "POST",
      hostname: "firebasehosting.googleapis.com",
      port: null,
      path: `/v1beta1/sites/${site_id}/versions`,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
    };
    const req = https.request(options, function (res) {
      const chunks = [];
      res.on("data", function (chunk) {
        chunks.push(chunk);
      });
      res.on("end", function () {
        const body = Buffer.concat(chunks);
        console.log(body.toString());
        resolve(body);
      });
    });
    req.write(
      JSON.stringify({
        config: {
          headers: [
            { glob: "**", headers: { "Cache-Control": "max-age=1800" } },
          ],
        },
      })
    );
    req.end();
  });
};

exports.populateVersionFiles = function (
  files,
  site_id,
  version_id,
  access_token
) {
  return new Promise((resolve, reject) => {
    //specify files for version
    const options = {
      method: "POST",
      hostname: "firebasehosting.googleapis.com",
      port: null,
      path: `/v1beta1/sites/${site_id}/versions/${version_id}:populateFiles`,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
    };
    const req = https.request(options, function (res) {
      const chunks = [];
      res.on("data", function (chunk) {
        chunks.push(chunk);
      });
      res.on("end", function () {
        const body = Buffer.concat(chunks);
        console.log(body.toString());
        resolve(body);
      });
    });
    req.write(
      JSON.stringify({
        files: files,
      })
    );
    req.end();
  });
};

exports.uploadVersionFile = function (
  //upload specifid files for version serially
  fileUrl,
  file_hash,
  site_id,
  version_id,
  access_token
) {
  return new Promise((resolve, reject) => {
    const options = {
      method: "POST",
      hostname: "upload-firebasehosting.googleapis.com",
      port: null,
      path: `/upload/sites/${site_id}/versions/${version_id}/files/${file_hash}`,
      headers: {
        Authorization: `Bearer ${access_token}`,
        "Content-Type": "application/octet-stream",
      },
    };

    const req = https.request(options, function (res) {
      const chunks = [];

      res.on("data", function (chunk) {
        chunks.push(chunk);
      });

      res.on("end", function () {
        const body = Buffer.concat(chunks);
        console.log(body.toString());
        resolve(body);
      });
    });

    req.write(fileUrl);
    req.end();
  });
};

exports.finalizeVersion = function (access_token, site_id, version_id) {
  return new Promise((resolve, reject) => {
    //confirm that the version is finalized
    const options = {
      method: "PATCH",
      hostname: "firebasehosting.googleapis.com",
      port: null,
      path: `/v1beta1/sites/${site_id}/versions/${version_id}?update_mask=status`,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
    };

    const req = https.request(options, function (res) {
      const chunks = [];

      res.on("data", function (chunk) {
        chunks.push(chunk);
      });

      res.on("end", function () {
        const body = Buffer.concat(chunks);
        console.log(body.toString());
        resolve(body);
      });
    });

    req.write(JSON.stringify({ status: "FINALIZED" }));
    req.end();
  });
};

exports.create_deployRelease = function (
  access_token,
  site_id,
  version_id,
  channelId
) {
  return new Promise((resolve, reject) => {
    //deploy finalized files
    const options = {
      method: "POST",
      hostname: "firebasehosting.googleapis.com",
      port: null,
      path: `/v1beta1/sites/${site_id}/channels/${channelId}/releases?versionName=sites/${site_id}/versions/${version_id}`,
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    };

    const req = https.request(options, function (res) {
      const chunks = [];

      res.on("data", function (chunk) {
        chunks.push(chunk);
      });

      res.on("end", function () {
        const body = Buffer.concat(chunks);
        console.log(body.toString());
        resolve(body);
      });
    });

    req.end();
  });
};

exports.deleteVersion = function (site_id, access_token, version_id) {
  return new Promise((resolve, reject) => {
    const options = {
      method: "DELETE",
      hostname: "firebasehosting.googleapis.com",
      port: null,
      path: `/v1beta1/sites/${site_id}/versions/${version_id}`,
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    };

    const req = https.request(options, function (res) {
      const chunks = [];

      res.on("data", function (chunk) {
        chunks.push(chunk);
      });

      res.on("end", function () {
        const body = Buffer.concat(chunks);
        const bodyString = body.toString();
        console.log(bodyString);
        resolve(body);
      });
    });

    req.end();
  });
};

////////////////////////////end of version/deploy API and CRUD///////////////////////////

// function uploadHashesRequest(fileList, site_id, version_id, access_token) {
//   //specify files for version
//   const options = {
//     method: "POST",
//     hostname: "firebasehosting.googleapis.com",
//     port: null,
//     path: `/v1beta1/sites/${site_id}/versions/${version_id}:populateFiles`,
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: `Bearer ${access_token}`,
//     },
//   };

//   const req = https.request(options, function (res) {
//     const chunks = [];

//     res.on("data", function (chunk) {
//       chunks.push(chunk);
//     });

//     res.on("end", function () {
//       const body = Buffer.concat(chunks);
//       console.log(body.toString());
//     });
//   });

//   let files = {};
//   fileList.forEach((f) => {
//     files[f.url.substring(1)] = f.hex;
//   });
//   console.log(files);
//   req.write(
//     JSON.stringify({
//       files: files,
//     })
//   );
//   req.end();
// }

// // must be done individually
// async function uploadFiles(
//   //upload specifid files for version serially
//   fileUrl,
//   file_hash,
//   site_id,
//   version_id,
//   access_token
// ) {
//   const options = {
//     method: "POST",
//     hostname: "upload-firebasehosting.googleapis.com",
//     port: null,
//     path: `/upload/sites/${site_id}/versions/${version_id}/files/${file_hash}`,
//     headers: {
//       Authorization: `Bearer ${access_token}`,
//       "Content-Type": "application/octet-stream",
//     },
//   };

//   const req = https.request(options, function (res) {
//     const chunks = [];

//     res.on("data", function (chunk) {
//       chunks.push(chunk);
//     });

//     res.on("end", function () {
//       const body = Buffer.concat(chunks);
//       console.log(body.toString());
//       console.log("the function has apperently ended");
//     });
//   });

//   req.write(fileUrl);
//   req.end();
// }

// function patchVersion(access_token, site_id, version_id) {
//   //confirm that the version is finalized
//   //uhm this is actually the create release api ive already don ite
//   const options = {
//     method: "PATCH",
//     hostname: "firebasehosting.googleapis.com",
//     port: null,
//     path: `/v1beta1/sites/${site_id}/versions/${version_id}?update_mask=status`,
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: `Bearer ${access_token}`,
//     },
//   };

//   const req = https.request(options, function (res) {
//     const chunks = [];

//     res.on("data", function (chunk) {
//       chunks.push(chunk);
//     });

//     res.on("end", function () {
//       const body = Buffer.concat(chunks);
//       console.log(body.toString());
//     });
//   });

//   req.write(JSON.stringify({ status: "FINALIZED" }));
//   req.end();
// }

// function deploy(access_token, site_id, version_id) {
//   //deploy finalized files
//   const options = {
//     method: "POST",
//     hostname: "firebasehosting.googleapis.com",
//     port: null,
//     path: `/v1beta1/sites/${site_id}/releases?versionName=sites/${site_id}/versions/${version_id}`,
//     headers: {
//       Authorization: `Bearer ${access_token}`,
//     },
//   };

//   const req = https.request(options, function (res) {
//     const chunks = [];

//     res.on("data", function (chunk) {
//       chunks.push(chunk);
//     });

//     res.on("end", function () {
//       const body = Buffer.concat(chunks);
//       console.log(body.toString());
//     });
//   });

//   req.end();
// }
// //////////////////////////end of the begging of the end/////////////////////
