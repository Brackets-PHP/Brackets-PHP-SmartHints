/*The MIT License (MIT)

Copyright (c) 2014 Andrew MacKenzie

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
/*global define, brackets, $, Mustache */

define(function (require, exports, module) {
    "use strict";

    var Dialogs                 = brackets.getModule("widgets/Dialogs"),
        projectDialog           = require("text!templates/php-project-dialog.html"),
        PreferencesManager      = brackets.getModule("preferences/PreferencesManager"),
        prefs                   = PreferencesManager.getExtensionPrefs("php-sig.php-smarthints"),
        Strings                 = require('strings');

    require("lib/jquery.add-input-area");

    function showProjectDialog(filters) {
        filters.sort(function (a, b) {
            var nameA = a.filterName.toLowerCase(),
                nameB = b.filterName.toLowerCase();
            if (nameA < nameB) {
                return -1;
            }
            if (nameA > nameB) {
                return 1;
            }
            return 0;
        });
        Dialogs.showModalDialogUsingTemplate(Mustache.render(projectDialog, {
            arr: filters,
            strings: Strings
        }));

        function _setIndeterminateState() {
            var checked,
                indeterminate;
            if ($('.php-filter:checked').length === 0) {
                checked = false;
                indeterminate = false;
            } else if ($('.php-filter:not(:checked)').length === 0) {
                checked = true;
                indeterminate = false;
            } else {
                checked = false;
                indeterminate = true;
            }
            $('.php-filter-all').prop({
                checked: checked,
                indeterminate: indeterminate
            });
        }

        $('.php-filter-all').change(function () {
            $('.php-filter').prop('checked', $(this).prop('checked'));
        });

        $('.php-filter').change(_setIndeterminateState);
        _setIndeterminateState();



        $('#btnApplyProject').on('click', function (event) {
            var newFunctionList = [];
            $('[id^=php-]').each(function (index) {
                if ($(this).is(':checked')) {
                    newFunctionList.push($(this).attr('id').substr(4));
                }
            });
            prefs.set("filteredFunctionList", newFunctionList, {location: { scope: "project"}});
            prefs.save();
        });
        $('#phplist').addInputArea();
    }

    exports.showProjectDialog = showProjectDialog;
});
