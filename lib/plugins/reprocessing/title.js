module.exports = (function () {
    var env = null,
        op = null;

    return {
        name: 'title',
        extends: 'collect',

        reset: function (environment, operator) {
            env = environment;
            op = operator;
        },

        onText: function (text) {
            if (!env.inBody && env.leadingStartTag === 'title')
                text = op(text);

            return text;
        }
    };
})();