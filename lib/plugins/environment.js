var url = require('url'),
    Common = require('../common');


//Const
var TAGS_WITH_TEXT_ALLOWED_IN_HEAD = [
        'script', 'style', 'title', 'noscript', 'noframes'
    ],
    TAGS_ALLOWED_IN_HEAD = TAGS_WITH_TEXT_ALLOWED_IN_HEAD.concat([
        'html', 'head', 'base', 'basefont', 'bgsound', 'command', 'link', 'meta'
    ]);

module.exports = {
    init: function (env) {
        this.env = env;
        this.baseTagFound = false;
    },

    exitsHead: function (text) {
        //NOTE: any non-whitespace text in <head> causes a content transition into <body>
        return text.trim().length > 0 && TAGS_WITH_TEXT_ALLOWED_IN_HEAD.indexOf(this.env.leadingStartTag) < 0;
    },

    onStartTag: function (startTag) {
        if (!this.env.inBody) {
            this.env.inBody = TAGS_ALLOWED_IN_HEAD.indexOf(startTag.tagName) < 0;

            if (!this.baseTagFound && startTag.tagName === 'base') {
                var href = Common.getAttrValue(startTag.attrs, 'href');

                if (href)
                    this.env.baseUrl = url.resolve(this.env.baseUrl, href);
            }
        }

        this.env.leadingStartTag = startTag.selfClosing ? null : startTag.tagName;
    },

    onEndTag: function (tagName) {
        this.env.leadingStartTag = null;

        if (tagName === 'head')
            this.env.inBody = true;

        if (this.env.inBody && (tagName === 'body' || tagName === 'html'))
            this.env.inBody = false;
    },

    onText: function (text) {
        if (!this.env.inBody && this.exitsHead(text))
            this.env.inBody = true;
    }
};