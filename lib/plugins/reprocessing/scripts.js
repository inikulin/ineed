var url = require('url'),
    Common = require('../../common');

module.exports = {
    name: 'scripts',
    extends: 'reprocess',

    init: function (env, replacer) {
        this.env = env;
        this.replacer = replacer;
    },

    onStartTag: function (startTag) {
        if (startTag.tagName === 'script') {
            var src = Common.getAttrValue(startTag.attrs, 'src') || '';

            if (src) {
                src = this.replacer(this.env.baseUrl, src);
                Common.setAttrValue(startTag.attrs, 'src', src);
            }
        }

        return startTag;
    }
};
