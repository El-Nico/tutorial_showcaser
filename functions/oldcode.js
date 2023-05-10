// // Create and deploy your first functions
// // https://firebase.google.com/docs/functions/get-started
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

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

// const url =
//   "https://codeload.github.com/TotallyInformation/alternate-node-red-installer/zip/master";
// const url =
//   "https://codeload.github.com/El-Nico/css_tutorials/legacy.zip/refs/heads/main";
// const url = "https://codeload.github.com/El-Nico/css_tutorials/legacy.zip/main";

// Take the text parameter passed to this HTTP endpoint and insert it into
// Firestore under the path /messages/:documentId/original
// exports.addMessage = functions.https.onRequest(async (req, res) => {
//     // Grab the text parameter.
//     const original = req.query.text;
//     // Push the new message into Firestore using the Firebase Admin SDK.
//     const writeResult = await admin
//       .firestore()
//       .collection("messages")
//       .add({ original: original });
//     // Send back a message that we've successfully written the message
//     res.json({ result: `Message with ID: ${writeResult.id} added.` });
//   });

// Listens for new messages added to /messages/:documentId/original and creates an
// uppercase version of the message to /messages/:documentId/uppercase
// exports.makeUppercase = functions.firestore
//   .document("/messages/{documentId}")
//   .onCreate((snap, context) => {
//     // Grab the current value of what was written to Firestore.
//     const original = snap.data().original;

//     // Access the parameter `{documentId}` with `context.params`
//     functions.logger.log("Uppercasing", context.params.documentId, original);

//     const uppercase = original.toUpperCase();

//     // You must return a Promise when performing asynchronous tasks inside a Functions such as
//     // writing to Firestore.
//     // Setting an 'uppercase' field in Firestore document returns a Promise.
//     return snap.ref.set({ uppercase }, { merge: true });
//   });

/////fewd
// const url = "https://codeload.github.com/El-Nico/fewd_lab_3/zip/master";
// const url =
//   "https://github.com/El-Nico/fewd_lab_3/archive/refs/heads/master.zip";
// const url =
//   "https://codeload.github.com/El-Nico/fewd_lab_3/legacy.zip/refs/heads/master";

// const url =
//   "https://codeload.github.com/TotallyInformation/alternate-node-red-installer/zip/master";
//downloads a partial file of url? because its only a small chunk
// const url =
//   "https://codeload.github.com/El-Nico/css_tutorials/legacy.zip/refs/heads/main";
