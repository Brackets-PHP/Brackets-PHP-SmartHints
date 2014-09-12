# Change Log
All notable changes to this project will be documented in this file.

## 1.1.3 - 2014-09-12

### Added
- Translation `fr` - thanks [@rainje](https://github.com/rainje)

## 1.1.2 - 2014-09-10

### Added
- The extension is now enabled for NLS - thanks [@Hirse](https://github.com/Hirse)
- Translation `de` - thanks [@Hirse](https://github.com/Hirse)
- Translation `it` - thanks [@Denisov21](https://github.com/Denisov21)
- Dark theme fixes for indeterminate checkbox and tab-focus - [PR#19](https://github.com/Brackets-PHP-SIG/Brackets-PHP-SmartHints/pull/19) - thanks [@Hirse](https://github.com/Hirse)
- Updated screenshot to show new dark treatment

## 1.1.1 - 2014-09-04

### Added
- Fix for [issue #13](https://github.com/Brackets-PHP-SIG/Brackets-PHP-SmartHints/issues/13)
- Changed checkboxes of settings dialog to be more "like Brackets default" based on [PR #14](https://github.com/Brackets-PHP-SIG/Brackets-PHP-SmartHints/pull/14) - thanks [@Hirse](https://github.com/Hirse)
- Fix for unlogged issue where uncaught exception is raised when getting local $ variables if none already exist in the document
- Updated dialog screenshot to reflect new checkbox UI
- Removed changelog from readme and added this CHANGELOG.md file to track changes

### Removed
- pulled out the files associated with the iCheck jQuery plugin I was using for the checkboxes.
- the two buttons for "Select All" and "Unselect All" were replaced by a tri-state checkbox for the same purpose as per [PR #14](https://github.com/Brackets-PHP-SIG/Brackets-PHP-SmartHints/pull/14)

## 1.1.0 - 2014-08-28

### Added
- Fix for [issue #9](https://github.com/Brackets-PHP-SIG/Brackets-PHP-SmartHints/issues/9)
- Fix for [issue #12](https://github.com/Brackets-PHP-SIG/Brackets-PHP-SmartHints/issues/12)
- Tthe ability to filter the suggested hints by their grouping in PHP.
- Toolbar icon to handle the User Interface for selecting/de-selecting PHP function groups (you can also edit `.brackets.json` in the project root) (addresses issue #3)
- Re-factored most of the code around getting and inserting hints.  Using the Brackets utility library `utils/TokenUtils.js` for token handling.

## 1.0.1 - 2014-08-10

### Added
- Fix for [issue #5](https://github.com/Brackets-PHP-SIG/Brackets-PHP-SmartHints/issues/5)
- Fix for [issue #7](https://github.com/Brackets-PHP-SIG/Brackets-PHP-SmartHints/issues/7)

## 1.0.0 - 2014-08-08

### Added
- Initial release of planned Phase 1 features
