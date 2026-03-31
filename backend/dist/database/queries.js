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
Object.defineProperty(exports, "__esModule", { value: true });
exports.indexName = exports.embeddedName = void 0;
exports.findSimilarGoals = findSimilarGoals;
const schemas_1 = require("./schemas");
exports.embeddedName = "embedded_name";
exports.indexName = "vector_index_goals";
function findSimilarGoals(queryVector) {
    return __awaiter(this, void 0, void 0, function* () {
        // remove name after debugging.
        const results = yield schemas_1.GoalModel.aggregate([
            {
                $vectorSearch: {
                    index: exports.indexName,
                    path: exports.embeddedName,
                    queryVector: queryVector,
                    numCandidates: 1000,
                    limit: 100,
                },
            },
            {
                $project: {
                    name: 1,
                    score: { $meta: "vectorSearchScore" },
                },
            },
        ]);
        console.log("Results:", results[0], results[1], results[2], results[3], results[4], results[5], results[6], results[7]); // Log only the first 10 results for debugging
        // Filter results with score >= 0.85
        //   finetune, like 'exercise' and 'sport' only give a score of less than 0.7
        const similarGoals = results.filter((result) => result.score >= 0.68);
        console.log("Similar goals:", similarGoals);
        console.log("Similar goals count:", similarGoals.length);
        return similarGoals.length;
    });
}
