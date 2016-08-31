/**
 * Global variables
 */
const panel_container_id = "-web-extension-ondoku-buttons";
const button_group_id = "-web-extension-ondoku-btn-group";
const play_btn_id = "-web-extension-ondoku-btn-play";
const stop_btn_id = "-web-extension-ondoku-btn-stop";

/**
 * Send object wanted to inspect to background script to debug.
 * Since currently (as of 30th Aug 2016), firefox cannot output log by console.log in content scripts.
 *
 * @param {*} obj - Something you want to look inside.
 */
function debug(obj){
    chrome.runtime.sendMessage(obj, function(res){});
}

/**
 * Show play/stop/resume buttons on a web page
 *
 * @param {Speaker} speaker
 */
function showButtons(speaker){
    removeButtons();

    let container = $("<div id='" + panel_container_id + "'></div>");

    // Define style for buttons element
    let style = {};
    const location_of_selection = getSelectionLocation();
    style["position"] = "absolute";
    style["top"] = location_of_selection.top - 40 + window.scrollY;
    style["left"] = location_of_selection.left + 0 + window.scrollX;
    container.css(style);

    let button_group = $("<div class='" + button_group_id + "'></div>");
    let btn_group_style = {};

    // Add buttons

    // Set up play button
    const play_btn = setupPlayButton();
    button_group.append(play_btn);
    container.append(button_group);

    // Make the element draggable.
    container.draggable();

    // Append the element to body of the web page.
    container.appendTo('body');
}

/**
 * Set up stop button
 */
function setupStopButton(){
    const stop_btn = $("<a id='" + stop_btn_id + "'></a>");
    const stop_btn_image = $("<img>");
    stop_btn_image.attr('src', chrome.extension.getURL("lib/images/stop_voice_48.png"));
    stop_btn.append(stop_btn_image);
    stop_btn.on('click', function(e){
        speaker.cancel();
        const new_play_btn = setupPlayButton();
        stop_btn.replaceWith(new_play_btn);
    });

    return stop_btn;
}

/**
 * Set up play button
 */
function setupPlayButton(){
    const play_btn = $("<a id='" + play_btn_id + "'></a>");
    const stop_btn = setupStopButton();

    play_btn.on('click', function(e){
        speaker.speak(speaker.textSelected(), {
            onstart: function(){
                play_btn.replaceWith(stop_btn);
            }
        });
    });
    let play_btn_image = $("<img>");
    play_btn_image.attr('src', chrome.extension.getURL("lib/images/play_voice_48.png"));
    play_btn.append(play_btn_image);

    return play_btn;
}

/**
 * Remove play/stop/resumes button on current web page.
 */
function removeButtons(){
    // Remove button panel whether it exists.
    $("#" + panel_container_id).remove();
}

/**
 * Get the exact location of selection of a text.
 * @returns {ClientRect}
 */
function getSelectionLocation() {
    const selection = window.getSelection();
    const oRange = selection.getRangeAt(0);
    return oRange.getBoundingClientRect();
}

/**
 * Speaker class
 */
const Speaker = function(){
    if(!responsiveVoice){
        console.error('responsivevoice.js is not loaded.');
        throw false;
    }

    this.default_voice = 'UK English Female';
    this.option = {
        pitch: 1,
        rate: 1,
        volume: 1,
    };
};

/**
 * Setup option
 */
Speaker.prototype.setupOption = function(opt){
    $.extend(this.option, opt);
};

/**
 * Get (and sanitize if necessary) selected text on web page.
 */
Speaker.prototype.textSelected = function(){
    const selection = window.getSelection().toString();
    return selection;
};

/**
 * Utter voice based on input text
 *
 * @param {String} text - A text to be spoken.
 * @param {Object=} option - Option
 */
Speaker.prototype.speak = function(text, option={}){
    debug(option);
    this.setupOption(option);
    debug(this.option);

    chrome.storage.local.get('auto_detect_language', (data)=>{
        if(data.hasOwnProperty('auto_detect_language') && data.auto_detect_language){
            guessLanguage.detect(text, (langCode)=>{
                const voice = voiceText(langCode);

                // When voice is undefined, try to speak English.
                if(voice){
                    debug("[ondoku] Auto detected voice type for the text: " + voice);

                    // Utter!
                    responsiveVoice.cancel();
                    responsiveVoice.speak(text, voice, this.option);
                }
                else{
                    debug("[ondoku] Could not detect language of selected text.");
                    debug("[ondoku] Falling back to default voice setting: " + this.default_voice);
                    responsiveVoice.cancel();
                    responsiveVoice.speak(text, this.default_voice, this.option);
                }
            });
        }
        else{
            chrome.storage.local.get('language', (data)=>{
                let voice = this.default_voice;

                if(data.hasOwnProperty('language') && data.language){
                    voice = data.language;
                }

                // Utter!
                responsiveVoice.cancel();
                responsiveVoice.speak(text, voice, this.option);
            });
        }
    });
};

/**
 * Check whether voice is streaming.
 */
Speaker.prototype.isPlaying = function(){
    return responsiveVoice.isPlaying();
};

/**
 * Cancel/Pause/Resume speaking voice
 */
Speaker.prototype.cancel = function(){
    responsiveVoice.cancel();
};
Speaker.prototype.pause = function(){
    responsiveVoice.pause();
};
Speaker.prototype.resume = function(){
    responsiveVoice.resume();
};





/**
 *
 * @type {Speaker}
 */
const speaker = new Speaker();

/**
 * @param {Event} e - An event delegated from event listener.
 */
function onMouseUp(e){
    // In case addon button is clicked, do nothing. (Click handler is defined in button function)
    const buttons = $("#" + panel_container_id);
    if(buttons.length > 0 && (buttons.is(e.target) || buttons.has(e.target).length > 0)){
        return;
    }

    // Remove buttons panel whether it exists
    removeButtons();

    const text = speaker.textSelected();

    // If text is not specified and voice is streaming, cancel streaming.
    if(!text && speaker.isPlaying()){
        speaker.cancel();
        return;
    }
    // If text is empty and voice is not streaming, do nothing.
    else if(!text){
        return;
    }
    // If text is not empty and voice is not streaming, speak the text.
    else{
        // If option for show button is enabled, do it.
        chrome.storage.local.get('show_play_buttons', function(data){
            // When `show_play_button` setting is enabled, show button and not stream voice for now.
            if(data.hasOwnProperty('show_play_buttons') && data.show_play_buttons){
                showButtons(speaker);
            }
            // If the setting is not enabled, stream voice immediately.
            else{
                speaker.speak(text);
            }
        });
    }
}

// Remove event handler if it is already attached. (Maybe this is useful only in development phase)
$(document).off('mouseup', onMouseUp);

// Setup event for text to speak
chrome.storage.local.get('enabled', function(data){
    if(data.hasOwnProperty('enabled') && data.enabled){
        $(document).on('mouseup', onMouseUp);
    }
});

/**
 * Handler of a message incoming from backgroud/popup scripts.
 */
function messageListener(message, sender, sendResponse){
    // Anyway, try to remove event handler at first to prevent to steam duplicate voice in the same web page.
    $(document).off('mouseup', onMouseUp);

    // Handling addon on/off message
    if(message.hasOwnProperty('enabled')){
        if(message.enabled){
            $(document).on('mouseup', onMouseUp);
            sendResponse({message: 'Enabled'});
        }
        else{
            sendResponse({message: 'Disabled'});
        }
    }

    return true;
}

chrome.runtime.onMessage.addListener(messageListener);
