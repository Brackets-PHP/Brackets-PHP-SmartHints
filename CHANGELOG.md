# Change Log
All notable changes to this project will be documented in this file.

## 1.2.2 - 2015-07-07

### Added
- Merged [PR#35](https://github.com/mackenza/Brackets-PHP-SmartHints/pull/35) which fixes some hints that are in the pre-defined function list not being available at hinting time. Thanks [sebsebmc](https://github.com/sebsebmc)

## 1.2.1 - unreleased

## 1.2.0 - 2015-05-21

### Added
- When inserting predefined functions, now add parens () and place cursor between them. Mostly addresses [feature request #32](https://github.com/mackenza/Brackets-PHP-SmartHints/issues/32)

### Removed
- changed minimum supported Brackets version to 1.0.0 because who would ever use sprint 37? Don't be that guy.

## 1.1.8 - 2015-05-21

### Added
- Added case insensitive comparison for user variable. Completes fix for [issue #31](https://github.com/mackenza/Brackets-PHP-SmartHints/issues/31)

## 1.1.7 - 2015-05-09

### Added
- Fix for [issue #31](https://github.com/mackenza/Brackets-PHP-SmartHints/issues/31)

## 1.1.6 - 2015-03-11

### Added
- Fix for [issue #28](https://github.com/mackenza/Brackets-PHP-SmartHints/issues/28)

## 1.1.5 - 2015-03-08

### Added
- Fix for [issue #27](https://github.com/mackenza/Brackets-PHP-SmartHints/issues/27)
- Note in README.md to indicate that this is the same extension as the former PHP-SIG Brackets PHP SmartHints and not a new extension or fork.

## 1.1.4 - 2015-02-09

### Added
- Made matching case insensitive as PHP is (mostly) that way.  Pre-defined constants are still matched respecting case due to them being case sensitive in PHP.  [fixes issue #25](https://github.com/mackenza/Brackets-PHP-SmartHints/issues/25)

### Removed
- Got rid of references to the, now defunct, PHP-SIG in readme and package.json

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
