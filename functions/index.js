require("dotenv").config();
const functions = require("firebase-functions");
const { onRequest } = require("firebase-functions/v2/https");
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
  listPreviewChannels,
} = require("./hosting-api-crud");
const path = require("path");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const firestore = admin.firestore();
const os = require("os");
const crypto = require("crypto");
const { FieldValue } = require("firebase-admin/firestore");

async function refresh_all_showcases_local() {
  let courses = (await firestore.collection("courses").get()).docs.map((doc) =>
    doc.data()
  );
  courses = courses.map((course) => {
    const courseName = course.title;
    const hostingFolder = course.hosting_folder ? course.hosting_folder : "";
    return {
      courseName: courseName,
      hostingFolder: hostingFolder,
    };
  });
  //first of all delete all
  const delAllCourseShowcaseArr = courses.reduce(
    (delPromiseArr, currentCourse) => {
      delPromiseArr.push(delete_showcase_local(currentCourse.courseName));
      return delPromiseArr;
    },
    []
  );
  const deletedAll = await Promise.all(delAllCourseShowcaseArr);
  console.log(deletedAll);

  //then generate all
  let genResults = [];
  for (const course of courses) {
    let generatedShowcase = await generate_showcase_local(
      course.courseName,
      course.hostingFolder
    );
    genResults.push(generatedShowcase);
  }

  return { deleted: deletedAll, generated: genResults };
}
exports.test_rand = onRequest(
  { timeoutSeconds: 540, memory: "1GiB" },
  async (req, res) => {
    const results = await refresh_all_showcases_local();
    res.status(200).send(results);
  }
);
//create a function, create all, deleteall, but for now lets just do schedule
exports.refresh_all_showcases = onSchedule(
  //every night at midnight
  {
    schedule: "every day 00:00",
    maxInstances: 10,
    timeoutSeconds: 540,
    memory: "1GiB",
  },
  async (event) => {
    const results = await refresh_all_showcases_local();
    console.log(results);
  }
);

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
        console.log("or perhaps the error was actually gen here");
        reject(err.message);
      });
  });
}

////////////////////////////the begging of the end///////////////////////////

function downloadCourse(courseName) {
  return new Promise((resolve, reject) => {
    const url =
      MY_APP.GITHUB_DOWNLOAD_URL.START +
      courseName +
      MY_APP.GITHUB_DOWNLOAD_URL.END;
    const dest = os.tmpdir() + "/temp.zip";

    download(url, dest)
      .catch((error) => {
        console.log("error was caouth iin her");
        reject(error);
      })
      .then((temp_url) => {
        console.log("this is before decompress");
        return decompress(dest, os.tmpdir()); //"./"
      })
      .then((files) => {
        console.log(os.tmpdir() + files[0].path);
        const parentDir = os.tmpdir() + "/" + files[0].path;
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

function generate_showcase_local(courseName, hostingFolder) {
  return new Promise((resolve, reject) => {
    const previewcollectionId =
      courseName + "_" + crypto.randomBytes(20).toString("hex");
    downloadCourse(courseName, hostingFolder)
      .then((courseDir) => {
        coursefolderName = courseDir;
        return buildFiles(courseDir, hostingFolder);
      })
      .then((lessonTree) => {
        const lessonArr = Object.entries(lessonTree);
        let deployIndex = 0;
        getAccessToken().then((token) => {
          for (const [lessonName, lessonFiles] of lessonArr) {
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
                operationDetails.channel_url = channel.url;
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
                ///chanelid,versionid,lessonname,url,,,urlHexBufferTree
                delete operationDetails.urlHexBufferTree;
                console.log(deployedRelease);
                console.log(operationDetails);
                firestore.collection(previewcollectionId).add(operationDetails);
                deployIndex += 1;

                if (lessonArr.length === deployIndex) {
                  firestore
                    .collection("courses")
                    .where("title", "==", courseName)
                    .get()
                    .then((querySnapshot) => {
                      querySnapshot.forEach((document) => {
                        document.ref.update({
                          preview_channels: previewcollectionId,
                        });
                      });
                    });
                  //delete the github folder
                  fs.rmSync(coursefolderName, { recursive: true, force: true });
                  resolve("last index deployed successfully");
                }
              });
          }
        });
      });
  });
}
//make a delete preview channel here that takes in channel nae as query
exports.delete_one_channel = functions.https.onRequest((req, res) => {
  //http://localhost:5001/tutorial-showcaser/us-central1/delete_one_channel?channel_name=07_styling_links
  channelName = req.query.channel_name;
  let tokena = "";
  getAccessToken()
    .then((token) => {
      tokena = token;
      return deletePreviewChannel(MY_APP.SITE_ID, token, channelName);
    })
    .then((allPromises) => {
      console.log(allPromises);
      // return deleteVersion(MY_APP.SITE_ID, tokena, "c449b362bef9bdbd");
    });
});

// http://127.0.0.1:5001/tutorial-showcaser/us-central1/generate_showcase?course_name=react_course&hosting_folder=public
//http://127.0.0.1:5001/tutorial-showcaser/us-central1/generate_showcase?course_name=css_tutorials
exports.generate_showcase = onRequest(
  { timeoutSeconds: 300, memory: "1GiB", maxInstances: 10 },
  async (req, res) => {
    const courseName = req.query.course_name;
    const hostingFolder = req.query.hosting_folder || "";
    generate_showcase_local(courseName, hostingFolder).then((result) => {
      res.status(200).json(result);
    });
  }
);
//make a delete preview channel here that takes in channel nae as query
exports.delete_one_channel = functions.https.onRequest((req, res) => {
  //http://localhost:5001/tutorial-showcaser/us-central1/delete_one_channel?channel_name=07_styling_links
  channelName = req.query.channel_name;
  let tokena = "";
  getAccessToken()
    .then((token) => {
      tokena = token;
      return deletePreviewChannel(MY_APP.SITE_ID, token, channelName);
    })
    .then((allPromises) => {
      console.log(allPromises);
      // return deleteVersion(MY_APP.SITE_ID, tokena, "c449b362bef9bdbd");
    });
});

async function delete_showcase_local(courseName) {
  //first get the preview collection id
  const previewcollectionId = (
    await firestore.collection("courses").where("title", "==", courseName).get()
  ).docs[0].data().preview_channels;
  console.log(previewcollectionId);
  // .then((querySnapshot) => {
  //   previewcollectionId = querySnapshot[0];
  //   console.log(previewcollectionId); //.getString("preview_channels");
  // });
  const lessons = (
    await firestore.collection(previewcollectionId).get()
  ).docs.map((doc) => doc.data());
  let tokena = "";
  return new Promise((resolve, reject) => {
    getAccessToken()
      .then((token) => {
        tokena = token;
        const deleteAllChannelArr = lessons.reduce(
          (delPromiseArr, currLesson) => {
            delPromiseArr.push(
              deletePreviewChannel(MY_APP.SITE_ID, token, currLesson.channel_id)
            );
            return delPromiseArr;
          },
          []
        );
        return Promise.all(deleteAllChannelArr);
      })
      .then((allPromises) => {
        console.log("channels deleted" + allPromises);
        const deleteAllVersionArr = lessons.reduce(
          (delPromiseArr, currLesson) => {
            delPromiseArr.push(
              deleteVersion(MY_APP.SITE_ID, tokena, currLesson.version_id)
            );
            return delPromiseArr;
          },
          []
        );
        return Promise.all(deleteAllVersionArr);
      })
      .then((allVersionPromise) => {
        console.log(allVersionPromise);
        //should get 10 items here
        //delete all documents from firebase
        const ref = firestore.collection(previewcollectionId);
        ref.onSnapshot((snapshot) => {
          snapshot.docs.forEach((doc) => {
            ref.doc(doc.id).delete();
          });
        });
        firestore
          .collection("courses")
          .where("title", "==", courseName)
          .get()
          .then((querySnapshot) => {
            querySnapshot.forEach((document) => {
              document.ref.update({
                preview_channels: FieldValue.delete(),
              });
            });
          });
        ///all documents deleted
        resolve("all documents deleted successfully");
      });
  });
}

//read a list from firebase using coursename
//for each document, delete each version, channel, release etc
//finally delete document
// http://localhost:5001/tutorial-showcaser/us-central1/delete_showcase?course_name=css_tutorials
// http://localhost:5001/tutorial-showcaser/us-central1/delete_showcase?course_name=react_course
exports.delete_showcase = onRequest(
  { timeoutSeconds: 180, maxInstances: 10 },
  async (req, res) => {
    courseName = req.query.course_name;
    delete_showcase_local(courseName).then((deleted) => {
      res.status(200).json(deleted);
    });
  }
);

///list and delete all channels method
exports.delete_all_preview_channels = functions.https.onRequest((req, res) => {
  // http://127.0.0.1:5001/tutorial-showcaser/us-central1/delete_all_preview_channels
  getAccessToken().then((token) => {
    listPreviewChannels(MY_APP.SITE_ID, token)
      .then((channelList) => {
        const deletePromises = channelList.channels
          .filter((channel) => channel.name.split("/")[3] !== MY_APP.SITE_ID)
          .map((channel) => {
            console.log(channel);
            const channelId = channel.name.split("/")[3];
            return deletePreviewChannel(MY_APP.SITE_ID, token, channelId);
          });
        return Promise.all(deletePromises);
      })
      .then((allDeletedChannels) => {
        console.log(allDeletedChannels);
        res.json(allDeletedChannels);
      });
  });
});
//////////////////////////end of the begging of the end/////////////////////
