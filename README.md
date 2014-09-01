![logo](https://raw.github.com/inikulin/iwant/master/logo.png)  

[![Build Status](http://img.shields.io/travis/inikulin/iwant.svg?style=flat-square)](https://travis-ci.org/inikulin/iwant)



*Web scraping and HTML-reprocessing. The easy way.*

`iwant` allows you collect useful data from web pages using simple and fancy API. Let's collect images, hyperlinks, scripts and stylesheets from www.google.com:

```js

var iwant = require('iwant');

iwant.collect.images.hyperlinks.scripts.stylesheets.from('http://www.google.com',
    function (err, response, result) {
        console.log(result);
    });

```

Also, it can be used to build HTML-reprocessing pipelines with elegance. E.g. we have the following `html`:
```html
<!DOCTYPE html>
<html>
<head>
    <title></title>
    <style type="text/css">
        border-radius()
          -webkit-border-radius: arguments
          -moz-border-radius: arguments
          border-radius: arguments

        ul
          margin: 5px
          border: 1px solid
          border-radius: 5px
    </style>
</head>
<body>
This is an H1
=============
*   Red
*   Green
*   Blue
</body>
</html>
```

Let's render it's `<style>` with [stylus](https://github.com/learnboost/stylus) and convert text from Markdown to HTML using [marked](https://github.com/chjj/marked) then assemble results back to HTML: 

```js
var iwant = require('iwant'),
    stylus = require('stylus'),
    marked = require('marked');

function renderStylus(code) {
    var css = null;

    stylus.render(code, null, function (err, result) {
        css = result;
    });

    return css;
}

var resultHtml = iwant.reprocess.cssCode(renderStylus).texts(marked).fromHtml(html);
```

And the `resultHtml` will be:
```html
<!DOCTYPE html>
<html>
<head>
    <title></title>
    <style type="text/css">
        .ul {
            margin: 5px;
            border: 1px solid;
            -webkit-border-radius: 5px;
            -moz-border-radius: 5px;
            border-radius: 5px;
        }
    </style>
</head>
<body>
<h1 id="this-is-an-h1">This is an H1</h1>
<ul>
    <li>Red</li>
    <li>Green</li>
    <li>Blue</li>
</ul>
</body>
</html>
```

`iwant` provides built-in collectors and reprocessors that covers a wide variety of common use cases. However, if you feel that something is missing, then you can easily extend it with custom plugins.   

##Install
```
$ npm install iwant
```

##Usage
The general form:

####```iwant.<action>[.<plugin>...].<from*>```

---------------------------------------
###from* methods
#####.fromHtml(html)
Accepts `html` string as an argument and synchronously returns `result` of the action.

*Example:*
```js
var result = iwant.collect.texts.fromHtml('<div>Hey ya</div>');
```

#####.from(options, callback)
Asynchronously loads specified page and invokes `callback(err, response, result)`. It passes `response` object to `callback` in case if you need response headers or status codes. The first argument can be either a `url` or an `options` object.
The set of options is the same as in @mikeal's [request](https://github.com/mikeal/request#requestoptions-callback), so you can use POST method, set request headers or do any other advanced setup for the page request.

*Examples:*
```js
iwant.collect.jsCode.from('https://github.com', function (err, response, result) {
    console.log(response.statusCode);
    console.log(response.headers);    
});
```
```js
iwant.collect.title.from({
    url: 'https://test.domain/',
    method: 'POST',
    form: 'input=test'
}, function (err, response, result) {
    console.log(result);
});

```

###.collect action
Collects information specified by plugin set. The `result` of the action is an object that contains individual plugin outputs as properties.

*Example*:
```js
var result = iwant.collect.texts.images.scripts.fromHtml(html);
```
will produce `result`:
```js
{
    "texts" : <collected texts>,
    "images" : <collected images>,
    "scripts" : <collected scripts>
}
```
Built-in plugins:

| Plugin|Description| Output |
--- | --- | ---
`.comments`| Collects HTML comments| Array of comment string
`.cssCode`| Collects CSS code enclosed in `<style>` tags| Array of CSS code strings
`.hyperlinks`| Collects URL (*see remark below*) and text of the hyperlinks | Array of `{href:[String], text:[String]}` objects 
`.images`| Collects absolute URL (*see remark below*) and `alt` attribute of the images | Array of `{src:[String], alt:[String]}` objects 
`.jsCode`| Collects JavaScript code enclosed in `<script>` tags |Array of JavaScript code strings
`.scripts` |Collects URL (*see remark below*) of the external `.js`-files, specified via `<script>` tags with `src` attribute  | Array of script URLs
`.stylesheets`| Collects URL (*see remark below*) of the external `*.css`-files, specified via `<link>` tag| Array of stylesheet URLs
`.texts`| Collects all text nodes in `<body>` of the document with except for `<script>` and `<style>` tag's content. Speaking clearly: all end-user visible text.  | Array of text strings
`.title`| Collects document title | Document title string

*Remark:* All URLs are collected in respect to `<base>` tag. The resulting URL will be an absolute URL if `.from()` method was used, `<base>` tag constains absolute URL or raw collected URL is already absolute.

###.reprocess action
Applies plugins' replacing functions to the source HTML-string. The `result` of the action is the reprocessed HTML-string.

*Example*:
```js
//Delete all HTML comments and render emoji
var result = iwant.reprocess
    .comments(function() {
        return null;
    })
    .texts(function(text) {
        return text.replace(/:beer:/g, '<img src="emoji/unicode/1f37a.png" alt=":beer:">');
    })
    .fromHtml(html);
```

Built-in plugins:

| Plugin        | `replacer` signature | Description |
--- | --- | ---
`.comments(replacer)`|`replacer(commentString)` | Replaces HTML `commentString` with the value returned by `replacer`. Comment will be deleted from markup if `null` is returned.
`.cssCode(replacer)`|`replacer(cssCodeString)` | Replaces `cssCodeString` enclosed in `<style>` tag with the value returned by `replacer`.
`.hyperlinks(replacer`)|`replacer(pageBaseUrl, hrefAttrValue)`| Replaces `<a>` tag `href` attribute value with the value returned by `replacer`. 
`.images(replacer)`|`replacer(pageBaseUrl, srcAttrValue)` | Replaces `<img>` tag `src` attribute value with the value returned by `replacer`. 
`.jsCode(replacer)`|`replacer(jsCodeString)` | Replaces `jsCodeString` enclosed in the `<script>` tag with the value returned by `replacer`.
`.scripts(replacer)` | `replacer(pageBaseUrl, srcAttrValue)`| Replaces `<script>` tag `src` attribute value with the value returned by `replacer`. 
`.stylesheets(replacer)`|`replacer(pageBaseUrl, hrefAttrValue)`| Replaces `<link rel="stylesheet">` tag `href` attribute value with the value returned by `replacer`. 
`.texts(replacer)`| `replacer(text)`| Replaces `text` with the value returned by `replacer`. Returned value will be not HTML encoded by default, so HTML code can be used as `replacer` result. To force HTML encoding set `text.__encodeHtml` property to `true` in `replacer`.
`.title(replacer)`|`replacer(title)` | Replaces page `title` with the value returned by `replacer`.

##Testing
```
$ npm test
```

##Questions or suggestions?
If you have any questions, please feel free to create an issue [here on github](https://github.com/inikulin/iwant/issues).


##Author
[Ivan Nikulin](https://github.com/inikulin) (ifaaan@gmail.com)

