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

async function delete_all_showcases_local() {
  let courses = await firestore.collection("courses").get();
  courses = courses.docs
    .map((doc) => doc.data())
    .map((course) => {
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
  return Promise.all(delAllCourseShowcaseArr);
}

async function generate_all_showcases_local() {
  let courses = (await firestore.collection("courses").get()).docs.map((doc) =>
    doc.data()
  );
  courses = courses.map((course) => {
    const courseName = course.title;
    const hostingFolder = course.hosting_folder ? course.hosting_folder : null;
    return {
      courseName: courseName,
      hostingFolder: hostingFolder,
    };
  });
  //then generate all
  let genResults = [];
  for (const course of courses) {
    let generatedShowcase = await generate_showcase_local(
      course.courseName,
      course.hostingFolder
    );
    genResults.push(generatedShowcase);
  }

  return Promise.resolve(genResults);
}
exports.generate_all_showcases = onRequest(
  { timeoutSeconds: 300, memory: "1GiB", maxInstances: 10 },
  async (req, res) => {
    generate_all_showcases_local().then((genResults) => res.json(genResults));
  }
);

exports.delete_all_showcases = onRequest(
  { timeoutSeconds: 300, memory: "1GiB", maxInstances: 10 },
  async (req, res) => {
    delete_all_showcases_local().then((delResults) => {
      res.json(delResults);
    });
  }
);

async function refresh_all_showcases_local() {
  let courses = (
    await firestore
      .collection("showcases")
      .where("shouldUpdate", "==", true)
      .get()
  ).docs.map((doc) => doc.data());
  courses = courses.map((course) => {
    const title = course.title;
    const hosting_folder = course.hosting_folder ? course.hosting_folder : null;
    return {
      title,
      hosting_folder,
    };
  });
  console.log(courses);
  //first of all delete all
  const delAllCourseShowcaseArr = courses.reduce(
    (delPromiseArr, currentCourse) => {
      delPromiseArr.push(delete_showcase_local(currentCourse.title));
      return delPromiseArr;
    },
    []
  );
  const deletedAll = await Promise.all(delAllCourseShowcaseArr);
  console.log(deletedAll);

  //then generate all
  let genResults = [];
  for (const course of courses) {
    let generatedShowcase = await generate_showcase_local(course);
    genResults.push(generatedShowcase);
  }

  return { deleted: deletedAll, generated: genResults };
}
exports.test_rand = onRequest(
  { timeoutSeconds: 540, memory: "1GiB" },
  async (req, res) => {
    const results = await refresh_all_showcases_local();
    // const results = await generate_showcase_local({
    //   title: "react_course",
    //   hosting_folder: "public",
    // });
    // const results = await generate_showcase_local("css_tutorials", "");

    //test these next
    // const results = await delete_all_showcases_local();
    // const results = await generate_all_showcases_local();

    // const results = await delete_showcase_local("react_course");
    // const results = await delete_showcase_local("css_tutorials");
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
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    const request = https
      .get(url, function (response) {
        response.pipe(file);
        file.on("finish", function () {
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

function downloadCourse(courseName) {
  return new Promise((resolve, reject) => {
    const url =
      MY_APP.GITHUB_DOWNLOAD_URL.START +
      courseName +
      MY_APP.GITHUB_DOWNLOAD_URL.END;
    const dest = os.tmpdir() + "/temp.zip";

    download(url, dest)
      .catch((error) => {
        reject(error);
      })
      .then((temp_url) => {
        return decompress(dest, os.tmpdir()); //"./"
      })
      .then((files) => {
        console.log(os.tmpdir() + files[0].path);
        const parentDir = os.tmpdir() + "/" + files[0].path;
        //delete temp.zip
        fs.rmSync(dest, { recursive: true, force: true });
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

function generate_showcase_local(existingShowcase = {}) {
  return new Promise((resolve, reject) => {
    // const previewcollectionId =
    //   courseName + "_" + crypto.randomBytes(20).toString("hex");
    let showcase = {
      ...existingShowcase,
      title: existingShowcase.title,
      githubRepo:
        existingShowcase.githubRepo ||
        `https://github.com/El-Nico/${existingShowcase.title}`,
      subchannels: [],
      hasSubchannels: true,
    };

    let courseName = existingShowcase.title,
      hostingFolder = existingShowcase.hosting_folder || null;
    console.log(courseName, hostingFolder);
    downloadCourse(courseName)
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
                operationDetails.channel_id = channel.name.split("/")[3];
                operationDetails.channel_url = channel.url;
                //create version for this release
                return createVersion(MY_APP.SITE_ID, token);
              })
              .then((version) => {
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
                    const url = currValue.url.split("/").includes(hostingFolder)
                      ? currValue.url.split(
                          operationDetails.channel_id + "/" + hostingFolder
                        )[1]
                      : currValue.url.split(operationDetails.channel_id)[1];
                    console.log(url);
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
                return finalizeVersion(
                  token,
                  MY_APP.SITE_ID,
                  operationDetails.version_id
                );
              })
              .then((finalizedVersion) => {
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
                // firestore.collection(previewcollectionId).add(operationDetails);
                showcase.subchannels.push(operationDetails);
                deployIndex += 1;

                if (lessonArr.length === deployIndex) {
                  console.log(showcase);
                  firestore
                    .collection("showcases")
                    .doc(courseName)
                    .set(showcase, { merge: true });
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
  const lessons = (
    await firestore.collection("showcases").doc(courseName).get()
  ).data().subchannels;
  console.log(lessons);
  let tokena = "";
  return new Promise((resolve, reject) => {
    if (lessons === undefined) {
      resolve(courseName + " does not have subchannels");
      return;
    }
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
        //delete all documents from firebase
        firestore.collection("showcases").doc(courseName).update({
          subchannels: FieldValue.delete(),
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
