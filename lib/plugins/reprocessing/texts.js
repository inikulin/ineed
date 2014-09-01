var Common = require('../../common'),
    SerializationPlugin = require('../serialization');


module.exports = (function () {
    var env = null,
        rpl = null;

    return {
        name: 'texts',
        extends: 'collect',

        reset: function (environment, replacer) {
            env = environment;
            rpl = replacer;
        },

        onText: function (text) {
            if (Common.isPlainText(env.inBody, env.leadingStartTag, text))
                text = rpl(text, Common.escapeHtml);

            SerializationPlugin.skipTextHtmlEscaping = true;
            return text;
        }
    };
})();