var url = require('url'),
    Common = require('../../common');

module.exports = (function () {
    var env = null,
        rpl = null;

    return {
        name: 'images',
        extends: 'reprocess',

        reset: function (environment, replacer) {
            env = environment;
            rpl = replacer;
        },

        onStartTag: function (startTag) {
            if (startTag.tagName === 'img') {
                var src = Common.getAttrValue(startTag.attrs, 'src') || '';

                src = rpl(env.baseUrl, src);
                Common.setAttrValue(startTag.attrs, 'src', src);
            }

            return startTag;
        }
    };
})();