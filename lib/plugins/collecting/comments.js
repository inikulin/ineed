module.exports = {
    name: 'comments',
    extends: 'collect',

    init: function () {
        this.collection = [];
    },

    onComment: function (comment) {
        this.collection.push(comment);
    },

    getCollection: function () {
        return this.collection;
    }
};
