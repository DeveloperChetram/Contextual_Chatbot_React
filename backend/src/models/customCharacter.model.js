const mongoose = require('mongoose');

const customCharacterSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true,
    },
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 50,
    },
    description: {
        type: String,
        trim: true,
        maxlength: 200,
        default: '',
    },
    systemPrompt: {
        type: String,
        required: true,
        maxlength: 2000,
    },
    avatarColor: {
        type: String,
        default: '#06b6d4',
    },
}, { timestamps: true });

customCharacterSchema.index({ user: 1 });

const CustomCharacter = mongoose.model('customcharacters', customCharacterSchema);
module.exports = CustomCharacter;
