/**
 * Initialize correct popup icon based on current user setting.
 */
const initPopup = function(){
    // Set header title
    $('#title').text(chrome.i18n.getMessage("extensionName"));

    // Set up i18n
    $('#show-play-buttons').parent().append(chrome.i18n.getMessage("showPlayButtons"));
    $('#auto-detect-language').parent().append(chrome.i18n.getMessage("autoDetectLanguage"));
    $("#manual-voice-selection header").text(chrome.i18n.getMessage("manualVoiceSelect"));
    $("#manual-voice-selection header").attr("title", chrome.i18n.getMessage("titleManualVoiceSelect"));
    $(".preferable-voices header").text(chrome.i18n.getMessage("labelPreferableVoice"));
    $(".preferable-voices header").attr("title", chrome.i18n.getMessage("titlePreferableVoice"));

    // Set initial settings from saved setting.
    chrome.storage.local.get([
        "enabled",
        "language",
        "show_play_buttons",
        "auto_detect_language",
        "preferable_voice_English",
        "preferable_voice_Portuguese",
        "preferable_voice_Spanish",
        "preferable_voice_Serbo",
        "preferable_voice_Romanian"
    ], function(data){
        if(data.hasOwnProperty('enabled')){
            setPopupIcon(data.enabled);
        }
        // For the first time user run this extension, voice speaking feature is disabled by default.
        else{
            setPopupIcon(false);
        }

        if(data.hasOwnProperty('language') && data.language){
            setSelectedOption(data.language);
        }

        if(data.hasOwnProperty('show_play_buttons')){
            setShowButtonsCheckbox(data.show_play_buttons);
        }
        // By default, this option should be true.
        else{
            setShowButtonsCheckbox(true);
        }

        if(data.hasOwnProperty('auto_detect_language')){
            setAutoDetectLangCheckbox(data.auto_detect_language);
        }
        // By default, this option should be true.
        else{
            setAutoDetectLangCheckbox(true);
        }

        if(data.hasOwnProperty('preferable_voice_English')){
            $("#English-preferable-voice").find("option:contains('" + data.preferable_voice_English + "')").attr("selected", true);
        }

        if(data.hasOwnProperty('preferable_voice_Portuguese')){
            $("#Portuguese-preferable-voice").find("option:contains('" + data.preferable_voice_Portuguese + "')").attr("selected", true);
        }

        if(data.hasOwnProperty('preferable_voice_Spanish')){
            $("#Spanish-preferable-voice").find("option:contains('" + data.preferable_voice_Spanish + "')").attr("selected", true);
        }

        if(data.hasOwnProperty('preferable_voice_Serbo')){
            $("#Serbo-Croatian-preferable-voice").find("option:contains('" + data.preferable_voice_Serbo + "')").attr("selected", true);
        }

        if(data.hasOwnProperty('preferable_voice_Romanian')){
            $("#Romanian-preferable-voice").find("option:contains('" + data.preferable_voice_Romanian + "')").attr("selected", true);
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

    // Monitor preferable language selection change for English
    $("#English-preferable-voice").on('change', function(){
        const lang = $("#English-preferable-voice").val();
        chrome.storage.local.set({
            preferable_voice_English: lang
        })
    });

    // Monitor preferable language selection change for Portuguese
    $("#Portuguese-preferable-voice").on('change', function(){
        const lang = $("#Portuguese-preferable-voice").val();
        chrome.storage.local.set({
            preferable_voice_Portuguese: lang
        })
    });

    // Monitor preferable language selection change for Spanish
    $("#Spanish-preferable-voice").on('change', function(){
        const lang = $("#Spanish-preferable-voice").val();
        chrome.storage.local.set({
            preferable_voice_Spanish: lang
        })
    });

    // Monitor preferable language selection change for Serbo-Croatian
    $("#Serbo-Croatian-preferable-voice").on('change', function(){
        const lang = $("#Serbo-Croatian-preferable-voice").val();
        chrome.storage.local.set({
            preferable_voice_Serbo: lang
        })
    });

    // Monitor preferable language selection change for Romanian
    $("#Romanian-preferable-voice").on('change', function(){
        const lang = $("#Romanian-preferable-voice").val();
        chrome.storage.local.set({
            preferable_voice_Romanian: lang
        })
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
