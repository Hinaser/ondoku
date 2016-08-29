/**
 * From stackoverflow.
 * http://stackoverflow.com/questions/171251/how-can-i-merge-properties-of-two-javascript-objects-dynamically
 *
 * Overwrites obj1's values with obj2's and adds obj2's if non existent in obj1.
 * @param {Object} obj1
 * @param {Object} obj2
 * @returns {Object} obj3 a new object based on obj1 and obj2
 */
function merge_options(obj1,obj2) {
    let obj3 = {};
    for (let attrname in obj1) {
        obj3[attrname] = obj1[attrname];
    }
    for (let attrname in obj2) {
        obj3[attrname] = obj2[attrname];
    }
    return obj3;
}

/**
 * Speaker class
 */
const Speaker = function(){
    if(!responsiveVoice){
        console.error('responsivevoice.js is not loaded.');
        throw false;
    }

    this.lang = 'UK English Female';
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
    this.option = merge_options(this.option, {
        onstart: this.onStart,
        onend: this.onEnd,
        onerror: this.onError,
        onpause: this.onPause,
        onresume: this.onResume,
    });

    this.option = merge_options(this.option, opt);
};

/**
 * Callback on beginning to speak.
 */
Speaker.prototype.onStart = function(){

};

/**
 * Callback on end speaking.
 */
Speaker.prototype.onEnd = function(){

};

/**
 * Callback on error on speaking.
 */
Speaker.prototype.onError = function(){

};

/**
 * Callback on pause speaking.
 */
Speaker.prototype.onPause = function(){

};

/**
 * Callback on Resume speaking.
 */
Speaker.prototype.onResume = function(){

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
 */
Speaker.prototype.speak = function(text, locale, option){
    // When locale is empty, use default locale.
    if(!locale){
        locale = this.lang;
    }

    this.setupOption(option);

    // If text is not specified, get selected text on current web page.
    if(!text){
        text = this.textSelected();

        if(!text) return;
    }

    responsiveVoice.cancel();
    responsiveVoice.speak(text);
};





/**
 *
 * @type {Speaker}
 */
const speaker = new Speaker();

/**
 * Listening to text selection event, well, virtually.
 * If text selection has been made, pops up button to stream voice corresponding to selected text.
 */
function makeVoice(){
    speaker.speak();
}
chrome.storage.local.get('enabled', function(data){
    if(data.hasOwnProperty('enabled') && data.enabled){
        document.addEventListener('mouseup', makeVoice);
    }
});

/**
 * Handler of a message incoming from backgroud/popup scripts.
 */
function messageListener(message, sender, sendResponse){
    // Handling addon on/off message
    if(message.hasOwnProperty('enabled')){
        document.removeEventListener('mouseup', makeVoice);

        if(message.enabled){
            document.addEventListener('mouseup', makeVoice);
            sendResponse({message: 'Enabled'})
        }
        else{
            sendResponse({message: 'Disabled'})
        }
    }
}

chrome.runtime.onMessage.addListener(messageListener);
