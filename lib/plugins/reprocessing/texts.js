var Common = require('../../common'),
    SerializationPlugin = require('../serialization');


module.exports = {
    name: 'texts',
    extends: 'collect',

    init: function (ctx, replacer) {
        this.ctx = ctx;
        this.replacer = replacer;
    },

    onStartTag: function () {
        //NOTE: restore flag for new text tokens
        SerializationPlugin.escapeHtml = true;
    },

    onText: function (text) {
        if (Common.isPlainText(this.ctx.inBody, this.ctx.leadingStartTag, text)) {
            text = this.replacer(text, Common.escapeHtml);
            SerializationPlugin.escapeHtml = false;
        }

        return text;
    }
};
