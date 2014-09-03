var url = require('url'),
    Common = require('../../common');

module.exports = {
    name: 'scripts',
    extends: 'reprocess',

    init: function (ctx, replacer) {
        this.ctx = ctx;
        this.replacer = replacer;
    },

    onStartTag: function (startTag) {
        if (startTag.tagName === 'script') {
            var src = Common.getAttrValue(startTag.attrs, 'src') || '';

            if (src) {
                src = this.replacer(this.ctx.baseUrl, src);
                Common.setAttrValue(startTag.attrs, 'src', src);
            }
        }

        return startTag;
    }
};
