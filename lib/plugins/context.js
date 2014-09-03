var url = require('url'),
    Common = require('../common');


//Const
var TAGS_WITH_TEXT_ALLOWED_IN_HEAD = [
        'script', 'style', 'title', 'noscript', 'noframes'
    ],
    TAGS_ALLOWED_IN_HEAD = [
        'html', 'head', 'base', 'basefont', 'bgsound', 'command', 'link', 'meta'
    ].concat(TAGS_WITH_TEXT_ALLOWED_IN_HEAD);


//NOTE: make fast lookup tables from arrays
TAGS_WITH_TEXT_ALLOWED_IN_HEAD = Common.toLookupTable(TAGS_WITH_TEXT_ALLOWED_IN_HEAD);
TAGS_ALLOWED_IN_HEAD = Common.toLookupTable(TAGS_ALLOWED_IN_HEAD);


module.exports = {
    init: function (ctx) {
        this.ctx = ctx;
        this.baseTagFound = false;
    },

    exitsHead: function (text) {
        //NOTE: any non-whitespace text in <head> causes a content transition into <body>
        return text.trim().length > 0 && !TAGS_WITH_TEXT_ALLOWED_IN_HEAD[this.ctx.leadingStartTag];
    },

    onStartTag: function (startTag) {
        if (!this.ctx.inBody) {
            this.ctx.inBody = !TAGS_ALLOWED_IN_HEAD[startTag.tagName];

            if (!this.baseTagFound && startTag.tagName === 'base') {
                var href = Common.getAttrValue(startTag.attrs, 'href');

                if (href)
                    this.ctx.baseUrl = url.resolve(this.ctx.baseUrl, href);
            }
        }

        this.ctx.leadingStartTag = startTag.selfClosing ? null : startTag.tagName;
    },

    onEndTag: function (tagName) {
        this.ctx.leadingStartTag = null;

        if (tagName === 'head')
            this.ctx.inBody = true;

        if (this.ctx.inBody && (tagName === 'body' || tagName === 'html'))
            this.ctx.inBody = false;
    },

    onText: function (text) {
        if (!this.ctx.inBody && this.exitsHead(text))
            this.ctx.inBody = true;
    }
};