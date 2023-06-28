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
  getAccessToken,
  createVersion,
  createFileHashes,
  populateVersionFiles,
  uploadVersionFile,
  finalizeVersion,
  create_deployRelease,
  deleteVersion,
} = require("./hosting-api-crud");
const path = require("path");

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

        resolve(parentDir);
      });
  });
}

function deleteAllExceptFolder(src, folder) {
  return new Promise((resolve, reject) => {
    fs.readdirSync(src).forEach((file) => {
      const Absolute = path.join(src, file);
      if (file !== folder) {
        fs.rmSync(Absolute, { recursive: true, force: true });
      }
    });
    resolve("done");
  });
}

function buildFiles(courseDir, hos) {
  return new Promise((resolve, reject) => {
    //DELETE README HERE FOR NOW
    fs.rmSync(courseDir + "/" + "README.md", { recursive: true, force: true });
    const files = fs.readdirSync(courseDir);
    // console.log(files);
    let cFiles = {};
    // let cFilesTemp = [];
    files.forEach((dir) => {
      //first  layer
      // console.log("FILE 11111111111");
      readDir = courseDir + "/" + dir;
      const subFiles = fs.readdirSync(readDir);
      const cFilesTemp = [];
      let publicFolder = readDir;
      //also conditionally check for and deal with readme here
      ///////////////////////////////////////////////
      if (subFiles.includes(hos)) {
        /// delete all others async
        /// index public async
        publicFolder = readDir + "/" + hos;
        //do this async?
        deleteAllExceptFolder(readDir, hos);
      }
      for (const filePath of walkSync(publicFolder)) {
        cFilesTemp.push(filePath.replace(/\\/g, "/"));
      }
      // console.log("this is the current cfiles for lesson " + dir, cFilesTemp);
      cFiles[dir] = cFilesTemp;
    });
    resolve(cFiles);

    function* walkSync(directory) {
      const files = fs.readdirSync(directory, { withFileTypes: true });
      for (const file of files) {
        if (file.isDirectory()) {
          yield* walkSync(path.join(directory, file.name));
        } else {
          // console.log(path.normalize(path.join(directory, file.name)));
          yield path.join(directory, file.name);
        }
      }
    }
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

    // MAIN TRACK
    // downloadCourse(courseName, hostingFolder)
    //   .then((courseDir) => {
    //     return buildFiles(courseDir, hostingFolder);
    //   })
    //   .then((fileTreeObj) => {
    //     // //STEPS
    //     // //get access token
    //     // getAccessToken().then((token) => {});
    //     // //create preview channel with obj key name
    //     // // create new version for the site
    //     // //hashify all files for upload
    //     // //upload hashes to populate files endpoint
    //     // //upload files individually in a loop
    //     // //finalize version
    //     // //create release
    //   });

    //SIDE TRACK
    //./react_course-main
    //./El-Nico-css_tutorials-8b2aa48
    //buildFiles("react_course-main", "public");

    const testTreeObj = {
      "01_basic_app": [
        "react_course-main/01_basic_app/index.css",
        "react_course-main/01_basic_app/index.html",
        "react_course-main/01_basic_app/index.js",
      ],
      "02_props_joke_and_punchline_app": [
        "react_course-main/02_props_joke_and_punchline_app/public/favicon.ico",
        "react_course-main/02_props_joke_and_punchline_app/public/index.html",
        "react_course-main/02_props_joke_and_punchline_app/public/logo192.png",
        "react_course-main/02_props_joke_and_punchline_app/public/logo512.png",
        "react_course-main/02_props_joke_and_punchline_app/public/manifest.json",
        "react_course-main/02_props_joke_and_punchline_app/public/robots.txt",
      ],
      "01_basic_composable": [
        "react_course-main/01_basic_composable/index.css",
        "react_course-main/01_basic_composable/index.html",
        "react_course-main/01_basic_composable/index.js",
      ],
    };
    ////////////////////////////////BIG LOOP//////////////////////////////////

    //upload files individually in a loop
    //finalize version
    //create release
    getAccessToken().then((token) => {
      // //STEPS
      // //create preview channel with obj key name
      let operationDetails = {
        specimen: Object.keys(testTreeObj)[1],
      };

      createPreviewChannel(MY_APP.SITE_ID, token, operationDetails.specimen)
        // // create new version for the site
        .then((channel) => {
          console.log("from create prev channel", channel);
          operationDetails.channel_id = channel.name
            ? channel.name.split("/")[3]
            : operationDetails.specimen;
          return createVersion(MY_APP.SITE_ID, token);
        })
        //hashify all files for upload
        .then((version) => {
          //need to get version id here
          console.log("actualversion", version);
          operationDetails.version_id = version.name.split("/")[3].trim();
          console.log("this is the actual vid", operationDetails.version_id);
          return createFileHashes(testTreeObj[operationDetails.specimen]);
        })
        //upload hashes to populate files endpoint
        //i think here is where i need to manipulate the urls
        .then((mappedFileList) => {
          console.log(mappedFileList);
          operationDetails.mappedFileList = mappedFileList;
          const populatFileList = mappedFileList.reduce(
            (filesObject, mappedFile) => {
              console.log(mappedFile);
              //take away first 2 parts of url including coursname and folder name
              let splitPoint = 2;
              if (mappedFile.url.split("/").includes("public")) {
                splitPoint = 3;
              }
              const urlComps =
                "/" + mappedFile.url.split("/").slice(splitPoint).join("/");
              const mahex = mappedFile.hex;
              let newObj = {};
              newObj[urlComps] = mahex;
              const initialFiles = filesObject.files;
              return { files: { ...initialFiles, ...newObj } };
            },
            { files: {} }
          );
          console.log("redyced files", populatFileList);
          const finalObj = JSON.stringify(populatFileList);
          console.log(finalObj);
          return populateVersionFiles(
            finalObj,
            MY_APP.SITE_ID,
            operationDetails.version_id,
            token
          );
        })
        .then((res) => {
          console.log(res);
          const promises = [];

          const curarr = operationDetails.mappedFileList;
          for (let i = 0; i < curarr.length; i++) {
            console.log(curarr[i]);
            promises.push(
              uploadVersionFile(
                curarr[i].buffer,
                curarr[i].hex,
                MY_APP.SITE_ID,
                operationDetails.version_id,
                token
              )
            );
            console.log(promises);
          }

          // operationDetails.mappedFileList.map((file) => {
          //   return uploadVersionFile(
          //     file.buffer,
          //     file.hex,
          //     MY_APP.SITE_ID,
          //     operationDetails.version_id,
          //     token
          //   );
          // });

          console.log(promises);

          return Promise.all(promises);
        })
        .then((allPromises) => {
          console.log(allPromises);
          ///finalize fverison
          console.log(operationDetails.version_id);
          //const mava = operationDetails.version_id;
          console.log(operationDetails.channel_id);
          return finalizeVersion(
            token,
            MY_APP.SITE_ID,
            operationDetails.version_id
          );
        })
        .then((finalizedVersion) => {
          console.log(finalizedVersion);
          return create_deployRelease(
            token,
            MY_APP.SITE_ID,
            operationDetails.version_id,
            operationDetails.channel_id
          );
        })
        .then((deployedRelease) => {
          console.log(deployedRelease);
          ///////////////////////////
          //these are precisely where you will do the next steps,
          //where you will make sure all the necessary details have been tagged onto the
          //operation details object
          //and then begin the process of uploading it to firebase
          //you can do a mock {} of the operation details object
          //or just do pseudocode tomorrow
          //newer version https://firebase.google.com/docs/functions/schedule-functions?gen=2nd
          //this the one yohttps://www.freecodecamp.org/news/how-to-schedule-a-task-with-firebase-cloud-functions/

          //////////////////////////////
          //delete stray files
          // like the react and github folders

          //////////////////////next steps 2
          //setup a function that is timebased and triggers on channel expiry
          //deletes all records from firebase
          //deletes all preview channels and versions
          //reconstructs the showcase
          //starts listening in the future again

          ///////next steps 3
          //go back to frontend, read all urls from firebase and display

          //PROVISIONAL END OF APP

          //BEGIN FINETUNIGN FASE
          //FINAL END OF APP
        });
    });
    //////////////////////////END OF BIG LOOP//////////////////////////////////////////

    ////////////////////////////ATTEMPT TO DELETE CHANNEL AND VERSION////////////////////////////////////////
    // let tokena = "";
    // getAccessToken()
    //   .then((token) => {
    //     tokena = token;
    //     return deletePreviewChannel(
    //       MY_APP.SITE_ID,
    //       token,
    //       "02_props_joke_and_punchline_app"
    //     );
    //   })
    //   .then((allPromises) => {
    //     console.log(allPromises);
    //     return deleteVersion(MY_APP.SITE_ID, tokena, "c449b362bef9bdbd");
    //   })
    //   .then((delver) => {
    //     console.log(delver);
    //   });

    ////////////////////////////////////END OF ATTEMPT TO DEL CHAN AND VERSION/////////////////////////////////
  });
//////////////////////////end of the begging of the end/////////////////////
