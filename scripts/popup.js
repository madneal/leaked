"use strict";

var port = chrome.extension.connect({
  name: "Communication to BackGround"
});

let contentMap = {};
port.postMessage("getAllSourceFiles");
port.onMessage.addListener(function (list) {
  console.log(list);
  list.forEach(item => {
    contentMap[item.url] = {
      title: item.page.title,
      content: item.content,
      filenames: item.filenames
    };
  })
});

document.querySelector('#app a').addEventListener("click", async () => {
    Object.keys(contentMap).forEach(function (key) {
    var name = parseFileName(key);
    const object = contentMap[key];
    try {
      parseSourceMap(name, object.filenames, object.content);
    } catch (e) {
      console.error(e);
    }
  });
})


var parseFileName = function parseFileName(path) {
  var filename = path.split("/");
  return filename[filename.length - 1];
};

var parseSourceMap = function parseSourceMap(name, filenames, contents) {
  var zip = new JSZip();
  filenames.forEach((filename, index) => {
      if (filename.indexOf("webpack://") !== 0) {
        return;
      }
      var fileContent = contents[index];
      filename = filename.replace(/^webpack:\/\//, "");
      filename = filename.replace(/^\//, "");
      filename = filename.replace(/^\~\//, "node_modules/");
      addZipFile(zip, filename, fileContent);
  });
      return zip.generateAsync({ type: "blob" }).then(function (content) {
      var reader = new FileReader();
      reader.readAsDataURL(content);
      reader.onloadend = function () {
        chrome.downloads.download({
          filename: name + ".zip",
          url: reader.result
        });
      };
    });
};

var addZipFile = function addZipFile(root, filename, content) {
  var folders = filename.split("/");
  var folder = root;
  for (var i = 0; i < folders.length - 1; i++) {
    folder = folder.folder(folders[i]);
  }

  folder.file(folders[folders.length - 1], content);
};

function fileSizeIEC(a, b, c, d, e) {
  return (b = Math, c = b.log, d = 1024, e = c(a) / c(d) | 0, a / b.pow(d, e)).toFixed(2) + " " + (e ? "KMGTPEZY"[--e] + "B" : "Bytes");
}