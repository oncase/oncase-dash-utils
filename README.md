# oncase-dash-utils
Utilities lib for Pentaho CDE Dashboards

# Purpose

This lib is being made to centralize the knowledge of doing dashboards customizations as well as to turn the development process less expensive.

# Usage

This lib was thought to work on requirejs dashboards.

On CDE, by simpling including `OncaseUtils.js` into your dashboard and giving it a name, say, `OU`, will make this object and all of its methods available into your dashboard local scope.

This means that you can call it from whatever postFetch, preExecution or extension point like, for instance `OU.pushResizeable(this)` 

# Available methods

`TODO` Dump some documentation from the source code here
