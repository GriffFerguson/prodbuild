// HTML
function html(file) {
    file = file.replace(/>\s*\n*\s*</gmi,'><');
    var i = 0;
    var scriptIndex = getTagOccurences('script', file)
    var styleIndex = getTagOccurences('style', file);

    // Remove comments
    do {
        if (file.indexOf('<!--') != - 1) {
            var substr = file.substring(file.indexOf('<!--'), (file.indexOf('-->') + 3));
            file = file.replace(substr, '')
        }
    } while (file.indexOf('<!--') != -1)

    // Process <style> tags
    do {
        var toReplace = file.substring(styleIndex.indexStart[i], styleIndex.indexEnd[i])
        file = file.replace(toReplace, css(toReplace))
        i+=1;
    } while (i < styleIndex.total)

    // Process '.ts' requests
    i = 0
    do {
        var scriptStr = file.substring(scriptIndex.indexStart[i], scriptIndex.indexEnd[i]);
        file = file.replace(scriptStr, scriptStr.replace('.ts', '.js'));
        i+=1;
    } while (i < scriptIndex.total)

    return file
}


// CSS
function css(file) {
    // Most minification
    /* 
    First capturing group "(?:(?<=:)\s|(?<=.*)\s(?={))": Made of boolean with two matches
        First match "(?<=:)\s*" matches any space preceded by a colon
        Second match "(?<=.*)\s*(?={)" matches any space preceded by any number of characters and followed by an opening bracket
        Third match "(?<=,)\s*" matches any space preceded by a comma
    Second capturing group "(?:\n*^\s*)": Replaces newlines and whitespaces after lines, converts to one line
    */
    file = file.replace(/(?:(?<=:)\s*|(?<=.*)\s*(?={)|(?<=,)\s*)|(?:\n*^\s*)/gmi, '')

    // Remove comments
    do {
        if (file.indexOf('/*') != - 1) {
            var substr = file.substring(file.indexOf('/*'), (file.indexOf('*/') + 2));
            file = file.replace(substr, '')
        }
    } while (file.indexOf('/*') != -1)

    return file
}

function getTagOccurences(tag, data) {
    instances = {total: 0, indexStart: [], indexEnd: []}
    do {
        var start = data.indexOf(`<${tag}>`)
        var end = data.indexOf(`</${tag}>`)
        instances.total += 1;
        instances.indexStart.push(start + (tag.length + 2))
        instances.indexEnd.push(end)
        data = data.substring(end + (tag.length + 3))
    } while (data.indexOf(tag) != -1)
    return instances
}

//Export
exports.html = html
exports.css = css