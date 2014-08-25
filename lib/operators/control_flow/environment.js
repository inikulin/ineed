//Const
var
    TAGS_WITH_TEXT_ALLOWED_IN_HEAD = [
        'script', 'style', 'title', 'noscript', 'noframes'
    ],
    TAGS_ALLOWED_IN_HEAD = TAGS_WITH_TEXT_ALLOWED_IN_HEAD.concat([
        'html', 'head', 'base', 'basefont', 'bgsound', 'command', 'link', 'meta'
    ]);

module.exports = (function () {
    var state = null;

    return {
        reset: function (commonState) {
            state = commonState;
        },

        onStartTag: function (startTag) {
            //TODO baseURL
            if (!state.inBody)
                state.inBody = TAGS_ALLOWED_IN_HEAD.indexOf(startTag.tagName) < 0;

            state.inElement = startTag.selfClosing ? startTag.tagName : null;
        },

        onEndTag: function (tagName) {
            state.inElement = null;

            if (tagName === 'head')
                state.inBody = true;
        },

        onText: function () {
            if (!state.inBody && TAGS_WITH_TEXT_ALLOWED_IN_HEAD.indexOf(state.inElement) < 0)
                state.inBody = true;
        }
    }
})();