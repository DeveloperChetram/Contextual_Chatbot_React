const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true,
    },
    chatId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'chats',
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['user', 'model'],
        default: 'user',
    },
    character: {
        type: String,
        default: 'atomic',
    },
    lastActivity: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });

// PERF-02: Indexes for fast per-chat message queries (was missing — caused full collection scans)
messageSchema.index({ user: 1, chatId: 1 });
messageSchema.index({ chatId: 1, createdAt: 1 });

const messageModel = mongoose.model('messages', messageSchema);

module.exports = messageModel;