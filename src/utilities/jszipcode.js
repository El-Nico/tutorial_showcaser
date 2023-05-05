import { URLtoFile, URLtoFile2 } from "./filewrangler";
import { tutorials } from "./keys";
import JSZip from "jszip";

function testa() {
  const zipUrl = tutorials.css;
  console.log(zipUrl);
  URLtoFile2(zipUrl).then((myfile) => {
    loadZip(myfile);
  });
}
function loadZip(myZipFile) {
  const zip = new JSZip();
  zip.loadAsync(myZipFile).then(function (loadedZip) {
    console.log(loadedZip.files);
    // Expected outline.png, publish.png, manifest.json
  });
}

export { testa };
