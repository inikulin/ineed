![logo](https://raw.github.com/inikulin/ineed/master/logo.png)

[![Build Status](https://api.travis-ci.org/inikulin/ineed.svg)](https://travis-ci.org/inikulin/ineed)



*Web scraping and HTML-reprocessing. The easy way.*

`ineed` allows you collect useful data from web pages using simple and nice API. Let's collect images, hyperlinks, scripts and stylesheets from http://google.com:

```js

var ineed = require('ineed');

ineed.collect.images.hyperlinks.scripts.stylesheets.from('http://google.com',
    function (err, response, result) {
        console.log(result);
    });

```

Also, it can be used to build HTML-reprocessing pipelines (like [jch/html-pipeline](https://github.com/jch/html-pipeline) but for Node) with elegance. E.g. we have the following `html`:
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
var ineed = require('ineed'),
    stylus = require('stylus'),
    marked = require('marked');

function renderStylus(code) {
    var css = null;

    stylus.render(code, null, function (err, result) {
        css = result;
    });

    return css;
}

var resultHtml = ineed.reprocess.cssCode(renderStylus).texts(marked).fromHtml(html);
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


`ineed` doesn't build and traverse DOM-tree, it operates on sequence of HTML tokens instead. Whole processing is done in  [one-pass](http://en.wikipedia.org/wiki/One-pass_algorithm), therefore, **it's blazing fast**! The token stream is produced by [parse5](https://github.com/inikulin/parse5) which parses HTML exactly the same way modern browsers do.


`ineed` provides built-in collectors and reprocessors that covers a wide variety of common use cases. However, if you feel that something is missing, then you can easily extend `ineed` with [custom plugins](#custom-plugins).

##Install
```
$ npm install ineed
```

##Usage
The general form:

####```ineed.<action>[.<plugin>...].<from*>```


###from* methods
#####.fromHtml(html)
Accepts `html` string as an argument and synchronously returns `result` of the action.

*Example:*
```js
var result = ineed.collect.texts.fromHtml('<div>Hey ya</div>');
```

#####.from(options, callback)
Asynchronously loads specified page and invokes `callback(err, response, result)`. It passes `response` object to `callback` in case if you need response headers or status codes. The first argument can be either a `url` or an `options` object.
The set of options is the same as in @mikeal's [request](https://github.com/mikeal/request#requestoptions-callback), so you can use POST method, set request headers or do any other advanced setup for the page request.

*Examples:*
```js
ineed.collect.jsCode.from('https://github.com', function (err, response, result) {
    console.log(response.statusCode);
    console.log(response.headers);    
});
```
```js
ineed.collect.title.from({
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
var result = ineed.collect.texts.images.scripts.fromHtml(html);
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
var result = ineed.reprocess
    .comments(function() {
        return null;
    })
    .texts(function(text, escapeHtml) {
        return escapeHtml(text).replace(/:beer:/g, '<img src="emoji/unicode/1f37a.png" alt=":beer:">');
    })
    .fromHtml(html);
```

Built-in plugins:

| Plugin        | `replacer` arguments | Description |
--- | --- | ---
`.comments(replacer)`|`replacer(commentString)` | Replaces HTML `commentString` with the value returned by `replacer`. Comment will be deleted from markup if `null` is returned.
`.cssCode(replacer)`|`replacer(cssCodeString)` | Replaces `cssCodeString` enclosed in `<style>` tag with the value returned by `replacer`.
`.hyperlinks(replacer`)|`replacer(pageBaseUrl, hrefAttrValue)`| Replaces `<a>` tag `href` attribute value with the value returned by `replacer`. 
`.images(replacer)`|`replacer(pageBaseUrl, srcAttrValue)` | Replaces `<img>` tag `src` attribute value with the value returned by `replacer`. 
`.jsCode(replacer)`|`replacer(jsCodeString)` | Replaces `jsCodeString` enclosed in the `<script>` tag with the value returned by `replacer`.
`.scripts(replacer)` | `replacer(pageBaseUrl, srcAttrValue)`| Replaces `<script>` tag `src` attribute value with the value returned by `replacer`. 
`.stylesheets(replacer)`|`replacer(pageBaseUrl, hrefAttrValue)`| Replaces `<link rel="stylesheet">` tag `href` attribute value with the value returned by `replacer`. 
`.texts(replacer)`| `replacer(text, escapeHtmlFunc)`| Replaces `text` with the value returned by `replacer`. Returned value will be not HTML escaped, so HTML code can be used as `replacer` result. You can manually apply `escapeHtmlFunc(str)` to force HTML escaping of the result.
`.title(replacer)`|`replacer(title)` | Replaces page `title` with the value returned by `replacer`.

##Custom plugins
There are two kinds of plugins: those that extends `.collect` action and those that extends `.reprocess` action. To enable plugin use `.using()` function, which will return new instance of `ineed` with enabled plugin.

*Example:*
```js
ineed
    .using(myPlugin1)
    .using(myPlugin2)
    .collect
    ...
```

###Common structure

Plugins of both kinds are objects and in addition to the kind-specific properties they should have the following properties:
####.extends
Indicates which action will be extended by plugin. Can be `'collect'` or `'reprocess'`. Required property.

#### .name
Name of the plugin. Required property. It should reflect the target of the plugin action. Plugin will be accessable under the `name` in the `.collect` or `.reprocess` objects and will be used as result property name for `.collect` action. E.g. `plugin` has `name='tagNames'`. If it extends `.collect`:
```js
//Enable plugin and use it
var result = ineed.using(plugin).collect.tagNames.fromHtml(html);

//Access plugin results
var pluginResults = result.tagNames;
```

If it extends `.reprocess`:
```js
 var reprocessedHtml = ineed
        .using(plugin)
        .reprocess
        .tagNames(function (tagName) {
            if (tagName === 'applet')
                return 'object';
        })
        .fromHtml(html);
```

#### .init(ctx, ...)
Function that initializes plugin. Required field. It always receives `ctx` object as it first argument. `ctx` contains
some useful common information regarding current pipeline state:
#####ctx.baseUrl 
Base URL of all resources on the page with respect to `<base>` tag.

#####ctx.leadingStartTag
Leading non-self-closing start tag for the current HTML token. Can be used to determine parent of the text nodes. Will be `null` if the leading start tag was self-closing or any leading end tag was met.

#####ctx.inBody
Indicates if emitted tokens are in `<body>` tag. 

####Token handlers
Plugin can have one or more HTML token handlers:
*  `.onDoctype(doctype)`
 
Where `doctype`:
```js
{
    name: [String],
    publicId: [String],
    systemId: [String]
}
```

*  `.onStartTag(startTag)`
 
Where `startTag`: 
```js
{
    tagName: [String],
    attrs: [Array],
    selfClosing: [Boolean]
}
```
*  `.onEndTag(tagName)`
*  `.onText(text)`
*  `.onComment(commentText)`


###Collecting plugins
Collecting plugins in addition to [common properties](#common-structure) should have `.getCollection()` method that should return items collected by plugin.

*Example of the collecting plugin:*
```js
//Collects tagNames in <body>
var plugin = {
    extends: 'collect',
    name: 'tagNamesInBody',

    init: function (ctx) {
        this.ctx = ctx;
        this.tagNames = [];
    },

    addTagName: function (tagName) {
        if (this.ctx.inBody && this.tagNames.indexOf(tagName) < 0)
            this.tagNames.push(tagName);
    },

    onStartTag: function (startTag) {
        this.addTagName(startTag.tagName);
    },

    onEndTag: function (tagName) {
        this.addTagName(tagName);
    },

    getCollection: function () {
        return this.tagNames;
    }
};

//Let's use it
var results = ineed.using(plugin).collect.tagNamesInBody.fromHtml(html);
console.log(results.tagNamesInBody);
```

###Reprocessing plugins
Reprocessing plugin's `init` method in addition to `ctx` object receives all arguments passed to plugin in pipeline (e.g. `replacer()` function). If token handler returns `null` then token will be deleted from the pipeline and no farther processing by other plugins will be performed on it and it will not appear in the resulting HTML. If handler returns modified token then it will be passed to the farther plugins and will appear in the resulting HTML. If handler doesn't returns value or returns `undefined` then token will be passed unmodified to the farther plugins.

*Example of the reprocessing plugin:*
```js
//Replaces or deletes tagNames in <body>
var plugin = {
    extends: 'reprocess',
    name: 'tagNamesInBody',

    init: function (ctx, replacer) {
        this.ctx = ctx;
        this.replacer = replacer;
    },

    onStartTag: function (startTag) {
        if (this.ctx.inBody) {
            startTag.tagName = this.replacer(startTag.tagName);

            //Delete token if tagName is null
            return startTag.tagName === null ? null : startTag;
        }
    },

    onEndTag: function (tagName) {
        if (this.ctx.inBody)
            return this.replacer(tagName);
    }
};

//Let's use it
var reprocessedHtml = ineed
    .using(plugin)
    .reprocess
    .tagNamesInBody(function (tagName) {
        //Delete <noscript> start and end tags
        if (tagName === 'noscript')
            return null;
        
        //Replace <div> with <p>
        if(tagName === 'div')
            return 'p';
            
        return tagName;
    }).fromHtml(html);

```

##Testing
```
$ npm test
```

##Questions or suggestions?
If you have any questions, please feel free to create an issue [here on github](https://github.com/inikulin/ineed/issues).


##Author
[Ivan Nikulin](https://github.com/inikulin) (ifaaan@gmail.com)

