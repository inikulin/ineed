var Common = require('../../common'),
    SerializationPlugin = require('../serialization');


module.exports = {
    name: 'texts',
    extends: 'collect',

    init: function (env, replacer) {
        this.env = env;
        this.replacer = replacer;
    },

    onText: function (text) {
        if (Common.isPlainText(this.env.inBody, this.env.leadingStartTag, text))
            text = this.replacer(text, Common.escapeHtml);

        SerializationPlugin.skipTextHtmlEscaping = true;
        return text;
    }
};
