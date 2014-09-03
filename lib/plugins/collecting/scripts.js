var url = require('url'),
    Common = require('../../common');


module.exports = {
    name: 'scripts',
    extends: 'collect',

    init: function (ctx) {
        this.ctx = ctx;
        this.collection = [];
    },

    onStartTag: function (startTag) {
        if (startTag.tagName === 'script') {
            var src = Common.getAttrValue(startTag.attrs, 'src') || '';

            if (src) {
                src = url.resolve(this.ctx.baseUrl, src);
                this.collection.push(src);
            }
        }
    },

    getCollection: function () {
        return this.collection;
    }
};
