//Const
var
    TAGS_WITH_TEXT_ALLOWED_IN_HEAD = [
        'script', 'style', 'title', 'noscript', 'noframes'
    ],
    TAGS_ALLOWED_IN_HEAD = TAGS_WITH_TEXT_ALLOWED_IN_HEAD.concat([
        'html', 'head', 'base', 'basefont', 'bgsound', 'command', 'link', 'meta'
    ]);

module.exports = (function () {
    var env = null;

    return {
        reset: function (environment) {
            env = environment;
        },

        onStartTag: function (startTag) {
            //TODO baseURL
            if (!env.inBody)
                env.inBody = TAGS_ALLOWED_IN_HEAD.indexOf(startTag.tagName) < 0;

            env.inElement = startTag.selfClosing ? startTag.tagName : null;
        },

        onEndTag: function (tagName) {
            env.inElement = undefined;

            if (tagName === 'head')
                env.inBody = true;
        },

        onText: function () {
            if (!env.inBody && TAGS_WITH_TEXT_ALLOWED_IN_HEAD.indexOf(env.inElement) < 0)
                env.inBody = true;
        }
    }
})();