module.exports = (function () {
    var env = null,
        rpl = null;

    return {
        name: 'title',
        extends: 'collect',

        reset: function (environment, replacer) {
            env = environment;
            rpl = replacer;
        },

        onText: function (text) {
            if (!env.inBody && env.leadingStartTag === 'title')
                text = rpl(text);

            return text;
        }
    };
})();