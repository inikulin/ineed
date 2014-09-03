var url = require('url'),
    Common = require('../../common');


module.exports = {
    name: 'images',
    extends: 'collect',

    init: function (ctx) {
        this.ctx = ctx;
        this.collection = [];
    },

    onStartTag: function (startTag) {
        if (startTag.tagName === 'img') {
            var src = Common.getAttrValue(startTag.attrs, 'src') || '';

            this.collection.push({
                src: url.resolve(this.ctx.baseUrl, src),
                alt: Common.getAttrValue(startTag.attrs, 'alt') || ''
            })
        }
    },

    getCollection: function () {
        return this.collection;
    }
};
