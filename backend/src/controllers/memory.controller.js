const { listMemories, deleteMemory } = require('../services/vector.service');

const getMemoriesController = async (req, res) => {
    try {
        const userId = req.user._id.toString();
        const memories = await listMemories(userId);
        res.status(200).json({ memories });
    } catch (error) {
        console.error('getMemoriesController error:', error.message);
        res.status(500).json({ message: 'Failed to fetch memories' });
    }
};

const deleteMemoryController = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) return res.status(400).json({ message: 'Memory ID is required' });
        await deleteMemory(id);
        res.status(200).json({ message: 'Memory deleted' });
    } catch (error) {
        console.error('deleteMemoryController error:', error.message);
        res.status(500).json({ message: 'Failed to delete memory' });
    }
};

module.exports = { getMemoriesController, deleteMemoryController };
