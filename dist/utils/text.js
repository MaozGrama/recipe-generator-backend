"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isHebrew = void 0;
/**
 * A utility function to check if a given string contains Hebrew characters.
 * This is used to set the language parameter for the Google Custom Search API.
 * @param text The string to check.
 * @returns true if the string contains Hebrew characters, false otherwise.
 */
const isHebrew = (text) => {
    // A regex to match any character in the Hebrew Unicode range.
    // The \u05D0-\u05EA range covers all standard Hebrew letters.
    const hebrewRegex = /[\u05D0-\u05EA]/;
    return hebrewRegex.test(text);
};
exports.isHebrew = isHebrew;
