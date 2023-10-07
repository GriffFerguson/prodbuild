var socket = new WebSocket(`ws://${location.host}/_prodbuild/socket`)

socket.onmessage = (msg) => {
    location.reload();
}