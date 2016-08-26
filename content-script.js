/**
 * Listening to text selection event, well, virtually.
 * If text selection has been made, pops up button to stream voice corresponding to selected text.
 */
document.body.addEventListener('mouseup', function(){
    const selection = window.getSelection().toString();

    if(selection && responsiveVoice){
        responsiveVoice.speak(selection);
    }
});
