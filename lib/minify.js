// HTML
function html(file) {
    file = file.replace(/>\s*\n*\s*</gmi,'><');
    var i = 0;
    var styleIndex = getTagOccurences('style', file);

    // Remove comments
    do {
        file = file.replace(file.substring(file.indexOf('<!--'), file.indexOf('-->') + 3), '')
    } while (file.indexOf('<!--') != -1)

    // Process <style> tags
    do {
        var toReplace = file.substring(styleIndex.indexStart[i], styleIndex.indexEnd[i])
        file = file.replace(toReplace, css(toReplace))
        i+=1;
    } while (i < styleIndex.total)

    return file
}


// CSS
function css(file) {
    file = file.replace(/\s*\n*\s*/gmi, '')
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