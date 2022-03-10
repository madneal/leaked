"use strict";

chrome.browserAction.setBadgeText({ text: "" });
sourceMap.SourceMapConsumer.initialize({
        "lib/mappings.wasm": "https://unpkg.com/source-map@0.7.3/lib/mappings.wasm"
    });

let sourceFileList = {};
chrome.tabs.onActivated.addListener(() => {
  sourceFileList = {};
  setBadgeText(Object.keys(sourceFileList).length);
})

chrome.webRequest.onBeforeRequest.addListener(async (details) => {
  let text = "";
  await chrome.tabs.query({ active: true, windowId: chrome.windows.WINDOW_ID_CURRENT }, async (tabs) => {
    if (details.type === "script" && /\.js$/.test(details.url)
    && !/^chrome-extension:\/\//.test(details.url)) {

    const text = await request(details.url + ".map");
        if (text) {
    const consumer = await new sourceMap.SourceMapConsumer(text);
    sourceFileList[details.url] = {
      content: consumer.sourcesContent,
      sources: consumer._absoluteSources,
      page: tabs[0]
    }
    consumer.destroy();
      

  }
}
});
setBadgeText(Object.keys(sourceFileList).length);

}, {
  urls: ["<all_urls>"]
});

const isSourcemap = async (url) => {
  const res = await request(url);
  return res.includes("//# sourceMappingURL=");
}

const request = async (url) => {
  const res = await fetch(url)
  if (res.ok) {
    return res.text();
  } else {
    console.info("Request to " + url + " error with status " + res.status);
  }
}

var setBadgeText = function setBadgeText(num) {
  var text = num > 0 ? "" + num : "";
  chrome.browserAction.setBadgeText({ text: text });
};

chrome.extension.onConnect.addListener(function (port) {
  port.postMessage(Object.keys(sourceFileList).map(function (key) {
    return {
      url: key,
      content: sourceFileList[key].content,
      page: sourceFileList[key].page,
      filenames: sourceFileList[key].sources
    };
  }));
});