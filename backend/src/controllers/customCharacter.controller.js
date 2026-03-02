const CustomCharacter = require('../models/customCharacter.model');

const getCustomCharactersController = async (req, res) => {
    try {
        const characters = await CustomCharacter.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.status(200).json({ characters });
    } catch (error) {
        console.error('getCustomCharactersController error:', error.message);
        res.status(500).json({ message: 'Failed to fetch characters' });
    }
};

const createCustomCharacterController = async (req, res) => {
    try {
        const { name, description, systemPrompt, avatarColor } = req.body;

        if (!name || name.trim().length === 0) return res.status(400).json({ message: 'Name is required' });
        if (name.trim().length > 50) return res.status(400).json({ message: 'Name cannot exceed 50 chars' });
        if (!systemPrompt || systemPrompt.trim().length === 0) return res.status(400).json({ message: 'System prompt is required' });
        if (systemPrompt.trim().length > 2000) return res.status(400).json({ message: 'System prompt cannot exceed 2000 chars' });

        const character = await CustomCharacter.create({
            user: req.user._id,
            name: name.trim(),
            description: description?.trim() ?? '',
            systemPrompt: systemPrompt.trim(),
            avatarColor: avatarColor || '#06b6d4',
        });

        res.status(201).json({ message: 'Character created', character });
    } catch (error) {
        console.error('createCustomCharacterController error:', error.message);
        res.status(500).json({ message: 'Failed to create character' });
    }
};

const updateCustomCharacterController = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id || id === 'undefined' || id === 'null') {
            return res.status(400).json({ message: 'Valid Character ID is required' });
        }

        const { name, description, systemPrompt, avatarColor } = req.body;

        if (name && name.trim().length > 50) return res.status(400).json({ message: 'Name cannot exceed 50 chars' });
        if (systemPrompt && systemPrompt.trim().length > 2000) return res.status(400).json({ message: 'System prompt cannot exceed 2000 chars' });

        const character = await CustomCharacter.findOneAndUpdate(
            { _id: id, user: req.user._id },
            {
                ...(name && { name: name.trim() }),
                ...(description !== undefined && { description: description.trim() }),
                ...(systemPrompt && { systemPrompt: systemPrompt.trim() }),
                ...(avatarColor && { avatarColor }),
            },
            { new: true }
        );

        if (!character) return res.status(404).json({ message: 'Character not found' });
        res.status(200).json({ message: 'Character updated', character });
    } catch (error) {
        console.error('updateCustomCharacterController error:', error.message);
        res.status(500).json({ message: 'Failed to update character' });
    }
};

const deleteCustomCharacterController = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id || id === 'undefined' || id === 'null') {
            return res.status(400).json({ message: 'Valid Character ID is required' });
        }

        const character = await CustomCharacter.findOneAndDelete({ _id: id, user: req.user._id });
        if (!character) return res.status(404).json({ message: 'Character not found' });
        res.status(200).json({ message: 'Character deleted' });
    } catch (error) {
        console.error('deleteCustomCharacterController error:', error.message);
        res.status(500).json({ message: 'Failed to delete character' });
    }
};

module.exports = {
    getCustomCharactersController,
    createCustomCharacterController,
    updateCustomCharacterController,
    deleteCustomCharacterController,
};
