/**
 * This script is for converting IANA language code into corresponding format for voice locale string of ResponsiveVoice.JS.
 *
 * There are cases that some country code has more than one corresponding voice pattern like English.
 * For English, there are 'UK English Male', 'UK English Female', 'US English Female', 'Australian Female'.
 * If you would like to pick up preferable voice in this case, please specify as option.
 * i.e.
 * option = {
 *   en: 'Australian Female', // One of 'UK English Male', 'UK English Female', 'US English Female', 'Australian Female'
 *   es: 'Spanish Latin American Female', // One of 'Spanish Female', 'Spanish Latin American Female'
 *   pt: 'Brazilian Portuguese Female', // One of 'Brazilian Portuguese Female', 'Portuguese Female'
 *   ro: 'Moldavian Male', // One of 'Moldavian Male', 'Romanian Male'
 *   sh: 'Bosnian Male', // One of 'Montenegrin Male', 'Serbo-Croatian Male', 'Bosnian Male'
 * };
 * ccToVoice(cc, sex, option);
 *
 * @param {String} cc - Country Code like "ja", "en" and like that.
 * @param {Object=} option - Preferable selection if country code has more than one voice variation.
 */
const default_preferable_voice = {
    en: 'US English Female',
    es: 'Spanish Female',
    pt: 'Portuguese Female',
    ro: 'Romanian Male',
    sh: 'Serbo-Croatian Male'
};

/**
 * Conversion table from country code to voice locale string.
 * Unfortunately text language detection library cannot detect Hatian Creole, so the voice of Hatian Creole cannot be
 * quoted from country code.
 */
const cc2voice_table = {
    af: "Afrikaans Male",
    sq: "Albanian Male",
    ar: "Arabic Male",
    hy: "Armenian Male",
    "pt-BR": "Brazilian Portuguese Female",
    ca: "Catalan Male",
    zh: "Chinese Female",
    hr: "Croatian Male",
    cs: "Czech Female",
    da: "Danish Female",
    de: "Deutsch Female",
    nl: "Dutch Female",
    eo: "Esperanto Male",
    fi: "Finnish Female",
    fr: "French Female",
    el: "Greek Female",
    hi: "Hindi Female",
    hu: "Hungarian Female",
    is: "Icelandic Male",
    id: "Indonesian Female",
    it: "Italian Female",
    ja: "Japanese Female",
    ko: "Korean Female",
    la: "Latin Female",
    lv: "Latvian Male",
    mk: "Macedonian Male",
    no: "Norwegian Female",
    pl: "Polish Female",
    pt: "Portuguese Female",
    ru: "Russian Female",
    sr: "Serbian Male",
    sk: "Slovak Female",
    sw: "Swahili Male",
    sv: "Swedish Female",
    ta: "Tamil Male",
    th: "Thai Female",
    tr: "Turkish Female",
    vi: "Vietnamese Male",
    cy: "Welsh Male"
};

function voiceText(cc, option={}){
    if(cc === "en" || cc === "es" || cc === "pt" || cc === "ro" || cc === "sh"){
        if(option.hasOwnProperty(cc)){
            return option[cc];
        }
        else{
            return default_preferable_voice[cc];
        }
    }
    else{
        if(cc2voice_table.hasOwnProperty(cc)){
            return cc2voice_table[cc];
        }

        // When country code which is not supported by ResponsiveVoice.JS is specified, return undefined.
        return undefined;
    }
}