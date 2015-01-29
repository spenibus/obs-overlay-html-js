*********************************************************************** Overview
This is a customisable overlay for Open Broadcaster Software.
https://obsproject.com/
It requires the CLR Browser Source Plugin.
https://obsproject.com/forum/resources/clr-browser-source-plugin.22/


How it works:
Core generate variables by reloading the configuration at a regular interval.
Plugins generate variables at a regular interval (when enabled).
Style is reloaded at a regular interval.

When modifications are detected, the overlay is updated accordingly. This allows
you to edit the configuration or the style without restarting the stream.


************************************************************************** Setup
Create the file "user/config.html".
These is the bare minimum required to make it work.
You can use the files from "user-example/" to get started.


Then in OBS, click "global sources", "add", "add CLR browser" for each of the
following documents:
- coordinator.html
- background.html
- standby.html
- overlay.html
Simply set the dimensions to your stream output dimensions.
Don't touch the opacity.
There is no need to run each document more than once, regardless of how many
scenes in which they may be included, which is why they are added as global
sources.



coordinator.html
This document is there for everything to work. It is not supposed to appear on
the stream but it has to be running.
Simply put it behind the background in one scene.


background.html
Something to put behind everything else.


standby.html
This is the document to be shown when the stream is live but idle.


overlay.html
This is the document to be shown when the stream is live and active.


************************************************************ user files overview
obs-overlay/user/              user config folder
obs-overlay/user/config.html   user config file
obs-overlay/user/styles        user styles folder
obs-overlay/user/plugins       user plugins folder


config.html
This holds the overlay configuration.

   -- basic format:
   <body name="config">
      <var name="myVar1">MyValue1</var>
      <var name="myVar2">MyValue2</var>
      <var name="myVar3">MyValue3</var>
   </body>

   -- set variable:
      <var name="foo">bar</var>

   -- use variable:
      <div data-var="foo"></div>
      the element's content will be replaced with the var's value, like this:
      <div data-var="foo">bar</div>
      you can use any tag, like "span"

   -- you can nest variables to 99 levels deep, although you should avoid it for
      performance reasons.

   -- core variables
      variables generated from the overlay scripts are prefixed with "core"
      you should avoid creating custom variables prefixed with "core"

   -- core variables list

      -- core.elem.background.extra
         content of the extra empty box of the background screen

      -- core.elem.standby.extra
         content of the extra empty box of the standby screen
      -- core.elem.standby.top
         content of top box of the standby screen
      -- core.elem.standby.middle
         content of middle box of the standby screen
      -- core.elem.standby.bottom
         content of bottom box of the standby screen

      -- core.elem.overlay.extra
         content of the extra empty box of the overlay screen
      -- core.elem.overlay.top.left
         content of top left box of the overlay screen
      -- core.elem.overlay.top.middle
         content of top middle box of the overlay screen
      -- core.elem.overlay.top.right
         content of top right box of the overlay screen
      -- core.elem.overlay.bottom.left
         content of bottom left box of the overlay screen
      -- core.elem.overlay.bottom.middle
         content of bottom middle box of the overlay screen
      -- core.elem.overlay.bottom.right
         content of bottom right box of the overlay screen

      -- core.style.*
         explained below

      -- core.plugin.*
         explained below


Note regarding variable names
Choose variable names carefully. For example, if you use the clock plugin and
create a custom variable clock.time, it will be overwritten by the plugin.
Custom core.* variables are also strongly discouraged.


Note regarding the use of variables
When a variable is attached to an element with "data-var", the content of the
element will be overwritten by the variable's value, it is therefore useless to
write anything inside that element. For example:
<var name="foo">bar</var>
<span data-var="foo">stuff</span>
"stuff" will be replaced with "bar"


**************************************************************** Config examples
Example: displaying a title in the top middle box of the overlay.
<var name="core.elem.overlay.top.middle">My title</var>


Example: displaying the twitter logo and your twitter handle on the bottom right
box of the overlay (you would need to include the logo in the user folder).
<var name="core.elem.overlay.bottom.right">
   <img src="user/twitter.png"/> myTwitterHandle
</var>


Example: using a variable
<var name="myTwitter">Mother of dragons</var>
<var name="core.elem.overlay.bottom.right">
   <img src="user/twitter.png"/> <span data-var="myTwitter"></span>
</var>


Example: nesting variables
<var name="myTwitter">Mother of dragons</var>
<var name="myTwitterCard">
   <img src="user/twitter.png"/> <span data-var="myTwitter"></span>
</var>
<var name="core.elem.overlay.bottom.right">
   <span data-var="myTwitterCard"></span>
</var>


******************************************************************* Using styles
To add a style sheet, create a css file in your user folder, then add this to
the user config:
<var name="core.style.example">1</var>

For example, if you create the file "user/styles/myStyle.css", the config is:
<var name="core.style.myStyle">1</var>
This will add "myStyle.css" to every document.

You can disable a style by setting its value to something that is not "1".


****************************************************************** Using plugins
To use a plugin, copy the plugin script file to the user folder, then add this
to the user config:
<var name="core.plugin.example">1</var>

For example, to use the clock plugin, copy
"plugins/clock.js" to "user/plugins/clock.js"
then add this to "user/config.html":
<var name="core.plugin.clock">1</var>
You should then have access to "clock.*" variables.

You can disable a plugin by setting its value to something that is not "1".


*************************************************************** Writing a plugin
SECTION TO BE WRITTEN