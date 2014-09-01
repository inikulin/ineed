var url = require('url'),
    Common = require('../../common');

module.exports = {
    name: 'images',
    extends: 'reprocess',

    init: function (env, replacer) {
        this.env = env;
        this.replacer = replacer;
    },

    onStartTag: function (startTag) {
        if (startTag.tagName === 'img') {
            var src = Common.getAttrValue(startTag.attrs, 'src') || '';

            src = this.replacer(this.env.baseUrl, src);
            Common.setAttrValue(startTag.attrs, 'src', src);
        }

        return startTag;
    }
};
