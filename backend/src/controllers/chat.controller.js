const chatModel = require("../models/chat.model");
const messageModel = require("../models/message.model");

const createChatController = async (req, res) => {
    try {
        const { title } = req.body;
        if (!title || typeof title !== "string" || title.trim().length === 0) {
            return res.status(400).json({ message: "Title is required" });
        }
        if (title.trim().length > 200) {
            return res.status(400).json({ message: "Title cannot exceed 200 characters" });
        }

        const user = req.user;
        const chat = await chatModel.create({
            user: user._id,
            title: title.trim(),
        });

        res.status(201).json({
            message: "chat created",
            chat: {
                _id: chat._id,
                title: chat.title,
                user: chat.user,
                lastActivity: chat.lastActivity,
                createdAt: chat.createdAt,
                updatedAt: chat.updatedAt,
            },
        });
    } catch (error) {
        console.error("createChatController error:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

const getChatController = async (req, res) => {
    try {
        const user = req.user;
        const chats = await chatModel.find({ user: user._id }).sort({ createdAt: -1 });

        const sanitizedChats = chats.map((chat) => ({
            _id: chat._id,
            title: chat.title,
            user: chat.user,
            lastActivity: chat.lastActivity,
            createdAt: chat.createdAt,
            updatedAt: chat.updatedAt,
        }));

        res.status(200).json({ message: "chats fetched", chats: sanitizedChats });
    } catch (error) {
        console.error("getChatController error:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

/**
 * GET /api/chat/:id/messages
 * Fetches messages for a specific chat — paginated with cursor support.
 * Query params: ?before=<messageId>&limit=<number>
 */
const getMessagesByChatController = async (req, res) => {
    try {
        const { id: chatId } = req.params;
        const user = req.user;
        const limit = Math.min(parseInt(req.query.limit) || 50, 100); // max 100
        const before = req.query.before; // cursor — last seen messageId

        // Verify the chat belongs to this user
        const chat = await chatModel.findOne({ _id: chatId, user: user._id });
        if (!chat) {
            return res.status(404).json({ message: "Chat not found" });
        }

        const query = { chatId, user: user._id };
        if (before) {
            query._id = { $lt: before }; // cursor-based: messages older than `before`
        }

        const messages = await messageModel
            .find(query)
            .sort({ createdAt: 1 })
            .limit(limit)
            .lean();

        res.status(200).json({
            message: "messages fetched",
            messages,
            hasMore: messages.length === limit,
        });
    } catch (error) {
        console.error("getMessagesByChatController error:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

const updateChatController = async (req, res) => {
    try {
        const user = req.user;
        const { id } = req.params;
        const { title } = req.body;

        if (!title || typeof title !== "string" || title.trim().length === 0) {
            return res.status(400).json({ message: "Title is required" });
        }
        if (title.trim().length > 200) {
            return res.status(400).json({ message: "Title cannot exceed 200 characters" });
        }

        // Ensure the chat belongs to the requesting user
        const chat = await chatModel.findOneAndUpdate(
            { _id: id, user: user._id },
            { title: title.trim() },
            { new: true }
        );

        if (!chat) {
            return res.status(404).json({ message: "Chat not found" });
        }

        res.status(200).json({
            message: "chat updated",
            chat: {
                _id: chat._id,
                title: chat.title,
                user: chat.user,
                lastActivity: chat.lastActivity,
                createdAt: chat.createdAt,
                updatedAt: chat.updatedAt,
            },
        });
    } catch (error) {
        console.error("updateChatController error:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

const deleteChatController = async (req, res) => {
    try {
        const { id } = req.params;
        const user = req.user;

        const chat = await chatModel.findOneAndDelete({ _id: id, user: user._id });
        if (!chat) {
            return res.status(404).json({ message: "Chat not found" });
        }

        // Also delete all messages in this chat
        await messageModel.deleteMany({ chatId: id, user: user._id });

        res.status(200).json({ message: "Chat deleted" });
    } catch (error) {
        console.error("deleteChatController error:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = {
    createChatController,
    getChatController,
    getMessagesByChatController,
    updateChatController,
    deleteChatController,
};
