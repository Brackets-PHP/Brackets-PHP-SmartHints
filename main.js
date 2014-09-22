/*The MIT License (MIT)

Copyright (c) 2014 Brackets PHP SIG

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.*/

/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50, regexp: true */
/*global define, brackets, $ */

define(function (require, exports, module) {
    "use strict";

    var AppInit                 = brackets.getModule("utils/AppInit"),
        CodeHintManager         = brackets.getModule("editor/CodeHintManager"),
        ExtensionUtils          = brackets.getModule("utils/ExtensionUtils"),
        TokenUtils              = brackets.getModule("utils/TokenUtils"),
        FileSystem              = brackets.getModule("filesystem/FileSystem"),
        FileUtils               = brackets.getModule("file/FileUtils"),
        PreferencesManager      = brackets.getModule("preferences/PreferencesManager"),
        prefs                   = PreferencesManager.getExtensionPrefs("php-sig.php-smarthints");

    var Strings                 = require('strings');

    var keywords                = [],
        extDir                  = ExtensionUtils.getModulePath(module, "phpdata/ext/"),
        predefinesFile          = ExtensionUtils.getModulePath(module, "phpdata/php-predefined.json"),
        keywordsFile            = ExtensionUtils.getModulePath(module, "phpdata/keywords.json");

    var mmList                  = [],
        constList               = [],
        varList                 = [],
        kwList                  = [],
        extClassList            = [],
        extFunctionList         = [],
        extConstantList         = [];

    var toolbarIcon             = $('<a title="' + Strings.EXTENSION_NAME + '" id="PHPSmartHints-icon"></a>'),
        filters                 = [],
        projectUI               = require("project-ui");

    var newClassRegex           = /([\$][a-zA-Z_][a-zA-Z0-9_]*)[\s]?[\=][\s]?new\s+([a-zA-Z0-9_]*)/g,
        classPropMethod         = /(\$[a-zA-Z_\x7f-\xff][a-zA-Z0-9_\x7f-\xff]*)->/,
        tokenVariable           = /[$][\a-zA-Z_][a-zA-Z0-9_]*/g;


    function getTokenToCursor(token) {
        var tokenStart = token.token.start,
            tokenCursor = token.pos.ch,
            tokenString = token.token.string;
        return tokenString.substr(0, (tokenCursor - tokenStart));
    }

    /**
     * @constructor
     */
    function PHPHints() {
        this.tempValue              = "";
        this.activeToken            = "";
        this.lastToken              = "";
        this.cachedPhpVariables     = [];
        this.cachedPhpConstants     = [];
        this.cachedPhpKeywords      = [];
        this.cachedPhpFunctions     = [];
        this.cachedLocalVariables   = [];
    }

    PHPHints.prototype.hasHints = function (editor, implicitChar) {
        this.editor = editor;
        var i                   = 0,
            cursor              = editor.getCursorPos(),
            textFromLineStart   = "",
            tokenToCursor       = "";

        this.activeToken = TokenUtils.getInitialContext(editor._codeMirror, cursor);

        // if implicitChar or 1 letter token is $, we *always* have hints so return immediately
        if (implicitChar === "$"  || this.activeToken.token.string.charAt(0) === "$") {
            return true;
        }

        tokenToCursor = getTokenToCursor(this.activeToken);
        textFromLineStart = this.editor.document.getRange({
            line: cursor.line,
            ch: 0
        }, cursor);

        // e.g. $var = new - we always have a class so return true right away
        if (newClassRegex.test(textFromLineStart)) {
            return true;
        }
        
        // if we have entered 2 or more chars, do a simple keyword match and return true
        if (this.activeToken.token.string.length > 1 || implicitChar === null) {
            // do keywords first as they are common and small
            for (i = 0; i < this.cachedPhpKeywords.length; i++) {
                if (this.cachedPhpKeywords[i].indexOf(tokenToCursor) === 0) {
                    return true;
                }
            }
            // do constants 2nd as they are also small
            for (i = 0; i < this.cachedPhpConstants.length; i++) {
                if (this.cachedPhpConstants[i].indexOf(tokenToCursor) === 0) {
                    return true;
                }
            }
            // do functions last as the array is quite large
            for (i = 0; i < this.cachedPhpFunctions.length; i++) {
                if (this.cachedPhpFunctions[i].indexOf(tokenToCursor) === 0) {
                    return true;
                }
            }
        }
        // nope, no hints
        return false;
    };

    PHPHints.prototype.getHints = function (implicitChar) {
        var i =                 0,
            hintList =          [],
            localVarList =      [],
            phpVarList =        [],
            phpFuncList =       [],
            phpConstList =      [],
            phpKeywordList =    [],
            classList =         [],
            $fHint,
            cursor = this.editor.getCursorPos(),
            textFromLineStart = "",
            tokenToCursor = "";

        this.activeToken = TokenUtils.getInitialContext(this.editor._codeMirror, cursor);
        tokenToCursor = getTokenToCursor(this.activeToken);

        textFromLineStart = this.editor.document.getRange({
            line: cursor.line,
            ch: 0
        }, cursor);
        // if it's a $variable, then build the local variable list
        if (implicitChar === "$"  || this.activeToken.token.string.charAt(0) === "$") {
            if ((this.lastToken === "") ||
                    (this.activeToken.token.start !== this.lastToken.token.start) ||
                    (this.activeToken.pos.line !== this.lastToken.pos.line)) {
                this.cachedLocalVariables.length = 0;
                var varList = this.editor.document.getText().match(tokenVariable);
                if (varList) {
                    for (i = 0; i < varList.length; i++) {
                        var word = varList[i];
                        if (this.cachedLocalVariables.indexOf(word) === -1) {
                            this.cachedLocalVariables.push(word);
                        }
                    }
                }
            }
            this.lastToken = this.activeToken;

            if (this.cachedLocalVariables === null) {
                return null;
            }
            this.cachedLocalVariables.sort();
            // add unique local $variables
            for (i = 0; i < this.cachedLocalVariables.length; i++) {
                if (this.cachedLocalVariables[i].indexOf(tokenToCursor) === 0) {
                    $fHint = $("<span>")
                        .addClass("PHPSmartHints-completion")
                        .addClass("PHPSmartHints-completion-localvar")
                        .text(this.cachedLocalVariables[i]);
                    localVarList.push($fHint);
                }
            }
            // load the predefined $variables next
            for (i = 0; i < this.cachedPhpVariables.length; i++) {
                if (this.cachedPhpVariables[i].indexOf(tokenToCursor) === 0) {
                    $fHint = $("<span>")
                        .addClass("PHPSmartHints-completion")
                        .addClass("PHPSmartHints-completion-phpvar")
                        .text(this.cachedPhpVariables[i]);
                    phpVarList.push($fHint);
                }
            }
            // list is presented with local first then predefined
            hintList = localVarList.concat(phpVarList);
        } else if (newClassRegex.test(textFromLineStart)) {
            classList.push('class1');
            classList.push('class2');
            classList.push('class3');
            hintList = classList;
        } else {
            // not a $variable, could be a reserved word of some type
            // load keywords that match
            for (i = 0; i < this.cachedPhpKeywords.length; i++) {
                if (this.cachedPhpKeywords[i].indexOf(tokenToCursor) === 0) {
                    $fHint = $("<span>")
                        .addClass("PHPSmartHints-completion")
                        .addClass("PHPSmartHints-completion-phpkeyword")
                        .text(this.cachedPhpKeywords[i]);
                    phpKeywordList.push($fHint);
                }
            }
            // load constants that match
            for (i = 0; i < this.cachedPhpConstants.length; i++) {
                if (this.cachedPhpConstants[i].indexOf(tokenToCursor) === 0) {
                    $fHint = $("<span>")
                        .addClass("PHPSmartHints-completion")
                        .addClass("PHPSmartHints-completion-phpconstant")
                        .text(this.cachedPhpConstants[i]);
                    phpConstList.push($fHint);
                }
            }
            // load functions that match
            for (i = 0; i < this.cachedPhpFunctions.length; i++) {
                if (this.cachedPhpFunctions[i].indexOf(tokenToCursor) === 0) {
                    $fHint = $("<span>")
                        .addClass("PHPSmartHints-completion")
                        .addClass("PHPSmartHints-completion-phpfunction")
                        .text(this.cachedPhpFunctions[i]);
                    phpFuncList.push($fHint);
                }
            }
            // munge all the lists together and sort
            hintList = phpKeywordList.concat(phpConstList, phpFuncList).sort();
        }

        return {
            hints: hintList,
            match: false,
            selectInitial: true,
            handleWideResults: false
        };
    };

    PHPHints.prototype.insertHint = function ($hint) {
        var cursor              = this.editor.getCursorPos(),
            currentToken        = this.editor._codeMirror.getTokenAt(cursor),
            replaceStart        = {line: cursor.line, ch: currentToken.start},
            replaceEnd          = {line: cursor.line, ch: cursor.ch};


        this.editor.document.replaceRange($hint.text(), replaceStart, replaceEnd);
        return false;
    };

    function parseLangFile(fileName) {
        var parseDeferred   = new $.Deferred(),
            file            = FileSystem.getFileForPath(fileName),
            parsed;
        
        FileUtils.readAsText(file)
            .done(function (text) {
                try {
                    parsed = JSON.parse(text);
                    console.log("parsed: ", fileName);
                } catch (ex) {
                    console.error("Error parsing:", fileName, ex);
                    parseDeferred.reject();
                }
                parseDeferred.resolve(parsed);
            })
            .fail(function (err) {
                console.error("Error handling file for parsing", err);
            });
        return parseDeferred.promise();
    }
    
    function loadExtDir() {
        var dirDeferred = new $.Deferred(),
            directory,
            fileName    = "";

        directory = FileSystem.getDirectoryForPath(extDir);
        directory.getContents(function (err, contents) {
            contents.forEach(function (element, index) {
                fileName = extDir + element.name;
                parseLangFile(fileName)
                    .done(function (parsed) {
                        extClassList.push(parsed);
                    })
                    .fail(function (err) {
                        console.error("error handling language directory files", err);
                        dirDeferred.reject();
                    });
            });
            dirDeferred.resolve();
            console.log("processed ext dir");
            return dirDeferred.promise();
        });
    }

    function loadPredefines() {
        var loadDeferred    = new $.Deferred();

        parseLangFile(predefinesFile)
            .done(function (parsed) {
                mmList = parsed.magic_methods;
                constList = parsed.constants;
                varList = parsed.variables;
                console.log(Date.now(), "loaded predefined array");
                loadDeferred.resolve();
            })
            .fail(function (err) {
                console.error("error loading predefines array", err);
                loadDeferred.reject();
            });

        return loadDeferred.promise();
    }

    function loadKeywords() {
        var loadDeferred    = new $.Deferred();
        
        parseLangFile(keywordsFile)
            .done(function (parsed) {
                Object.keys(parsed).forEach(function (key) {
                    var kwObj = {};
                    kwObj.kwname = key;
                    kwObj.suffix = keywords[key];
                    kwList.push(kwObj);
                });
                console.log(Date.now(), "loaded keywords array");
                loadDeferred.resolve();
            })
            .fail(function (err) {
                console.error("error loading keywords array", err);
                loadDeferred.reject();
            });

        return loadDeferred.promise();
    }

/*    function makeUsWait() {
        var deferred = $.Deferred();

        setTimeout(function () {
            deferred.resolve();
        }, 10000);

        return deferred.promise();
    }*/

    ExtensionUtils.loadStyleSheet(module, "css/main.css");
    toolbarIcon.appendTo('#main-toolbar .buttons')
        .on("click", function () {
            projectUI.showProjectDialog(filters);
        });

    $.when(loadKeywords(), loadPredefines(), loadExt())
        .done(function (parsed) {
            console.log("end", Date.now(), constList, varList, mmList, kwList, extClassList);
        })
        .fail(function (err) {
            console.error("error processing language files", err);
        });

    console.log("start", Date.now());
    var phpHints = new PHPHints();

    CodeHintManager.registerHintProvider(phpHints, ["php"], 10);
});
