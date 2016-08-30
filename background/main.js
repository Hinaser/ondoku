// Set up browser action icon according to stored configuration
chrome.storage.local.get('enabled', function(data){
    if(data.hasOwnProperty('enabled') && data.enabled){
        chrome.browserAction.setIcon({ path: "../lib/images/speaker_16.png" });
    }
    else{
        chrome.browserAction.setIcon({ path: "../lib/images/speaker_mute_16.png" });
    }
});

// Waiting for debug message coming from content script
chrome.runtime.onMessage.addListener(function(data, sender, sendResponse){
    console.log(data);
});