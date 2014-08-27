exports.getValue = function (attrs, attrName) {
    for (var i = 0; i < attrs.length; i++) {
        if (attrs[i].name === attrName)
            return attrs[i].value;
    }

    return null;
};
