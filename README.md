![logo](https://raw.github.com/inikulin/iwant/master/logo.png)  

[![Build Status](http://img.shields.io/travis/inikulin/iwant.svg?style=flat-square)](https://travis-ci.org/inikulin/iwant)

```js

var iwant = require('iwant');

iwant.collect
    .images
    .scripts
    .stylesheets
    .hyperlinks
    .from('http://google.com', function(err, response, results) {
        console.log(results);
    });

```

```js
var iwant = require('iwant'),
    stylus = require('stylus'),
    html = '!!!TODO!!!';
  
var result = iwant.modify.cssCode(stylus).fromHtml(html);

console.log(html);
```
