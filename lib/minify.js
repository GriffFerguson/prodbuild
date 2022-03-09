// HTML
var test = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Error - Prodbuild</title>
    <style>
        body {
            margin:0;
            background-color: rgb(92, 190, 197);
            display:flex;
            align-content: center;
            justify-content: center;
            flex-direction: column;
            height:100vh;
        }
        h1, p {
            font-family: sans-serif;
            text-align: center;
            font-weight: bolder;
            color:rgb(50,50,50)
        }
        h1 {font-size:3vw;}
        p {font-size: 1vw;}
        #dir {
            font-family: monospace;
            font-weight: unset;
        }
    </style>
</head>
<!-- Comment goes here! -->
<body>
    <h1>Whoops! Prodbuild encountered an error while accessing that file!</h1>
    <p>
        Make sure the file exists at the specified path of '<span id="dir"></span>'
    </p>
    <script>
        document.getElementById('dir').innerText = window.location.pathname
    </script>
</body>
</html>`
function html(file) {
    file = file.replace(/>\s*\n*\s*</gmi,'><');
    var i = 0;
    var styleIndex = getTagOccurences('style', file);
    console.log(styleIndex)

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
exports.test = test
exports.html = html
exports.css = css