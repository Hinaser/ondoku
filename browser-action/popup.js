/**
 * Set correct popup icon to toolbar.
 */
const setPopupIcon = function(){
    // Set icon according to current on/off setting
    chrome.storage.local.get('enabled', function(data){
        // For the first time user run this addon, voice speaking feature is disabled.
        if(data.hasOwnProperty('enabled') && data.enabled){
            $('#power-btn img').attr('src', 'power-on.png');
            chrome.browserAction.setIcon({ path: "../lib/images/speaker_16.png" });
        }
        else{
            $('#power-btn img').attr('src', 'power-off.png');
            chrome.browserAction.setIcon({ path: "../lib/images/speaker_mute_16.png" });
        }
    });
};

/**
 * Disable addon script
 */
const disable_addon = function (){
    // Change icon to power off icon
    $('#power-btn img').attr('src', 'power-off.png');

    // Send a message to content-script on all tabs.
    chrome.tabs.query({}, function(tabs){
        for(let tab of tabs){
            let proto = tab.url.substr(0,6);
            if(proto === 'http:/' || proto === 'https:'){
                chrome.tabs.sendMessage(tab.id, { enabled: false }, function(data){
                });
            }
        }
    });

    // Change browser-action icon
    chrome.browserAction.setIcon({ path: "../lib/images/speaker_mute_16.png" });

    // Save setting
    chrome.storage.local.set({
        enabled: false
    });
};

/**
 * Enable addon script.
 */
const enable_addon = function (){
    // Change icon to power on icon
    $('#power-btn img').attr('src', 'power-on.png');

    // Send a message to content-script on all tabs.
    chrome.tabs.query({}, function(tabs){
        for(let tab of tabs){
            let proto = tab.url.substr(0,6);
            if(proto === 'http:/' || proto === 'https:'){
                chrome.tabs.sendMessage(tab.id, { enabled: true }, function(data){
                });
            }
        }
    });

    // Change browser-action icon
    chrome.browserAction.setIcon({ path: "../lib/images/speaker_16.png" });

    // Save setting
    chrome.storage.local.set({
        enabled: true
    });
};

/**
 * On document ready
 */
$(function(){
    // Set popup icon
    setPopupIcon();

    // Toggle addon functionality.
    $('#power-btn img').on('click', function(e){
        // Switch addon state from enabled to disabled
        if($('#power-btn img').attr('src') === 'power-on.png'){
            disable_addon();
        }
        // Switch addon state from disabled to enabled
        else{
            enable_addon();
        }
    });
});
