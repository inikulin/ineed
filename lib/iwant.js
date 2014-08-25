var parse5 = require('parse5'),
    request = require('request'),
    Utils = require('./common');


//Const
var TAGS_ALLOWED_IN_HEAD = [
    'html', 'head', 'base', 'basefont', 'bgsound', 'command', 'link', 'meta', 'noscript', 'noframes', 'style', 'script'
];


//Scrapper
var Scrapper = function () {
    this.extractors = [];
    this.charsetEncoding = null;
    this.baseTagFound = false;

    this.commonState = {
        baseUrl: null,
        inElement: null,
        inBody: false
    };

    var scrapper = this;

    //NOTE: we don't use bind() here because it uses quite slow .apply() internally.
    this.parser = new parse5.SimpleApiParser({
        doctype: function (name, publicId, systemId) {
            scrapper._onDoctype(name, publicId, systemId);
        },

        startTag: function (tagName, attrs, selfClosing) {
            scrapper._onStartTag(tagName, attrs, selfClosing);
        },

        endTag: function (tagName) {
            scrapper._onEndTag(tagName);
        },

        text: function (text) {
            scrapper._onText(text);
        },

        comment: function (text) {
            scrapper._onComment(text);
        }
    });
};


//Static
Scrapper._validateExtractor = function (extractor) {
    if (!extractor.name)
        throw new Error('iwant: Extractor should have "name" property.');

    if (!extractor.reset)
        throw new Error('iwant: Extractor should have "reset" method');

    if (!extractor.getResult)
        throw new Error('iwant: Extractor should have "getResult()" method.');
};


//Parser handlers
Scrapper.prototype._onDoctype = function (name, publicId, systemId) {
    for (var i = 0; i < this.extractors.length; i++) {
        if (this.extractors[i].doctype)
            this.extractors[i].doctype(name, publicId, systemId);
    }
};

Scrapper.prototype._onStartTag = function (tagName, attrs, selfClosing) {
    //TODO: baseTag, meta charset, encode attrs with charset encoding

    if (!this.commonState.inBody)
        this.commonState.inBody = TAGS_ALLOWED_IN_HEAD.indexOf(tagName) < 0;

    this.commonState.inElement = selfClosing ? tagName : null;

    for (var i = 0; i < this.extractors.length; i++) {
        if (this.extractors[i].startTag)
            this.extractors[i].startTag(tagName, attrs, selfClosing);
    }
};

Scrapper.prototype._onEndTag = function (tagName) {
    this.commonState.inElement = null;

    if (tagName === 'head')
        this.commonState.inBody = true;

    for (var i = 0; i < this.extractors.length; i++) {
        if (this.extractors[i].endTag)
            this.extractors[i].endTag(tagName);
    }
};

Scrapper.prototype._onText = function (text) {
    //TODO: encode with charsetEncoding
    if (!this.commonState.inBody &&
        this.commonState.inElement !== 'script' &&
        this.commonState.inElement !== 'style' &&
        this.commonState.inElement !== 'title' &&
        this.commonState.inElement !== 'noscript' &&
        this.commonState.inElement !== 'noframes') {
        this.commonState.inBody = true;
    }

    for (var i = 0; i < this.extractors.length; i++) {
        if (this.extractors[i].text)
            this.extractors[i].text(text);
    }
};

Scrapper.prototype._onComment = function (text) {
    //TODO: encode with charsetEncoding

    for (var i = 0; i < this.extractors.length; i++) {
        if (this.extractors[i].comment)
            this.extractors[i].comment(text);
    }
};


//API
Scrapper.prototype.extractUsing = function (extractor) {
    Scrapper._validateExtractor(extractor);

    var alreadyAdded = false;

    for (var i = 0; i < this.extractors.length; i++) {
        if (this.extractors[i].name === extractor.name) {
            alreadyAdded = true;
            break;
        }
    }

    if (!alreadyAdded)
        this.extractors.push(extractor);

    return this;
};

Scrapper.prototype.fromHtml = function (html, baseUrl) {
    var result = {};

    this.commonState.baseUrl = baseUrl;
    this.commonState.inElement = null;
    this.commonState.inBody = false;

    for (var i = 0; i < this.extractors.length; i++)
        this.extractors[i].reset(this.commonState);

    this.parser.parse(html);

    for (var j = 0; j < this.extractors.length; j++)
        result[this.extractors[j].name] = this.extractors[j].getResult();

    return result;
};
