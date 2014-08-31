![logo](https://raw.github.com/inikulin/iwant/master/logo.png)  

[![Build Status](http://img.shields.io/travis/inikulin/iwant.svg?style=flat-square)](https://travis-ci.org/inikulin/iwant)



*Web scraping and HTML-reprocessing. The easy way.*

`iwant` allows you collect useful data from web pages using simple and fancy API. Let's collect images, hyperlinks, scripts and stylesheets from www.google.com:

```js

var iwant = require('iwant');

iwant.collect.images.hyperlinks.scripts.stylesheets.from('http://www.google.com',
    function (err, response, results) {
        console.log(results);
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

##API
The general form:

####```iwant.<action>[.<plugin>...].<from*>```

---------------------------------------
###from* methods
#####.fromHtml(html)
Accepts `html` string as an argument and synchronously returns `result` of the action.

*Example:*
```js
var result = iwant.collect.texts.from('<div>Hey ya</div>');
```

#####.from(options, callback)
Asynchronously loads specified page and invokes `callback(err, response, result)`. It passes `response` object to `callback` in case if you need response headers or status codes. The first argument can be either a `url` or an `options` object.
The set of options is the same as in @mikeal's [request](https://github.com/mikeal/request#requestoptions-callback), so you can use POST method, set request headers or do any other advanced setup for the page request.

###.collect action
Collects information specified by plugins set. The `result` of the action is an object that contains individual plugin results as an properties.

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
####Plugins:

##Testing
```
$ npm test
```

##Questions or suggestions?
If you have any questions, please feel free to create an issue [here on github](https://github.com/inikulin/iwant/issues).


##Author
[Ivan Nikulin](https://github.com/inikulin) (ifaaan@gmail.com)

