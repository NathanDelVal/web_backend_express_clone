
abreviaNumero = async (value) => {
    var newValue = value;
    if (value >= 1000) {
        var valueStr = String(value)
        var suffixes = ["", " mil", " milhões", " bilhões", " trilhões"];
        var suffixNum = Math.floor(("" + value).length / (valueStr.length - 1));
        var shortValue = '';
        for (var precision = valueStr.length; precision >= 1; precision--) {
            shortValue = parseFloat((suffixNum != 0 ? (value / Math.pow(1000, suffixNum)) : value).toPrecision(precision));
            var dotLessShortValue = (shortValue + '').replace(/[^a-zA-Z 0-9]+/g, '');
            if (dotLessShortValue.length <= valueStr.length) {
                break;
            }
        }
        if (shortValue % 1 != 0) shortValue = shortValue.toFixed(3);
        newValue = shortValue + suffixes[suffixNum];
    } else {
        return newValue
    }
    //var aux = String(newValue)
    //return aux;
    return newValue
}


const abreviaNumero2 = async(value) => {
    var newValue = value;
    if (value >= 1000) {
        var valueStr = String(value)
        var suffixes = ["", " mil", " milhões", " bilhões", " trilhões"];
        var suffixNum = Math.floor(("" + value).length / (valueStr.length - 1));
        var shortValue = '';
        for (var precision = valueStr.length; precision >= 1; precision--) {
            shortValue = parseFloat((suffixNum != 0 ? (value / Math.pow(1000, suffixNum)) : value).toPrecision(precision));
            var dotLessShortValue = (shortValue + '').replace(/[^a-zA-Z 0-9]+/g, '');
            if (dotLessShortValue.length <= valueStr.length) {
                break;
            }
        }
        if (shortValue % 1 != 0) shortValue = shortValue.toFixed(3);
        newValue = shortValue + suffixes[suffixNum];
    } else {
        return newValue
    }
    return newValue
}