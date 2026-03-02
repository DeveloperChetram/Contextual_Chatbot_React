const { Pinecone } = require('@pinecone-database/pinecone');

const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
const llmIndex = pc.Index('mern-llm');

async function createMemory({ vectors, metadata, messageId }) {
    await llmIndex.upsert([{ id: String(messageId), values: vectors, metadata }]);
}

async function queryMemory({ queryVector, limit, metadata }) {
    const data = await llmIndex.query({
        vector: queryVector,
        topK: limit,
        filter: metadata ? metadata : undefined,
        includeMetadata: true,
    });
    return data.matches;
}

/**
 * List all memories for a user.
 * Pinecone doesn't have a native list-by-metadata, so we query with a zero vector
 * and a large topK — this returns the top-100 most-similar which effectively
 * covers all memories for a user in normal usage.
 */
async function listMemories(userId) {
    // 768-dim zero vector for gemini-embedding-001
    const zeroVector = new Array(768).fill(0);
    const data = await llmIndex.query({
        vector: zeroVector,
        topK: 100,
        filter: { user: userId },
        includeMetadata: true,
    });
    return data.matches;
}

/**
 * Delete a specific memory vector by its Pinecone ID.
 */
async function deleteMemory(vectorId) {
    await llmIndex.deleteOne(vectorId);
}

module.exports = { createMemory, queryMemory, listMemories, deleteMemory };