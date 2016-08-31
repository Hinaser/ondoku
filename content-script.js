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
 * Function to output summerized error by console.error while trying to do speak.
 * @param {String} voice
 * @param {String} text
 * @param {Object} option
 * @param {Error} e
 */
function log_error_while_speaking(voice, text, option, e=null){
    if(e){
        debug("[ondoku] Exception raised while trying to speak" + e);
    }
    debug("[ondoku] Voice: " + voice);
    debug("[ondoku] Text: " + text);
    debug("[ondoku] Option: ");
    debug(option);
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
        speaker.cancel();
        speaker.speak(speaker.textSelected(), {
            onstart: function(){
                play_btn.replaceWith(stop_btn);
            },
            onend: function(){
                speaker.cancel();
                const new_play_btn = setupPlayButton();
                stop_btn.replaceWith(new_play_btn);
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
        debug('responsivevoice.js is not loaded.');
        throw false;
    }

    this.default_voice = 'UK English Female';
    this.option = {
        pitch: 1,
        rate: 1,
        volume: 1,
        onerror: function(e){
            debug("[ondoku] Error while trying to speak: " );
            debug(e);
        }
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
    this.setupOption(option);

    chrome.storage.local.get('auto_detect_language', (data)=>{
        if(data.hasOwnProperty('auto_detect_language') && data.auto_detect_language){
            guessLanguage.detect(text, (langCode)=>{
                chrome.storage.local.get([
                    "preferable_voice_English",
                    "preferable_voice_Portuguese",
                    "preferable_voice_Spanish",
                    "preferable_voice_Serbo",
                    "preferable_voice_Romanian"
                ], (data)=>{
                    const preferable_voice = {};

                    if(data.hasOwnProperty("preferable_voice_English")){
                        preferable_voice['en'] = data["preferable_voice_English"];
                    }
                    if(data.hasOwnProperty("preferable_voice_Portuguese")){
                        preferable_voice['pt'] = data["preferable_voice_Portuguese"];
                    }
                    if(data.hasOwnProperty("preferable_voice_Spanish")){
                        preferable_voice['es'] = data["preferable_voice_Spanish"];
                    }
                    if(data.hasOwnProperty("preferable_voice_Serbo")){
                        preferable_voice['sh'] = data["preferable_voice_Serbo"];
                    }
                    if(data.hasOwnProperty("preferable_voice_Romanian")){
                        preferable_voice['ro'] = data["preferable_voice_Romanian"];
                    }

                    const voice = voiceText(langCode, preferable_voice);

                    // When voice is undefined, try to speak English.
                    if(voice){
                        debug("[ondoku] Auto detected voice type for the text: " + voice);
                        debug('[ondoku] Text to be spoken: "' + text + '"');
                        debug("[ondoku] Option:");
                        debug(this.option);

                        // Utter!
                        responsiveVoice.cancel();
                        try{
                            responsiveVoice.speak(text, voice, this.option);
                        }
                        catch(e){
                            log_error_while_speaking(e, voice, text, this.option);
                        }
                    }
                    else{
                        debug("[ondoku] Could not detect language of selected text.");
                        debug("[ondoku] Falling back to default voice setting: " + this.default_voice);
                        debug('[ondoku] Text to be spoken: "' + text + "'");
                        debug("[ondoku] Option:");
                        debug(this.option);

                        responsiveVoice.cancel();
                        try{
                            responsiveVoice.speak(text, this.default_voice, this.option);
                        }
                        catch(e){
                            log_error_while_speaking(e, this.default_voice, text, this.option);
                        }
                    }
                });
            });
        }
        else{
            chrome.storage.local.get('language', (data)=>{
                let voice = this.default_voice;

                if(data.hasOwnProperty('language') && data.language){
                    voice = data.language;
                }

                debug('[ondoku] Text to be spoken: "' + text + '"');
                debug("[ondoku] Voice type: " + voice);
                debug("[ondoku] Option:");
                debug(this.option);

                // Utter!
                responsiveVoice.cancel();
                try{
                    responsiveVoice.speak(text, voice, this.option);
                }
                catch(e){
                    log_error_while_speaking(e, voice, text, this.option);
                }
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
