module.exports = (function () {
    var env = null,
        op = null;

    return {
        name: 'cssCode',
        extends: 'modify',

        reset: function (environment, operator) {
            env = environment;
            op = operator;
        },

        onText: function (text) {
            if (env.leadingStartTag === 'style')
                text = op(text);

            return text;
        },

        getCollection: function () {
            return collection;
        }
    };
})();