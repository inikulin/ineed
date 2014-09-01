var Common = require('../../common');


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
                text = rpl(text);

            return text;
        }
    };
})();