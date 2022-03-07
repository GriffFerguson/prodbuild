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
    do {
        file = file.replace(file.substring(file.indexOf('<!--'), file.indexOf('-->') + 3), '')
    } while (file.indexOf('<!--') != -1)
    return file
}


// CSS
function css(file) {

function getOccurences(tag, data) {
    instances = {total: 0, index: []}
    do {
        var index = data.indexOf(tag)
        instances.total += 1;
        instances.index.push(index)
        data = data.substring(index)
    } while (data.indexOf(tag) != -1)
    return instances
}

//Export
exports.test = test
exports.html = html
exports.css = css