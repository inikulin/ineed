var url = require('url'),
    Common = require('../../common');


module.exports = {
    name: 'stylesheets',
    extends: 'collect',

    init: function (env) {
        this.env = env;
        this.collection = [];
    },

    onStartTag: function (startTag) {
        if (Common.isStylesheet(startTag)) {
            var href = Common.getAttrValue(startTag.attrs, 'href') || '';

            href = url.resolve(this.env.baseUrl, href);
            this.collection.push(href);
        }
    },

    getCollection: function () {
        return this.collection;
    }
};
