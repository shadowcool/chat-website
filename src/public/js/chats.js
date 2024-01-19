const socket = io();

// GET USERNAME

const getUsername = () => {
    const username = document.cookie.split('=')[1];
    return username;
}

// GET CHATS

const getChats = async () => {
    const username = getUsername();
    const url = `${window.location.origin}/api/chats?username=${username}`;

    const res = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })

    const data = await res.json();

    if(data.code === 201) {
        return null;
    }

    const chats = data.chats;

    return chats;
}

// CREATE CHAT

const createChat = async (username) => {
    const url = `${window.location.origin}/api/chats?username=${getUsername()}`;

    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            newUser: username,
            messages: [],
        })
    })

    const data = await res.json();

    const chats = data.chats;

    return chats;
}

// RENDER CHATS

const renderChats = (chats) => {
    const chatsContainer = document.getElementById('chats');

    if(chats === null) return;

    chats.forEach(async(chat) => {
        const username = chat.username;
        let lastMessage;
        if(chat.messages && chat.messages.length > 0) {
            lastMessage = `${chat.messages[chat.messages.length - 1].sentBy === username ? "" : "You: "}${chat.messages[chat.messages.length - 1].message}`;
        }

        if(lastMessage === undefined) lastMessage = "";

        const chatElement = `
            <li class="chat">
                <a onclick="renderChatMessages('${username}')" style="cursor: pointer;">
                    <div class="chat-details">
                        <div class="chat-username">${username}</div>
                        <div class="chat-last-message" id="chat-last-message">${lastMessage}</div>
                    </div>
                </a>
            </li>
        `;

        chatsContainer.innerHTML += chatElement;
    })

}

// RENDER CHAT

const renderChat = (chat) => {
    const chatContainer = document.getElementById('chats');

    const username = chat.username;
    lastMessage = `${chat.messages[chat.messages.length - 1].sentBy === username ? "" : "You: "}${chat.messages[chat.messages.length - 1].message}`;

    if(lastMessage === undefined) lastMessage = "";
    else lastMessage = lastMessage.message;

    const chatElement = `
        <li class="chat">
            <a onclick="renderChatMessages('${username}')" style="cursor: pointer;">
                <div class="chat-details">
                    <div class="chat-username">${username}</div>
                    <div class="chat-last-message" id="chat-last-message">${lastMessage}</div>
                </div>
            </a>
        </li>
    `;

    chatContainer.innerHTML += chatElement;
}

// GET CHAT

const getChat = async (username) => {
    const chats = await getChats();

    const chat = chats.find((chat) => chat.username === username);

    return chat;
}

// RENDER CHAT MESSAGES

const renderChatMessages = (username) => {
    const messagesContainer = document.getElementById('messages');

    messagesContainer.innerHTML = '';

    getChat(username).then((chat) => {
        const messages = chat.messages;
        
        if(messages) {
            messages.forEach((msg) => {
                const messageSent = msg.sentBy === getUsername();

                const message = msg.message;
    
                const messageLeft = messageSent ? 'message-right' : 'message-left';
    
                const messageElement = `
                    <li class="message ${messageLeft}">
                        <div class="message-content"><div class="message-text">${message}</div></div>
                    </li>
                `;
    
                messagesContainer.innerHTML += messageElement;
            })
        }
    
        const chatName = document.getElementById('chat-name');
    
        chatName.innerHTML = username;
    
        const chatFooter = document.getElementById('chat-footer');
    
        chatFooter.innerHTML = `
            <div class="chat-message">
                <input id="input-chat" class="input-chat" autocomplete="off">
                <div class="input-btn-container">
                    <button class="input-btn" id="input-btn" onclick="sendMessage();">Send</button>
                </div>
            </div>
        `;
    });
}

const sendMessage = () => {
    const message = document.getElementById('input-chat').value;

    socket.emit('messageCreate', {
        username: getUsername(),
        message: message,
        to: document.getElementById('chat-name').innerHTML ? document.getElementById('chat-name').innerHTML : null,
        sentBy: getUsername(),
    });

    document.getElementById('input-chat').value = '';
}

// EVENT LISTENERS

// NEW MESSAGE

socket.on('messageCreate', (msg) => {
    if(!document.getElementById('chat-name').innerHTML) return;
    
    const messageSent = msg.sentBy === getUsername();

    const message = msg.message;

    const messageLeft = messageSent ? 'message-right' : 'message-left';

    const messageElement = `
        <li class="message ${messageLeft}">
            <div class="message-content"><div class="message-text">${message}</div></div>
        </li>
    `;

    const messagesContainer = document.getElementById('messages');

    messagesContainer.innerHTML += messageElement;

    const lastMessageContainer = document.getElementById('chat-last-message');
    lastMessageContainer.innerHTML = `${messageSent ? 'You: ' : ''}${message}`;
});

// NEW CHAT

const addChat = document.getElementById('new-chat-btn');

addChat.addEventListener('click', async() => {
    const username = prompt("Enter username");

    if(username === null || username === '') return;

    const chats = await createChat(username);

    const chat = chats[chats.length - 1];

    renderChat(chat);
});

// CALL FUNCTIONS

const main = async() => {
    const chats = await getChats();
    renderChats(chats);
}

main();