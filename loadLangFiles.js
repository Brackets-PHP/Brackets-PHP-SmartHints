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

    var FileSystem              = brackets.getModule("filesystem/FileSystem"),
        FileUtils               = brackets.getModule("file/FileUtils"),
        userClassList           = [],
        userFunctionList        = [],
        userConstantList        = [];

    function parseLangFile(file) {
        var parseDeferred   = new $.Deferred(),
            parsed;

        FileUtils.readAsText(file)
            .done(function (text) {
                try {
                    parsed = JSON.parse(text);
                } catch (ex) {
                    console.error("Error parsing:", file, ex);
                    parseDeferred.reject();
                }
                parseDeferred.resolve(parsed);
            })
            .fail(function (err) {
                console.error("Error handling file for parsing", err);
            });
        return parseDeferred.promise();
    }

    function loadIncPathPhp(path) {
        var directory   = FileSystem.getDirectoryForPath(path);
        var visitor = function (entry) {
            var def = new $.Deferred();

            if (entry.isFile) {
                parseLangFile(entry)
                    .done(function (parsed) {
                        parsed.forEach(function (element, index) {

                            switch (element.stmtType) {
                            case "Class":
                                userClassList.push(element);
                                break;

                            case "Function":
                                userFunctionList.push(element);
                                break;

                            case "Constant":
                                userConstantList.push(element);
                                break;
                            }
                        });
                        def.resolve();
                    })
                    .fail(function (err) {
                        console.error("error handling user PHP files", err);
                        def.reject();
                    });
            }
            return def.promise();
        };

        directory.visit(visitor);
        return true;
    }

    function getUserPhpLists() {
        return {
            userClassList: userClassList,
            userFunctionList: userFunctionList,
            userConstantList: userConstantList
        };
    }

    exports.loadIncPathPhp      = loadIncPathPhp;
    exports.getUserPhpLists     = getUserPhpLists;

});
