const urlParams = new URL(window.location.href).searchParams;
const channel = urlParams.get('channel');
const chatDiv = document.querySelector('#chat');
if (!channel) {
    console.error('No channel specified in the URL');
    const chatDiv = document.querySelector('#chat');
    if (chatDiv) {
        chatDiv.innerHTML = '<p style="color: red;">No channel specified in the URL</p>'
        + '<p style="color: red;">Please specify a channel in the URL, e.g., ?channel=example</p>';
    }
}
else if (chatDiv) {
    console.log('Channel:', channel);
    const tmi = window.tmi;
    let messages = [];
    
    function meowifyMessage(message) {
        // Replace each word with a 'meow' string matching the word's length, preserving punctuation and spaces
        return message.replace(/[a-zA-Z]+/g, (word) => {
            if (word.length === 0) return word; // Return empty string if no match

            // rare randoms
            let ran = Math.random();
            if (word.length === 3 && ran < 0.25) return 'mew';
            if (word.length === 3 && ran < 0.05) return 'nya';
            if (word.length <= 4 && ran < 0.15) return 'mewo';

            // default meow
            if (word.length < 4) return 'meow';

            // arbitrary length meow :}
            let meow = '';
            for (let i = 0; i < word.length; i++) {
                const islastletter = i === word.length - 1;
                let char = '';
                
                if (i === 0) char += 'm';
                else if (i === 1) char += 'e';
                else if (islastletter) char += 'w';
                else char += 'o';

                if (RegExp(/[A-Z]/).test(word[i])) {
                    char = char.toUpperCase();
                }
                meow += char;
            }
            return meow;
            // Thank you chat gpt for the following code as reference lol
            // const base = 'meow';
            // let meow = '';
            // for (let i = 0; i < word.length; i++) {
            //     meow += base[Math.min(i, base.length - 1)];
            // }
            // return meow;
        });
    }

    function addMessage(message) {
        messages.push(message);
        if (messages.length > 10) {
            messages.shift(); // Remove the oldest message
        }
    }
    function displayMessages() {
        chatDiv.innerHTML = ''; // Clear the chat div
        messages.forEach(msg => {
            const messageElement = document.createElement('div');
            messageElement.innerHTML = `<strong style="color:${msg.usercolor}">${msg.username}</strong>: ${meowifyMessage(msg.message)}`;
            chatDiv.appendChild(messageElement);
        });
        chatDiv.scrollTop = chatDiv.scrollHeight; // Scroll to the bottom
    }



    const client = new tmi.Client({
        channels: [ channel ]
    });
    client.connect();
    client.on('message', (channel, tags, message, self) => {
        if (self) return; // Ignore messages from the bot itself
        const username = tags['display-name'] || tags.username;
        const usercolor = tags.color || '#FFFFFF'; // Default to white if no color is provided
        addMessage({ username, usercolor, message });
        displayMessages();
    });
    client.on('messagedeleted', (channel, username, deletedMessage, userstate) => {
        messages = messages.filter(msg => msg.message !== deletedMessage);
        displayMessages();  
    });
    client.on('clearchat', (channel) => {
        messages = []; // Clear the chat when the chat is cleared
        displayMessages();
    });
}