// Imports

import express from 'express';
import 'dotenv/config';
import getHostIp from './utils/hostIp.js';
import { Server } from 'socket.io';
import { createServer } from 'http';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import cookieParser from 'cookie-parser';
import apiRouter from './api/api.js';
import db from './database/quick.db.js';

// Variables

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);
const hostIP = getHostIp();
const PORT = process.env.PORT || 3001;

app.use(express.static(__dirname + '/public')); // Media Files
app.use(cookieParser()); // Cookies Middleware
app.use(express.json()); // JSON Middleware

// Routes

app.get('/', (req, res) => {

    if(!req.cookies.username) {
        const filePath = join(__dirname, 'views', 'login.html'); // Getting path of login.html

        return res.sendFile(filePath); // Rendering login.html
    }

    const filePath = join(__dirname, 'views', 'chats.html'); // Getting path of chats.html

    res.sendFile(filePath); // Rendering chats.html
});

// API Routes

app.use('/api', apiRouter);

// Socket.IO Connection

io.on('connection', (socket) => {

    // New Message Event
    socket.on("messageCreate", async(msg) => {

        const sentBy = msg.sentBy;
        const sentTo = msg.to;
        const content = msg.message;

        if(msg.to === msg.sentBy) return; // If sender and receiver are same

        // Getting chats of sender

        let senderChats = await db.get('chats-' + sentBy);

        if(!senderChats) senderChats = [];

        // Pushing Chats to sender's chats

        senderChats[senderChats.findIndex(chat => chat.username === sentTo)].messages.push({
            sentBy,
            message: content,
        });

        // Updating sender's chats

        await db.set('chats-' + sentBy, senderChats);

        // Getting chats of receiver

        let receiverChats = await db.get('chats-' + sentTo);

        if(!receiverChats) receiverChats = [];

        // Pushing Chats to receiver's chats

        receiverChats[receiverChats.findIndex(chat => chat.username === sentBy)].messages.push({
            sentBy,
            message: content,
        });

        // Updating receiver's chats

        await db.set('chats-' + sentTo, receiverChats);

        // Sending Event to all users
        io.emit("messageCreate", msg);     
    });
});

// Server

httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.\n\nLOCAL: http://localhost:${PORT}\nEXTERNAL: http://${hostIP}:${PORT}\n`);
});