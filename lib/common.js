var getAttrValue = exports.getAttrValue = function (attrs, attrName) {
    for (var i = 0; i < attrs.length; i++) {
        if (attrs[i].name.toLowerCase() === attrName)
            return attrs[i].value;
    }

    return null;
};

exports.setAttrValue = function (attrs, attrName, value) {
    for (var i = 0; i < attrs.length; i++) {
        if (attrs[i].name.toLowerCase() === attrName) {
            attrs[i].value = value;
            break;
        }
    }
};

exports.isStylesheet = function (startTag) {
    if (startTag.tagName === 'link') {
        var relAttr = getAttrValue(startTag.attrs, 'rel');

        return relAttr && relAttr.toLowerCase() === 'stylesheet';
    }

    return false;
};

exports.isPlainText = function (inBody, leadingStartTag, text) {
    return inBody &&
           leadingStartTag !== 'script' &&
           leadingStartTag !== 'style' &&
           text.trim().length > 0;
};