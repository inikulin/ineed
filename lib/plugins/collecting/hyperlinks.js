var url = require('url'),
    Common = require('../../common');


module.exports = {
    name: 'hyperlinks',
    extends: 'collect',

    init: function (ctx) {
        this.ctx = ctx;
        this.collection = [];
        this.pendingHyperlink = null;
    },

    tryEmitPendingHyperlink: function () {
        if (this.pendingHyperlink) {
            this.collection.push(this.pendingHyperlink);
            this.pendingHyperlink = null;
        }
    },

    onStartTag: function (startTag) {
        if (startTag.tagName === 'a') {
            var href = Common.getAttrValue(startTag.attrs, 'href') || '';

            this.pendingHyperlink = {
                href: url.resolve(this.ctx.baseUrl, href),
                text: ''
            };
        }

        else
            this.tryEmitPendingHyperlink();
    },

    onEndTag: function () {
        this.tryEmitPendingHyperlink();
    },

    onText: function (text) {
        if (this.pendingHyperlink)
            this.pendingHyperlink.text = text;
    },

    getCollection: function () {
        this.tryEmitPendingHyperlink();
        return this.collection;
    }
};
