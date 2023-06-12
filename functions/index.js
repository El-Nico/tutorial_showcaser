require("dotenv").config();
const functions = require("firebase-functions");
// The Firebase Admin SDK to access Firestore.
const admin = require("firebase-admin");
admin.initializeApp();

const fs = require("fs");
const https = require("https");
const decompress = require("decompress");
const { google } = require("googleapis");
const crypto = require("crypto");
const { gzip, ungzip } = require("node-gzip");
const { MY_APP } = require("./application_constants");
const {
  createPreviewChannel,
  deletePreviewChannel,
} = require("./hosting-api-crud");
var path = require("path");

function getAccessToken() {
  var SCOPES = [
    "https://www.googleapis.com/auth/cloud-platform",
    "https://www.googleapis.com/auth/cloud-platform.read-only",
    "https://www.googleapis.com/auth/firebase",
    "https://www.googleapis.com/auth/firebase.readonly",
  ];
  return new Promise(function (resolve, reject) {
    var key = require("./tutorial-showcaser-firebase-adminsdk-1fdyi-f647ec7670.json");
    var jwtClient = new google.auth.JWT(
      key.client_email,
      null,
      key.private_key,
      SCOPES,
      null
    );
    jwtClient.authorize(function (err, tokens) {
      if (err) {
        reject(err);
        return;
      }
      resolve(tokens.access_token);
    });
  });
}

function download(url, dest) {
  console.log("inside sub download function");
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    const request = https
      .get(url, function (response) {
        response.pipe(file);
        file.on("finish", function () {
          console.log("sub download finsisheshe from inside sub download");
          file.close(); // close() is async, call cb after close completes.
          resolve(dest);
        });
      })
      .on("error", function (err) {
        // Handle errors
        fs.unlink(dest); // Delete the file async. (But we don't check the result)
        reject(err.message);
      });
  });
}

////////////////////////////the begging of the end///////////////////////////
exports.testHost = functions
  .runWith({
    // Ensure the function has enough memory and time
    // to process large files
    timeoutSeconds: 300,
    memory: "1GB",
  })
  .https.onRequest(async (req, res) => {
    // const url =
    //   "https://firebasehosting.googleapis.com/v1beta1/projects/tutorial-showcaser/sites/tutorial-showcaser";
    // https.get(url, function (response) {
    //   console.log(response);
    //   res.json({ struggle: `wee wee check con log` });
    // });
    // getAccessToken().then((token) => {
    //   makeRequest("iframe-test-id", token);
    // });
    // getAccessToken().then((token) => {
    //   const fileList = ["./15_css_grid/index.html", "./15_css_grid/style.css"];
    //   createFileHashes(fileList).then((data) => {
    //     console.log(data);
    //     uploadHashesRequest(data, "iframe-test-id", "70e03146bcbb15b5", token);
    //   });
    // });

    // fix not getting 200 here
    // getAccessToken().then((token) => {
    //   const fileBuffer = fs.readFileSync("./15_css_grid/index.html");
    //   gzip(fileBuffer)
    //     .then((compressed) => {
    //       uploadFiles(
    //         compressed,
    //         "57a727c8c0b8d8d13d521410410a1a2f5235ffce100b147e2d47bea215813a33",
    //         "iframe-test-id",
    //         "70e03146bcbb15b5",
    //         token
    //       );
    //     })
    //     .then(() => {
    //       const fileBuffer2 = fs.readFileSync("./15_css_grid/style.css");
    //       gzip(fileBuffer2).then((compressed) => {
    //         uploadFiles(
    //           compressed,
    //           "dc806bd6d94fc51406e56bfc5c98b26c36420a6067afb0bc87c1915be371122f",
    //           "iframe-test-id",
    //           "70e03146bcbb15b5",
    //           token
    //         );
    //       });
    //     });
    // });

    // getAccessToken().then((token) => {
    //   patchVersion(token, "iframe-test-id", "70e03146bcbb15b5");
    // });

    getAccessToken().then((token) => {
      deploy(token, "iframe-test-id", "70e03146bcbb15b5");
    });
  });

function makeRequest(site_id, access_token) {
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
    });
  });

  req.write(
    JSON.stringify({
      config: {
        headers: [{ glob: "**", headers: { "Cache-Control": "max-age=1800" } }],
      },
    })
  );
  req.end();
}

async function createFileHashes(fileList) {
  const mappedFileList = await Promise.all(
    fileList.map((url) => {
      const fileBuffer = fs.readFileSync(url);
      const hashSum = crypto.createHash("sha256");
      return gzip(fileBuffer).then((compressed) => {
        hashSum.update(compressed);
        const hex = hashSum.digest("hex");
        return { url: url, hex: hex };
      });
    })
  );
  console.log(mappedFileList);
  return mappedFileList;
}

function uploadHashesRequest(fileList, site_id, version_id, access_token) {
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
    });
  });

  let files = {};
  fileList.forEach((f) => {
    files[f.url.substring(1)] = f.hex;
  });
  console.log(files);
  req.write(
    JSON.stringify({
      files: files,
    })
  );
  req.end();
}

// must be done individually
async function uploadFiles(
  fileUrl,
  file_hash,
  site_id,
  version_id,
  access_token
) {
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
      console.log("the function has apperently ended");
    });
  });

  req.write(fileUrl);
  req.end();
}

function patchVersion(access_token, site_id, version_id) {
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
    });
  });

  req.write(JSON.stringify({ status: "FINALIZED" }));
  req.end();
}

function deploy(access_token, site_id, version_id) {
  const options = {
    method: "POST",
    hostname: "firebasehosting.googleapis.com",
    port: null,
    path: `/v1beta1/sites/${site_id}/releases?versionName=sites/${site_id}/versions/${version_id}`,
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
    });
  });

  req.end();
}

// Download latest archive from GitHub to temp folder
const dest = "./css_tutorials.zip";
const url =
  "https://github.com/El-Nico/react_course/archive/refs/heads/main.zip";

exports.download = functions
  .runWith({
    // Ensure the function has enough memory and time
    // to process large files
    timeoutSeconds: 300,
    memory: "1GB",
  })
  .https.onRequest(async (req, res) => {
    // Grab the text parameter.
    // const original = req.query.text;

    const dest = "./temp.zip";
    const url =
      "https://codeload.github.com/El-Nico/css_tutorials/legacy.zip/refs/heads/main";

    download(url, dest, function () {
      console.log(" zip download done");
      unzip("temp.zip", "public").then(() => {
        //perform file system operations, remove containing folder, get a list of all the names of the folders
        res.json({ result: `files unzipped to location public/` });
      });
    });
    // res.json({ result: `Message with ID: ${dest} added.` });
  });

async function unzip(url, dest) {
  try {
    console.log("decompression started");
    const files = await decompress(url, dest);
    console.log(files);
  } catch (error) {
    console.log(error);
  }
}

function downloadCourse(courseName, hostingFolder) {
  return new Promise((resolve, reject) => {
    const url =
      MY_APP.GITHUB_DOWNLOAD_URL.START +
      courseName +
      MY_APP.GITHUB_DOWNLOAD_URL.END;
    const dest = "./temp.zip";

    console.log("inside main download course function");

    download(url, dest)
      .catch((error) => {
        reject(error);
      })
      .then((temp_url) => {
        console.log(temp_url);
        console.log("zip download done");
        console.log("decompression started");
        // const regex = /.*\/public.*/gi; //this solution is too broad and doesn work when mixed
        //with regular "./" hosting folders
        return decompress(
          dest,
          "./"
          // ,{
          // filter: (file) => {
          //   console.log(file.path);
          //   // return path.extname(file.path) !== ".exe";
          //   const matches = !!file.path.match(regex);
          //   console.log(matches);
          //   return matches;
          // },
          // }
        );
      })
      .then((files) => {
        const parentDir = files[0].path.split("/")[0];
        //delete temp.zip
        fs.rmSync(dest, { recursive: true, force: true });
        console.log(parentDir, "done!");
        //next steps is to process the folder
      });
  });
}

exports.generate_showcase = functions
  .runWith({
    // Ensure the function has enough memory and time
    // to process large files
    timeoutSeconds: 300,
    memory: "1GB",
  })
  .https.onRequest(async (req, res) => {
    const courseName = req.query.course_name;
    const hostingFolder = req.query.hosting_folder || "";
    console.log(courseName, hostingFolder);

    downloadCourse(courseName, hostingFolder).then((data) => {});
  });
//////////////////////////end of the begging of the end/////////////////////
