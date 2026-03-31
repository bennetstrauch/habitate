"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.openaiClient = void 0;
exports.generateEmbedding = generateEmbedding;
const openai_1 = __importDefault(require("openai"));
exports.openaiClient = new openai_1.default({
    apiKey: process.env.OPEN_AI_KEY
});
function generateEmbedding(input) {
    return __awaiter(this, void 0, void 0, function* () {
        const vectorEmbedding = yield exports.openaiClient.embeddings.create({
            model: 'text-embedding-3-small',
            input // string or string[]
        });
        // console.log({
        // dimensions: vectorEmbedding.data[0].embedding.length, // 1536 dimentions
        // embedding: vectorEmbedding.data[0].embedding
        // });
        return vectorEmbedding.data[0].embedding;
    });
}
