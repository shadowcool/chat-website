import express from 'express';
import chatsRouter from './chats.js';

const router = express.Router();

router.get('/', (req, res) => {
    res.status(200).json({
        code: 200,
        message: "Welcome to API",
    })
});

router.use('/chats', chatsRouter);

export default router;