/**
 * Response Sanitization Middleware
 * Removes sensitive data from API responses to prevent information leakage
 */

const sanitizeUserData = (user) => {
    if (!user || typeof user !== 'object') return user;

    const sanitizedUser = {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        credits: user.credits,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
    };

    // Remove any undefined/null values
    Object.keys(sanitizedUser).forEach(key => {
        if (sanitizedUser[key] === undefined || sanitizedUser[key] === null) {
            delete sanitizedUser[key];
        }
    });

    return sanitizedUser;
};

const sanitizeChatData = (chat) => {
    if (!chat || typeof chat !== 'object') return chat;

    const sanitizedChat = {
        _id: chat._id,
        title: chat.title,
        user: chat.user,
        lastActivity: chat.lastActivity,
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt
    };

    // Remove any undefined/null values
    Object.keys(sanitizedChat).forEach(key => {
        if (sanitizedChat[key] === undefined || sanitizedChat[key] === null) {
            delete sanitizedChat[key];
        }
    });

    return sanitizedChat;
};

const sanitizeMessageData = (message) => {
    if (!message || typeof message !== 'object') return message;

    const sanitizedMessage = {
        _id: message._id,
        user: message.user,
        chatId: message.chatId,
        content: message.content,
        role: message.role,
        character: message.character,
        lastActivity: message.lastActivity,
        createdAt: message.createdAt,
        updatedAt: message.updatedAt
    };

    // Remove any undefined/null values
    Object.keys(sanitizedMessage).forEach(key => {
        if (sanitizedMessage[key] === undefined || sanitizedMessage[key] === null) {
            delete sanitizedMessage[key];
        }
    });

    return sanitizedMessage;
};

const sanitizeResponse = (data) => {
    if (!data) return data;

    // Handle arrays
    if (Array.isArray(data)) {
        return data.map(item => sanitizeResponse(item));
    }

    // Handle Mongoose documents
    const docData = data && typeof data.toJSON === 'function' ? data.toJSON() : data;

    // Handle objects
    if (typeof docData === 'object' && docData !== null) {
        // Check if it's a user object
        if (docData.email && docData.fullName) {
            return sanitizeUserData(docData);
        }

        // Check if it's a chat object
        if (docData.title && docData.user) {
            return sanitizeChatData(docData);
        }

        // Check if it's a message object
        if (docData.content && docData.role) {
            return sanitizeMessageData(docData);
        }

        // For other objects, recursively sanitize
        const sanitized = {};
        Object.keys(docData).forEach(key => {
            // Skip sensitive fields
            if (['passwordHash', 'password', 'secret', 'token', 'refreshToken'].includes(key)) {
                return;
            }

            sanitized[key] = sanitizeResponse(docData[key]);
        });

        return sanitized;
    }

    return docData;
};

const responseSanitizer = (req, res, next) => {
    // Store the original json method
    const originalJson = res.json;

    // Override the json method to sanitize responses
    res.json = function (data) {
        const sanitizedData = sanitizeResponse(data);
        return originalJson.call(this, sanitizedData);
    };

    next();
};

module.exports = responseSanitizer;
