require("dotenv").config();
console.log(process.env);
const functions = require("firebase-functions");
// The Firebase Admin SDK to access Firestore.
const admin = require("firebase-admin");
admin.initializeApp();

const fs = require("fs");
const https = require("https");
const decompress = require("decompress");
const { google } = require("googleapis");
const crypto = require("crypto");

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

function download(url, dest, cb) {
  const file = fs.createWriteStream(dest);
  const request = https
    .get(url, function (response) {
      response.pipe(file);
      file.on("finish", function () {
        file.close(cb); // close() is async, call cb after close completes.
      });
    })
    .on("error", function (err) {
      // Handle errors
      fs.unlink(dest); // Delete the file async. (But we don't check the result)
      if (cb) cb(err.message);
    });
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

////////////////////////////the begging of the end///////////////////////////
exports.testHost = functions.https.onRequest(async (req, res) => {
  // const url =
  //   "https://firebasehosting.googleapis.com/v1beta1/projects/tutorial-showcaser/sites/tutorial-showcaser";
  // https.get(url, function (response) {
  //   console.log(response);
  //   res.json({ struggle: `wee wee check con log` });
  // });

  // getAccessToken().then((token) => {
  //   makeRequest("tutorial-showcaser", token);
  // });
  const fileList = ["./15_css_grid/index.html", "./15_css_grid/style.css"];
  console.log(createFileHashes(fileList));
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

function createFileHashes(fileList) {
  const mappedFileList = fileList.map((url) => {
    const fileBuffer = fs.readFileSync(url);
    const hashSum = crypto.createHash("sha256");
    hashSum.update(fileBuffer);

    const hex = hashSum.digest("hex");
    return { url: url, hex: hex };
  });
  return mappedFileList;
}

function uploadHashesRequest() {
  const options = {
    method: "POST",
    hostname: "firebasehosting.googleapis.com",
    port: null,
    path: "/v1beta1/sites/SITE_ID/versions/VERSION_ID:populateFiles",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer ACCESS_TOKEN\n\n",
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
      files: {
        "/file1":
          "66d61f86bb684d0e35f94461c1f9cf4f07a4bb3407bfbd80e518bd44368ff8f4",
        "/file2":
          "490423ebae5dcd6c2df695aea79f1f80555c62e535a2808c8115a6714863d083",
        "/file3":
          "59cae17473d7dd339fe714f4c6c514ab4470757a4fe616dfdb4d81400addf315",
      },
    })
  );
  req.end();
}
//////////////////////////end of the begging of the end/////////////////////
