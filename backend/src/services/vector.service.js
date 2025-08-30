const { Pinecone } = require('@pinecone-database/pinecone')

const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });

const llmIndex = pc.Index('mern-llm')

async function createMemory({vectors, metadata, messageId}){
    await llmIndex.upsert([{
        id:messageId,
        values:vectors,
        metadata
    }])
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

module.exports = {createMemory, queryMemory}