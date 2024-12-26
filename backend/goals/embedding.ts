import OpenAI from "openai";

const openaiClient = new OpenAI({
    apiKey: process.env.OPEN_AI_KEY
})


export async function generateEmbedding(input: string) {
    
    const vectorEmbedding = await openaiClient.embeddings.create({
    model: 'text-embedding-3-small',
    input // string or string[]
    });
    // console.log({
    // dimensions: vectorEmbedding.data[0].embedding.length, // 1536 dimentions
    // embedding: vectorEmbedding.data[0].embedding
    // });
    return vectorEmbedding.data[0].embedding;
   }