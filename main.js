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
        extConstantList         = [],
        start                   = 0;

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
//        this.cachedPhpVariables     = [];
//        this.cachedPhpConstants     = [];
//        this.cachedPhpKeywords      = [];
//        this.cachedPhpFunctions     = [];
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
            for (i = 0; i < kwList.length; i++) {
                if (kwList[i].kwname.indexOf(tokenToCursor) === 0) {
                    return true;
                }
            }
            // do constants 2nd as they are also small
            for (i = 0; i < constList.length; i++) {
                if (constList[i].indexOf(tokenToCursor) === 0) {
                    return true;
                }
            }

            // and then magic methods
            for (i = 0; i < mmList.length; i++) {
                if (mmList[i].indexOf(tokenToCursor) === 0) {
                    return true;
                }
            }

            // do functions last as the array is quite large
            for (i = 0; i < extFunctionList.length; i++) {
                if (extFunctionList[i].name.indexOf(tokenToCursor) === 0) {
                    return true;
                }
            }
        }
        // nope, no hints
        return false;
    };

    PHPHints.prototype.getHints = function (implicitChar) {
        var i                       = 0,
            hintList                = [],
            localVarList            = [],
            phpVarList              = [],
            phpKeywordList          = [],
            phpConstList            = [],
            phpMmList               = [],
            phpFuncList             = [],
            classList               = [],
            $fHint,
            ttcRegex,
            cursor                  = this.editor.getCursorPos(),
            textFromLineStart       = "",
            tokenToCursor           = "",
            classMatch;

        this.activeToken = TokenUtils.getInitialContext(this.editor._codeMirror, cursor);
        tokenToCursor = getTokenToCursor(this.activeToken);

        textFromLineStart = this.editor.document.getRange({
            line: cursor.line,
            ch: 0
        }, cursor);
        newClassRegex.lastIndex = 0;
        classMatch = newClassRegex.exec(textFromLineStart);
        console.log(cursor, textFromLineStart, tokenToCursor, classMatch);

        // if it's a $variable, then build the local variable list
        if (implicitChar === "$"  || this.activeToken.token.string.charAt(0) === "$") {
            if ((this.lastToken === "") ||
                    (this.activeToken.token.start !== this.lastToken.token.start) ||
                    (this.activeToken.pos.line !== this.lastToken.pos.line)) {
                this.cachedLocalVariables.length = 0;
                var lVarList = this.editor.document.getText().match(tokenVariable);
                if (lVarList) {
                    for (i = 0; i < lVarList.length; i++) {
                        var word = lVarList[i];
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
            for (i = 0; i < varList.length; i++) {
                if (varList[i].indexOf(tokenToCursor) === 0) {
                    $fHint = $("<span>")
                        .addClass("PHPSmartHints-completion")
                        .addClass("PHPSmartHints-completion-phpvar")
                        .text(varList[i]);
                    phpVarList.push($fHint);
                }
            }
            // list is presented with local first then predefined
            hintList = localVarList.concat(phpVarList);
        } else if (classMatch !== null) {
            ttcRegex = new RegExp("^" + classMatch[2]);
            if (!classMatch[2]) {
                for (i = 0; i < extClassList.length; i++) {
                    $fHint = $("<span>")
                        .addClass("PHPSmartHints-completion")
                        .addClass("PHPSmartHints-completion-phpclass")
                        .text(extClassList[i].name);
                    classList.push($fHint);
                }
            } else {
                for (i = 0; i < extClassList.length; i++) {
                    if (ttcRegex.test(extClassList[i].name)) {
                        $fHint = $("<span>")
                            .addClass("PHPSmartHints-completion")
                            .addClass("PHPSmartHints-completion-phpclass")
                            .text(extClassList[i].name);
                        classList.push($fHint);
                    }
                }
            }
            hintList = classList;
        } else {
            // not a $variable, could be a reserved word of some type
            // load keywords that match
            for (i = 0; i < kwList.length; i++) {
                if (kwList[i].kwname.indexOf(tokenToCursor) === 0) {
                    $fHint = $("<span>")
                        .addClass("PHPSmartHints-completion")
                        .addClass("PHPSmartHints-completion-phpkeyword")
                        .text(kwList[i].kwname);
                    phpKeywordList.push($fHint);
                }
            }
            // load constants that match
            for (i = 0; i < constList.length; i++) {
                if (constList[i].indexOf(tokenToCursor) === 0) {
                    $fHint = $("<span>")
                        .addClass("PHPSmartHints-completion")
                        .addClass("PHPSmartHints-completion-phpconstant")
                        .text(constList[i]);
                    phpConstList.push($fHint);
                }
            }

             // load magic methods that match
            for (i = 0; i < mmList.length; i++) {
                if (mmList[i].indexOf(tokenToCursor) === 0) {
                    $fHint = $("<span>")
                        .addClass("PHPSmartHints-completion")
                        .addClass("PHPSmartHints-completion-phpfunction")
                        .text(mmList[i]);
                    phpMmList.push($fHint);
                }
            }
            // load functions that match
            for (i = 0; i < extFunctionList.length; i++) {
                if (extFunctionList[i].name.indexOf(tokenToCursor) === 0) {
                    $fHint = $("<span>")
                        .addClass("PHPSmartHints-completion")
                        .addClass("PHPSmartHints-completion-phpfunction")
                        .text(extFunctionList[i].name);
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

        console.log(currentToken, cursor);
        if (currentToken.string === " ") {
            replaceStart = replaceEnd;
        }
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
        var promises = [],
            directory,
            fileName    = "",
            extArray = ["basic", "standard", "session", "gd", "PDO", "mysqli", "apc", "json"];


        extArray.forEach(function (element, index) {
            var dirDeferred = new $.Deferred();
            fileName = extDir + element + ".json";
            parseLangFile(fileName)
                .done(function (parsed) {
                    parsed.forEach(function (element, index) {
                        switch (element.stmtType) {
                        case "Class":
                            extClassList.push(element);
                            break;

                        case "Function":
                            extFunctionList.push(element);
                            break;

                        case "Constant":
                            extConstantList.push(element);
                            break;
                        }
                    });
                    dirDeferred.resolve();
                })
                .fail(function (err) {
                    console.error("error handling language directory files", err);
                    dirDeferred.reject();
                });
            promises.push(dirDeferred);

        });

        return $.when.apply(undefined, promises).promise();
    }

    function loadPredefines() {
        var loadDeferred    = new $.Deferred();

        parseLangFile(predefinesFile)
            .done(function (parsed) {
                mmList = parsed.magic_methods;
                constList = parsed.constants;
                varList = parsed.variables;
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
                loadDeferred.resolve();
            })
            .fail(function (err) {
                console.error("error loading keywords array", err);
                loadDeferred.reject();
            });

        return loadDeferred.promise();
    }

    ExtensionUtils.loadStyleSheet(module, "css/main.css");
    toolbarIcon.appendTo('#main-toolbar .buttons')
        .on("click", function () {
            projectUI.showProjectDialog(filters);
        });

    start = Date.now();
    $.when(loadKeywords(), loadPredefines(), loadExtDir())
        .done(function () {
            var elapsed = Date.now() - start;
            console.log("PHP Language files successfully loaded in " + elapsed + "ms", kwList, varList, mmList, constList, extClassList, extConstantList, extFunctionList);
        })
        .fail(function (err) {
            console.error("error processing language files", err);
        });

    var phpHints = new PHPHints();

    CodeHintManager.registerHintProvider(phpHints, ["php"], 10);
});
