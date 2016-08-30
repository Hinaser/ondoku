/**
 * Initialize correct popup icon based on current user setting.
 */
const initPopup = function(){
    // Set header title
    $('#title').text(chrome.i18n.getMessage("extensionName"));

    // Set check box label
    $('#show-play-buttons').parent().append(chrome.i18n.getMessage("showPlayButtons"));
    $('#auto-detect-language').parent().append(chrome.i18n.getMessage("autoDetectLanguage"));

    // Set icon according to current on/off setting
    chrome.storage.local.get('enabled', function(data){
        // For the first time user run this addon, voice speaking feature is disabled.
        if(data.hasOwnProperty('enabled') && data.enabled){
            setPopupIcon(true);
        }
        else{
            setPopupIcon(false);
        }
    });

    // Set selected option for language
    chrome.storage.local.get('language', function(data){
        if(data.hasOwnProperty('language') && data.language){
            setSelectedOption(data.language);
        }
    });

    // Set checkbox for showing play buttons
    chrome.storage.local.get('show_play_buttons', function(data){
        if(data.hasOwnProperty('show_play_buttons')){
            setShowButtonsCheckbox(data.show_play_buttons);
        }
    });

    // Set checkbox for auto detect language
    chrome.storage.local.get('auto_detect_language', function(data){
        if(data.hasOwnProperty('auto_detect_language')){
            setAutoDetectLangCheckbox(data.auto_detect_language);
        }
    });

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

    // Monitor langauge selection change
    $("select#locale-selection").on('change', function(){
        const lang = $("#locale-selection").val();
        chrome.storage.local.set({
            language: lang
        })
    });

    // Monitor checkbox for auto language detection
    $('#show-play-buttons').on('change', function(){
        setShowButtonsCheckbox($(this).prop('checked'));
    });

    // Monitor checkbox for auto language detection
    $('#auto-detect-language').on('change', function(){
        setAutoDetectLangCheckbox($(this).prop('checked'));
    });
};

/**
 * Change browser action icon according to the argument
 */
const setPopupIcon = function(enabled){
    if(enabled){
        $('#power-btn img').attr('src', 'power-on.png');
        $('#toggle-enable label').text(chrome.i18n.getMessage("poweredOn"));
        chrome.browserAction.setIcon({ path: "../lib/images/speaker_16.png" });
    }
    else{
        $('#power-btn img').attr('src', 'power-off.png');
        $('#toggle-enable label').text(chrome.i18n.getMessage("poweredOff"));
        chrome.browserAction.setIcon({ path: "../lib/images/speaker_mute_16.png" });
    }
};

/**
 * Set language selected in html select.
 */
const setSelectedOption = function(value){
    $("#locale-selection").find("option:contains('" + value + "')").attr("selected", true);
    chrome.storage.local.set({
        language: value
    })
};

/**
 * Setup checkbox state
 */
const setShowButtonsCheckbox = function(checked){
    if(checked){
        $("#show-play-buttons").prop('checked', 'checked');
    }
    else {
        $("#show-play-buttons").prop('checked', false);
    }

    chrome.storage.local.set({
        show_play_buttons: checked
    })
};

const setAutoDetectLangCheckbox = function(checked){
    if(checked){
        $("#auto-detect-language").prop('checked', 'checked');
        $("#locale-selection").prop('disabled', 'disabled');
    }
    else {
        $("#auto-detect-language").prop('checked', false);
        $("#locale-selection").prop('disabled', false);
    }

    chrome.storage.local.set({
        auto_detect_language: checked
    })
};

/**
 * Disable addon script
 */
const disable_addon = function (){
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

    // Change icon to power off icon
    setPopupIcon(false);

    // Save setting
    chrome.storage.local.set({
        enabled: false
    });
};

/**
 * Enable addon script.
 */
const enable_addon = function (){
    // Send a message to content-script on all tabs.
    chrome.tabs.query({ url: "*://*/*" }, function(tabs){
        for(let tab of tabs){
            chrome.tabs.sendMessage(tab.id, { enabled: true }, {}, function(data){
                if(chrome.runtime.lastError){
                    console.error(chrome.runtime.lastError);
                }
            });
        }
    });

    // Change icon to power on icon
    setPopupIcon(true);

    // Save setting
    chrome.storage.local.set({
        enabled: true
    });
};

/**
 * On document ready
 */
$(function(){
    // Set popup
    initPopup();
});
