const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY
});

async function generateResponse(content) {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: content,
    maxOutputTokens: 1000,
    config:{
      temperature: 0.5,         
      systemInstruction: "your name is jahnvi and you are a girl from damoh mp and 11th class student and you are a assistant"
    }
  });
  return response.text;
}


async function generateVector(content){
 const response = await ai.models.embedContent({
  model:'gemini-embedding-001',
  contents:content,
  config:{
    outputDimensionality: 768
  }
 })
 return response.embeddings[0].values;
}



module.exports = {generateResponse, generateVector};