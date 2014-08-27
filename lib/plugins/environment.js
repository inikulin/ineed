var url = require('url'),
    Utils = require('../utils');


//Const
var TAGS_WITH_TEXT_ALLOWED_IN_HEAD = [
        'script', 'style', 'title', 'noscript', 'noframes'
    ],
    TAGS_ALLOWED_IN_HEAD = TAGS_WITH_TEXT_ALLOWED_IN_HEAD.concat([
        'html', 'head', 'base', 'basefont', 'bgsound', 'command', 'link', 'meta'
    ]);

module.exports = (function () {
    var env = null,
        baseTagFound = false;

    function exitsHead(text) {
        //NOTE: any non-whitespace text in <head> causes a content transition into <body>
        return text.trim().length > 0 && TAGS_WITH_TEXT_ALLOWED_IN_HEAD.indexOf(env.leadingStartTag) < 0
    }

    return {
        reset: function (environment) {
            env = environment;
            baseTagFound = false;
        },

        onStartTag: function (startTag) {
            if (!env.inBody) {
                env.inBody = TAGS_ALLOWED_IN_HEAD.indexOf(startTag.tagName) < 0;

                if (!baseTagFound && startTag.tagName === 'base') {
                    var href = Utils.getAttrValue(startTag.attrs, 'href');

                    if (href)
                        env.baseUrl = url.resolve(env.baseUrl, href);
                }
            }

            env.leadingStartTag = startTag.selfClosing ? undefined : startTag.tagName;
        },

        onEndTag: function (tagName) {
            env.leadingStartTag = undefined;

            if (tagName === 'head')
                env.inBody = true;

            if (env.inBody && (tagName === 'body' || tagName === 'html'))
                env.inBody = false;
        },

        onText: function (text) {
            if (!env.inBody && exitsHead(text))
                env.inBody = true;
        }
    }
})();