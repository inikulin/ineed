var url = require('url'),
    Common = require('../../common');

module.exports = (function () {
    var env = null,
        op = null;

    return {
        name: 'scripts',
        extends: 'modify',

        reset: function (environment, operator) {
            env = environment;
            op = operator;
        },

        onStartTag: function (startTag) {
            if (startTag.tagName === 'script') {
                var src = Common.getAttrValue(startTag.attrs, 'src') || '';

                if (src) {
                    src = op(env.baseUrl, src);
                    Common.setAttrValue(startTag.attrs, 'src', src);
                }
            }

            return startTag;
        }
    };
})();