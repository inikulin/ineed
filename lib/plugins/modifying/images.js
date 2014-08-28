var url = require('url'),
    Common = require('../../common');

module.exports = (function () {
    var env = null,
        op = null;

    return {
        name: 'images',
        extends: 'modify',

        reset: function (environment, operator) {
            env = environment;
            op = operator;
        },

        onStartTag: function (startTag) {
            if (startTag.tagName === 'img') {
                var src = Common.getAttrValue(startTag.attrs, 'src') || '';

                src = op(env.baseUrl, src);
                Common.setAttrValue(startTag.attrs, 'src', src);
            }

            return startTag;
        }
    };
})();