const functions = require("firebase-functions");

// // Create and deploy your first functions
// // https://firebase.google.com/docs/functions/get-started
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

// The Firebase Admin SDK to access Firestore.
const admin = require("firebase-admin");
admin.initializeApp();

/////my jargon first///////////////////////////////////////////
// const async = require("async");
// const get = require("async-get-file");

// async function main() {
//   var url = "http://i.imgur.com/G9bDaPH.jpg";
//   var options = {
//     directory: "./images/cats/",
//     filename: "cat.gif",
//   };
//   await get(url, options);
// }

// main();
const fs = require("fs");
const https = require("https");

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
// const dest = "./alternate-node-red-installer.zip";
const dest = "./css_tutorials.zip";
// const url =
//   "https://codeload.github.com/TotallyInformation/alternate-node-red-installer/zip/master";
// const url =
//   "https://codeload.github.com/El-Nico/css_tutorials/legacy.zip/refs/heads/main";
// const url = "https://codeload.github.com/El-Nico/css_tutorials/legacy.zip/main";
const url =
  "https://github.com/El-Nico/css_tutorials/archive/refs/heads/main.zip";
// download(url, dest, function () {
//   console.log("Done");
// });
/////////end of my jargon//////////////////

// Take the text parameter passed to this HTTP endpoint and insert it into
// Firestore under the path /messages/:documentId/original
exports.addMessage = functions.https.onRequest(async (req, res) => {
  // Grab the text parameter.
  const original = req.query.text;
  // Push the new message into Firestore using the Firebase Admin SDK.
  const writeResult = await admin
    .firestore()
    .collection("messages")
    .add({ original: original });
  // Send back a message that we've successfully written the message
  res.json({ result: `Message with ID: ${writeResult.id} added.` });
});

// Listens for new messages added to /messages/:documentId/original and creates an
// uppercase version of the message to /messages/:documentId/uppercase
exports.makeUppercase = functions.firestore
  .document("/messages/{documentId}")
  .onCreate((snap, context) => {
    // Grab the current value of what was written to Firestore.
    const original = snap.data().original;

    // Access the parameter `{documentId}` with `context.params`
    functions.logger.log("Uppercasing", context.params.documentId, original);

    const uppercase = original.toUpperCase();

    // You must return a Promise when performing asynchronous tasks inside a Functions such as
    // writing to Firestore.
    // Setting an 'uppercase' field in Firestore document returns a Promise.
    return snap.ref.set({ uppercase }, { merge: true });
  });

////do my jargon here////
exports.download = functions
  .runWith({
    // Ensure the function has enough memory and time
    // to process large files
    timeoutSeconds: 300,
    memory: "1GB",
  })
  .https.onRequest(async (req, res) => {
    // Grab the text parameter.
    const original = req.query.text;
    const dest = "./css_tutorials.zip";
    // const url =
    //   "https://codeload.github.com/TotallyInformation/alternate-node-red-installer/zip/master";
    //downloads a partial file of url? because its only a small chunk
    const url =
      "https://codeload.github.com/El-Nico/css_tutorials/legacy.zip/refs/heads/main";
    // const url =
    //   "https://github.com/El-Nico/css_tutorials/archive/refs/heads/main.zip";
    /////fewd
    // const url = "https://codeload.github.com/El-Nico/fewd_lab_3/zip/master";
    // const url =
    //   "https://github.com/El-Nico/fewd_lab_3/archive/refs/heads/master.zip";
    // const url =
    //   "https://codeload.github.com/El-Nico/fewd_lab_3/legacy.zip/refs/heads/master";

    download(url, dest, function () {
      console.log("Done");
      res.json({ result: `Message with ID: ${dest} added.` });
    });
    // res.json({ result: `Message with ID: ${dest} added.` });
  });

///end of my jargon////
