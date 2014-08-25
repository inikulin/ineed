exports.getAttrValue = function (attrs, attrName) {
    for (var i = 0; i < attrs.length; i++) {
        if (attrs[i].name === attrName)
            return attrs[i].value;
    }

    return null;
};

//NOTE: monad-flavored control flow: rollback to the previous value if the new one is undefined.
exports.transanctional = function (currentValue, newValue) {
    if (newValue !== undefined)
        return newValue;

    return currentValue;
};