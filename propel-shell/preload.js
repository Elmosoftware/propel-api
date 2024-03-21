const { ipcRenderer } = require('electron')

// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
window.addEventListener('DOMContentLoaded', () => {
    // If you need to run something on client side after the DOM loads, you can do it here.
})

//Every message from main process will be stored in the Session storage.
//The message must be composed by 2 elements, first one must be the key name and second the value.
ipcRenderer.on('ping', (event, message) => {
    let isArray = Array.isArray(message);
    let count = (isArray) ? message.length : 0;
    let evt = new CustomEvent("session-storage-changed")
    
    console.log(`Receiving data from main process...`)

    if (isArray && count == 2) {
        console.log(`Adding "${message[0]}" key to the session storage...`)
        sessionStorage.setItem(message[0], message[1]);
        window.dispatchEvent(evt);
    }
    else {
        console.log(`Message received doesn't have the right format. ${(isArray) ? "Message was an array but " : "Message was not an Array."}${(isArray && count !== 2) ? "with " + count.toString() + " item(s) insted of 2" : ""}`)
    }
})

