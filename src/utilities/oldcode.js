////////////////////////zip stuff//////////
// testa();
//downloadFile(tutorials.css, "xy.zip");
// getgit("El-Nico", "css_tutorials", "README.md").then((data) => {
//   console.log("data shortly");
//   console.log(data);
// });
// const navigate = useNavigate();

// window.location.assign(
//   "https://github.com/El-Nico/css_tutorials/archive/refs/heads/main.zip"
// );

// getgit2("El-Nico", "fewd_lab_3", "01_lesson").then((data) => {
//     console.log(data);
//   });

//   //////////////////end of zip stuff//////////////
//   const [imageUpload, setImageUpload] = useState(null);
//   const [imageList, setImageList] = useState([]);

//   const imageListRef = ref(storage, "images/");
//   const uploadImage = () => {
//     if (imageUpload == null) return;
//     // const imageRef = ref(storage, `images/${imageUpload.name + v4()}`);
//     // uploadBytes(imageRef, imageUpload).then((snapshot) => {
//     //   alert("Image uploaded");
//     //   getDownloadURL(snapshot.ref).then((url) => {
//     //     setImageList((prev) => [...prev, url]);
//     //   });
//     // });
//     /////////////////////ma own jargon//////////////////////////////

// const myFile = URLtoFile(
//     "https://i.insider.com/602d763842b84000192f4072?width=1136&format=jpeg"
//   ).then((myfile) => {
//     const imageRef = ref(storage, `images/${v4() + myfile.name}`);
//     uploadBytes(imageRef, myfile).then((snapshot) => {
//       console.log("deep then");
//       console.log(myfile);
//       alert("Image uploaded");
//       getDownloadURL(snapshot.ref).then((url) => {
//         setImageList((prev) => [...prev, url]);
//       });
//     });
//   }); ///luh umma beast

//   /////////////////////end of ma own jargon/////////////////
// };

// useEffect(() => {
//     listAll(imageListRef).then((response) => {
//       console.log(response);
//       response.items.forEach((item) => {
//         getDownloadURL(item).then((url) => {
//           setImageList((prev) => [...prev, url]);
//         });
//       });
//     });
//   }, []);

{
  /* <input
        type="file"
        onChange={(event) => {
          setImageUpload(event.target.files[0]);
        }}
      />
      <button onClick={uploadImage}>Upload Image</button>
      {imageList.map((url) => {
        return <img src={url}></img>;
      })} */
}

/* .App {
    width: 100vw;
    height: auto;
    display: flex;
    align-items: center;
    flex-direction: column;
} */

// img {
//   width: 70vw;
//   margin: 10px;
// }

// .box:first-child {
//     background-color: blue;
//     /* define how many columns and rows this item takes */
//     /* grid-column-start: 1;
//     grid-column-end: 4;
//     grid-row-start: 1;
//     grid-row-end: 3; */
//     /* short form */
//     /* grid-column: start/end */
//     grid-column: 1 / 4;
//     grid-row: 1/3;
//     display: grid;
//     /* align-content: center;
//     justify-content: center; */
//     /* place-content: alighn justify */
//     place-content: end center;
//     place-content: center;
// }

// .box:nth-child(2) {
//     background-color: purple;
//     grid-column: 1 / 5;
//     grid-row: 3 / 4;
// }
