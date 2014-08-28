var Common = require('../../common');


module.exports = (function () {
    var env = null,
        op = null;

    return {
        name: 'texts',
        extends: 'collect',

        reset: function (environment, operator) {
            env = environment;
            op = operator;
        },

        onText: function (text) {
            if (Common.isPlainText(env.inBody, env.leadingStartTag, text))
                text = op(text);

            return text;
        }
    };
})();