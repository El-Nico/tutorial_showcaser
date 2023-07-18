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

{
  /* <input
type="text"
placeholder="Name..."
onChange={(e) => {
  setNewName(e.target.value);
}}
/>
<input
type="number"
placeholder="Age..."
onChange={(e) => {
  setNewAge(e.target.value);
}}
/>
<button onClick={createUser}>Create User</button>
{users.map((user) => {
return (
  <div>
    {" "}
    <h1>Name: {user.name}</h1>
    <h1>Age: {user.age}</h1>
    <button
      onClick={() => {
        updateUser(user.id, user.age);
      }}
    >
      Increase Age
    </button>
    <button
      onClick={() => {
        deleteUser(user.id);
      }}
    >
      Delete User
    </button>
  </div>
);
})} */
  // getAccessToken().then((token) => {
  //   const site_id = MY_APP.SITE_ID;
  //   // createPreviewChannel(site_id, token, "eatdapupu");
  //   //done successfully, channelId is literally just the name
  //   deletePreviewChannel(site_id, token, "eatdapupu");
  // });
  // res.end("done");
}

// function download(url, dest, cb) {
//   const file = fs.createWriteStream(dest);
//   const request = https
//     .get(url, function (response) {
//       response.pipe(file);
//       file.on("finish", function () {
//         file.close(cb); // close() is async, call cb after close completes.
//       });
//     })
//     .on("error", function (err) {
//       // Handle errors
//       fs.unlink(dest); // Delete the file async. (But we don't check the result)
//       if (cb) cb(err.message);
//     });
// }

// file.on("finish", function () {
//   //   console.log("sub download finsisheshe from inside sub download");
//   //   file.close(function () {
//   //     const zipFolder = fs
//   //       .readdirSync(dest, { withFileTypes: true })
//   //       .filter((item) => item.isDirectory())
//   //       .map((item) => item.name)[0];
//   //     const zipFolderUrl = dest + "/" + zipFolder;
//   //     resolve(zipFolderUrl);
//   //   }); // close() is async, call cb after close completes.
//   file.close();
//   const zipFolder = fs
//     .readFileSync(dest, { withFileTypes: true })
//     .filter((item) => item.isDirectory())
//     .map((item) => item.name)[0];
//   const zipFolderUrl = dest + "/" + zipFolder;
//   resolve(zipFolderUrl);
// });

// {
//   lesson1:[incexjs,html,css]
//   lesson2:[public/indexjs,html,css]
// }

// open each lesson
// scan through it from top to bottom
// when you find public folder

// SWITCH CONTEXT
// delete everything from current flat array

// the index all files process is a trailing process following
// the intellisense of finding out publlic or readme etc

// trailing process

// first layer
// no operations,just get list of lessons
// start loop for
// second layer
// operation 1 check for public folder
// 	if found delete everything else but public folder async
// 		index all files in public folder
// 	if not found index all files in folder
// on complete post index files in format lesson2:[public/html,index.js etc]

//   const diri=fs.opendirSync(readDir)
//   for await (const entry of diri) {
//     console.log("Found file:", entry.name);
// }

// const testTreeObj = {
//   "01_basic_app": [
//     "react_course-main/01_basic_app/index.css",
//     "react_course-main/01_basic_app/index.html",
//     "react_course-main/01_basic_app/index.js",
//   ],
//   "02_props_joke_and_punchline_app": [
//     "react_course-main/02_props_joke_and_punchline_app/public/favicon.ico",
//     "react_course-main/02_props_joke_and_punchline_app/public/index.html",
//     "react_course-main/02_props_joke_and_punchline_app/public/logo192.png",
//     "react_course-main/02_props_joke_and_punchline_app/public/logo512.png",
//     "react_course-main/02_props_joke_and_punchline_app/public/manifest.json",
//     "react_course-main/02_props_joke_and_punchline_app/public/robots.txt",
//   ],
//   "01_basic_composable": [
//     "react_course-main/01_basic_composable/index.css",
//     "react_course-main/01_basic_composable/index.html",
//     "react_course-main/01_basic_composable/index.js",
//   ],
// };

// const curarr = operationDetails.mappedFileList;
//               for (let i = 0; i < curarr.length; i++) {
//                 console.log(curarr[i]);
//                 promises.push(
//                   uploadVersionFile(
//                     curarr[i].buffer,
//                     curarr[i].hex,
//                     MY_APP.SITE_ID,
//                     operationDetails.version_id,
//                     token
//                   )
//                 );
//                 console.log(promises);
//               }

// console.log(process.cwd());
//   console.log(os.tmpdir());
//   fs.readdirSync(process.cwd()).forEach((file) => {
//     console.log(file);
//   });
//   fs.writeFileSync(os.tmpdir() + "/test.txt", "hello world", "utf8");
//   let read = fs.readFileSync(os.tmpdir() + "/test.txt", "utf8"); // /tmp/test.txt
//   res.status(200).send(read);

//   firestore
//     .collection("crontest")
//     .add({ message: "every 60 seconds in africa a minute passes" });
