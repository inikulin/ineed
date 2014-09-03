var Common = require('../../common'),
    SerializationPlugin = require('../serialization');


module.exports = {
    name: 'texts',
    extends: 'collect',

    init: function (ctx, replacer) {
        this.ctx = ctx;
        this.replacer = replacer;
    },

    onText: function (text) {
        if (Common.isPlainText(this.ctx.inBody, this.ctx.leadingStartTag, text))
            text = this.replacer(text, Common.escapeHtml);

        SerializationPlugin.skipTextHtmlEscaping = true;
        return text;
    }
};
