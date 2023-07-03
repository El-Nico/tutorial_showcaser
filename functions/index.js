require("dotenv").config();
const functions = require("firebase-functions");
// The Firebase Admin SDK to access Firestore.
const admin = require("firebase-admin");
admin.initializeApp();

const fs = require("fs");
const https = require("https");
const decompress = require("decompress");
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
const firestore = admin.firestore();

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
        return decompress(dest, "./");
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
  // http://127.0.0.1:5001/tutorial-showcaser/us-central1/generate_showcase?course_name=react_course&hosting_folder=public
  //http://127.0.0.1:5001/tutorial-showcaser/us-central1/generate_showcase?course_name=css_tutorials

  ///here i would start by deleting the old details
  .runWith({
    // Ensure the function has enough memory and time
    // to process large files
    timeoutSeconds: 300,
    memory: "1GB",
  })
  .https.onRequest(async (req, res) => {
    const courseName = req.query.course_name;
    const hostingFolder = req.query.hosting_folder || "";
    let coursefolderName = "";
    console.log(courseName, hostingFolder);

    downloadCourse(courseName, hostingFolder)
      .then((courseDir) => {
        coursefolderName = courseDir;
        return buildFiles(courseDir, hostingFolder);
      })
      .then((lessonTree) => {
        getAccessToken().then((token) => {
          for (const [lessonName, lessonFiles] of Object.entries(lessonTree)) {
            let operationDetails = {
              lessonName: lessonName,
            };
            //create preview channel for lessonName
            createPreviewChannel(
              MY_APP.SITE_ID,
              token,
              operationDetails.lessonName
            )
              .then((channel) => {
                console.log("from create prev channel", channel);
                operationDetails.channel_id = channel.name.split("/")[3];
                //create version for this release
                return createVersion(MY_APP.SITE_ID, token);
              })
              .then((version) => {
                console.log("version for release", version);
                operationDetails.version_id = version.name.split("/")[3];
                //create hashes for all files to be uploaded
                return createFileHashes(lessonFiles);
              })
              //upload hashes to populate files endpoint
              //i think here is where i need to manipulate the urls
              .then((urlHexBufferTree) => {
                console.log(urlHexBufferTree);
                operationDetails.urlHexBufferTree = urlHexBufferTree;
                //get tree in aappropriate form
                const mappedTreeObj = urlHexBufferTree.reduce(
                  (mappedTree, currValue) => {
                    console.log(currValue);
                    //take away first 2 parts of url including coursname and folder name
                    const splitPoint = currValue.url
                      .split("/")
                      .includes(hostingFolder)
                      ? 3
                      : 2;
                    const url =
                      "/" +
                      currValue.url.split("/").slice(splitPoint).join("/");
                    const hex = currValue.hex;
                    const mappedCurrValue = {};
                    mappedCurrValue[url] = hex;
                    const prevValues = mappedTree.files;
                    return { files: { ...prevValues, ...mappedCurrValue } };
                  },
                  { files: {} }
                );
                console.log("reduced files", mappedTreeObj);
                const finalObj = JSON.stringify(mappedTreeObj);
                console.log(finalObj);
                //upload hexes
                return populateVersionFiles(
                  finalObj,
                  MY_APP.SITE_ID,
                  operationDetails.version_id,
                  token
                );
              })
              .then((res) => {
                //upload files
                console.log(res);
                const promises = operationDetails.urlHexBufferTree.map(
                  (file) => {
                    return uploadVersionFile(
                      file.buffer,
                      file.hex,
                      MY_APP.SITE_ID,
                      operationDetails.version_id,
                      token
                    );
                  }
                );
                return Promise.all(promises);
              })
              .then((allPromises) => {
                //delete the github folder
                console.log(allPromises);
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
                ///chanelid,versionid,lessonname,,,urlHexBufferTree
                delete operationDetails.urlHexBufferTree;
                console.log(deployedRelease);
                console.log(operationDetails);
                firestore.collection(courseName).add(operationDetails);
                //OHMYGOD IT WORKED
                /////////////////////////
                //these are precisely where you will do the next steps,
                //where you will make sure all the necessary details have been tagged onto the
                //operation details object
                //and then begin the process of uploading it to firebase
                //you can do a mock {} of the operation details object
                //or just do pseudocode tomorrow
                //newer version https://firebase.google.com/docs/functions/schedule-functions?gen=2nd
                //this the one yohttps://www.freecodecamp.org/news/how-to-schedule-a-task-with-firebase-cloud-functions/

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
          }
        });
        //delete the github folder
        // fs.rmdir(coursefolderName, { recursive: true }, () => {
        //   console.log("Successfully deleted courseFolder!");
        // });
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
//make a delete preview channel here that takes in channel nae as query
//////////////////////////end of the begging of the end/////////////////////
