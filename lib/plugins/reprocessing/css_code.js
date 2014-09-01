module.exports = (function () {
    var env = null,
        rpl = null;

    return {
        name: 'cssCode',
        extends: 'reprocess',

        reset: function (environment, replacer) {
            env = environment;
            rpl = replacer;
        },

        onText: function (text) {
            if (env.leadingStartTag === 'style')
                text = rpl(text);

            return text;
        },

        getCollection: function () {
            return collection;
        }
    };
})();