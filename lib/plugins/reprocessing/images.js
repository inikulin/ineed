var url = require('url'),
    Common = require('../../common');

module.exports = {
    name: 'images',
    extends: 'reprocess',

    init: function (ctx, replacer) {
        this.ctx = ctx;
        this.replacer = replacer;
    },

    onStartTag: function (startTag) {
        if (startTag.tagName === 'img') {
            var src = Common.getAttrValue(startTag.attrs, 'src') || '';

            src = this.replacer(this.ctx.baseUrl, src);
            Common.setAttrValue(startTag.attrs, 'src', src);
        }

        return startTag;
    }
};
