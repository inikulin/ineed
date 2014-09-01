var url = require('url'),
    Common = require('../../common');


module.exports = {
    name: 'images',
    extends: 'collect',

    init: function (env) {
        this.env = env;
        this.collection = [];
    },

    onStartTag: function (startTag) {
        if (startTag.tagName === 'img') {
            var src = Common.getAttrValue(startTag.attrs, 'src') || '';

            this.collection.push({
                src: url.resolve(this.env.baseUrl, src),
                alt: Common.getAttrValue(startTag.attrs, 'alt') || ''
            })
        }
    },

    getCollection: function () {
        return this.collection;
    }
};
