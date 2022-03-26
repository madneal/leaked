"use strict";

const port = chrome.extension.connect({
    name: "Communication to BackGround"
});

let contentMap = {};
port.postMessage("getAllSourceFiles");
port.onMessage.addListener(function (list) {
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
        const name = parseFileName(key);
        const object = contentMap[key];
        try {
            parseSourceMap(name, object.filenames, object.content);
        } catch (e) {
            console.error(e);
        }
    });
})

function createEle(filename) {
    const a = document.createElement('a')
    a.innerText = filename;
    return a;
}

function parseFileName(path) {
    const filename = path.split("/");
    return filename[filename.length - 1];
};

function parseSourceMap(name, filenames, contents) {
    const zip = new JSZip();
    filenames.forEach((filename, index) => {
        if (filename.indexOf("webpack://") !== 0) {
            return;
        }
        const fileContent = contents[index];
        filename = filename.replace(/^webpack:\/\//, "");
        filename = filename.replace(/^\//, "");
        filename = filename.replace(/^\~\//, "node_modules/");
        addZipFile(zip, filename, fileContent);
    });
    return zip.generateAsync({type: "blob"}).then(function (content) {
        const reader = new FileReader();
        reader.readAsDataURL(content);
        reader.onloadend = function () {
            chrome.downloads.download({
                filename: name + ".zip",
                url: reader.result
            });
        };
        chrome.browserAction.setBadgeText({text: ""});
    });
};

function addZipFile(root, filename, content) {
    var folders = filename.split("/");
    var folder = root;
    for (var i = 0; i < folders.length - 1; i++) {
        folder = folder.folder(folders[i]);
    }
    folder.file(folders[folders.length - 1], content);
};