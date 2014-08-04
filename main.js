/*
 * Licenced under MIT
 * Author: Wang Yu <bigeyex@gmail.com>
 * github: https://github.com/bigeyex/brackets-wordhint
*/

/*
 * Copyright (c) 2013 Adobe Systems Incorporated. All rights reserved.
 *  
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"), 
 * to deal in the Software without restriction, including without limitation 
 * the rights to use, copy, modify, merge, publish, distribute, sublicense, 
 * and/or sell copies of the Software, and to permit persons to whom the 
 * Software is furnished to do so, subject to the following conditions:
 *  
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *  
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING 
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER 
 * DEALINGS IN THE SOFTWARE.
 * 
 */

/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50, regexp: true */
/*global define, brackets, $, window */

define(function (require, exports, module) {
    "use strict";

    var AppInit             = brackets.getModule("utils/AppInit"),
        CodeHintManager     = brackets.getModule("editor/CodeHintManager");
    
    var phpBuiltins         = require("php-predefined-functions");

    
    /**
     * @constructor
     */
    function WordHints() {
        this.editor             =
        this.lastLine = 0;
        this.cachedPhpVariables =       [];
        this.cachedPhpConstants =       [];
        this.cachedPhpKeywords  =       [];
        this.cachedPhpFunctions =       [];
        this.cachedLocalVariables =     [];
        this.tokenVariable =            /[$][\a-zA-Z_][a-zA-Z0-9_]*/g;
        this.currentTokenDefinition =   /[\$a-zA-Z_][\-a-zA-Z0-9_]+$/g;
    }
    
    
    /**
     * 
     * @param {Editor} editor 
     * A non-null editor object for the active window.
     *
     * @param {String} implicitChar 
     * Either null, if the hinting request was explicit, or a single character
     * that represents the last insertion and that indicates an implicit
     * hinting request.
     *
     * @return {Boolean} 
     * Determines whether the current provider is able to provide hints for
     * the given editor context and, in case implicitChar is non- null,
     * whether it is appropriate to do so.
     */
    WordHints.prototype.hasHints = function (editor, implicitChar) {

        // if implicitChar is $, we *always* have hints so return immediately
/*        if (implicitChar === "$") {
            return true;
        }*/
        var i;
        var cursor = editor.getCursorPos();
        
        if (cursor.line !== this.lastLine) {
            this.cachedLocalVariables = [];
            var localVariablesList = this.editor.document.getText().match(this.tokenVariable);
            for (i = 0; i < localVariablesList.length; i++) {
                var localVariable = localVariablesList[i];
                if (this.cachedLocalVariables.indexOf(localVariable) === -1) {
                    this.cachedLocalVariables.push(localVariable);
                }
            }
        }
        this.lastLine = cursor.line;

        var lineBeginning = {line: cursor.line, ch: 0};
        var textBeforeCursor = editor.document.getRange(lineBeginning, cursor);
        var symbolBeforeCursorArray = textBeforeCursor.match(this.currentTokenDefinition);
        if (symbolBeforeCursorArray) {
            // find if the half-word inputed is in the list
            for (i = 0; i < this.cachedLocalVariables.length; i++) {
                if (this.cachedLocalVariables[i].indexOf(symbolBeforeCursorArray[0]) === 0) {
                    return true;
                }
            }
        }
        
        
        return false;
    };
       
    /**
     * Returns a list of availble CSS propertyname or -value hints if possible for the current
     * editor context. 
     * 
     * @param {Editor} implicitChar 
     * Either null, if the hinting request was explicit, or a single character
     * that represents the last insertion and that indicates an implicit
     * hinting request.
     *
     * @return {jQuery.Deferred|{
     *              hints: Array.<string|jQueryObject>,
     *              match: string,
     *              selectInitial: boolean,
     *              handleWideResults: boolean}}
     * Null if the provider wishes to end the hinting session. Otherwise, a
     * response object that provides:
     * 1. a sorted array hints that consists of strings
     * 2. a string match that is used by the manager to emphasize matching
     *    substrings when rendering the hint list
     * 3. a boolean that indicates whether the first result, if one exists,
     *    should be selected by default in the hint list window.
     * 4. handleWideResults, a boolean (or undefined) that indicates whether
     *    to allow result string to stretch width of display.
     */
    WordHints.prototype.getHints = function (implicitChar) {
        var i;
        var cursor = this.editor.getCursorPos();
        var lineBeginning = {line: cursor.line, ch: 0};
        var textBeforeCursor = this.editor.document.getRange(lineBeginning, cursor);
        var symbolBeforeCursorArray = textBeforeCursor.match(this.currentTokenDefinition);
        var hintList = [];
        if (symbolBeforeCursorArray === null) {
            return null;
        }
        if (this.cachedLocalVariables === null) {
            return null;
        }
        for (i = 0; i < this.cachedLocalVariables.length; i++) {
            if (this.cachedLocalVariables[i].indexOf(symbolBeforeCursorArray[0]) === 0) {
                hintList.push(this.cachedLocalVariables[i]);
            }
        }

        return {
            hints: hintList,
            match: symbolBeforeCursorArray[0],
            selectInitial: true,
            handleWideResults: false
        };
    };
    
    /**
     * Complete the word
     * 
     * @param {String} hint 
     * The hint to be inserted into the editor context.
     * 
     * @return {Boolean} 
     * Indicates whether the manager should follow hint insertion with an
     * additional explicit hint request.
     */
    WordHints.prototype.insertHint = function (hint) {
        var cursor = this.editor.getCursorPos();
        var lineBeginning = {line: cursor.line, ch: 0};
        var textBeforeCursor = this.editor.document.getRange(lineBeginning, cursor);
        var indexOfTheSymbol = textBeforeCursor.search(this.currentTokenDefinition);
        var replaceStart = {line: cursor.line, ch: indexOfTheSymbol};
        if (indexOfTheSymbol === -1) {
            return false;
        }
        this.editor.document.replaceRange(hint, replaceStart, cursor);
        console.log("hint: " + hint + " | lineBeginning: " + lineBeginning.line + ', ' + lineBeginning.ch + " | textBeforeCursor: " + textBeforeCursor + " | indexOfTheSymbol: " + indexOfTheSymbol + " | replaceStart: " + replaceStart.line + ', ' + replaceStart.ch);
        
        return false;
    };
    
    AppInit.appReady(function () {
        var i;
        var wordHints = new WordHints();
        var functions = phpBuiltins.predefinedFunctions;
        /*for (i = 0; i < functions.length; i++) {
            var phpFunction = functions[i];
            if (wordHints.cachedPhpFunctions.indexOf(phpFunction) === -1) {
                wordHints.cachedPhpFunctions.push(phpFunction);
            }
        }
        var keywords = phpBuiltins.keywords;
        for (i = 0; i < keywords.length; i++) {
            var phpKeyword = keywords[i];
            if (wordHints.cachedPhpKeywords.indexOf(phpKeyword) === -1) {
                wordHints.cachedPhpKeywords.push(phpKeyword);
            }
        }
        var constants = phpBuiltins.predefinedConstants;
        console.log(constants.length);
        for (i = 0; i < constants.length; i++) {
            var phpConstant = constants[i];
            if (wordHints.cachedPhpConstants.indexOf(phpConstant) === -1) {
                wordHints.cachedPhpConstants.push(phpConstant);
            }
        }
        var variables = phpBuiltins.predefinedVariables;
        for (i = 0; i < variables.length; i++) {
            var phpVariable = variables[i];
            if (wordHints.cachedPhpVariables.indexOf(phpVariable) === -1) {
                wordHints.cachedPhpVariables.push(phpVariable);
            }
        }*/
        CodeHintManager.registerHintProvider(wordHints, ["php"], 10);
    });
});
