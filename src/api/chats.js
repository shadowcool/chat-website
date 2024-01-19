import express from 'express';
import db from '../database/quick.db.js';

const router = express.Router();

router.get('/', async(req, res) => {
    const { username } = req.query;

    if(!username || username === '') {
        return res.status(401).json({
            code: 401,
            message: "Username is required"
        })
    }

    let chats = await db.get('chats-' + username);

    if(!chats) {
        return res.status(201).json({
            code: 201,
            message: "No chats found"
        })
    }

    res.status(200).json({
        code: 200,
        message: "Chats found",
        chats: chats
    })
})

router.post('/', async(req, res) => {
    const { username } = req.query;
    const { newUser } = req.body;

    let chats = await db.get('chats-' + username);

    if(!chats) chats = [];

    chats.push({
        username: newUser,
        messages: []
    });

    await db.set('chats-' + username, chats);

    res.status(200).json({
        code: 200,
        message: "Chats updated",
        chats: chats,
    })
});

export default router;