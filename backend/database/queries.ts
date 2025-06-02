import { GoalModel } from "./schemas";

export const embeddedName = "embedded_name";
export const indexName = "vector_index_goals";

export async function findSimilarGoals(queryVector: number[]) {


    // remove name after debugging.
    const results = await GoalModel.aggregate([
        {
          $vectorSearch: {
            index: indexName,
            path: embeddedName,
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
      ]) as { name: string; score: number }[];
    
    console.log("Results:", results[0], results[1], results[2], results[3], results[4], results[5], results[6], results[7]); // Log only the first 10 results for debugging
      // Filter results with score >= 0.85
    //   finetune, like 'exercise' and 'sport' only give a score of less than 0.7
  const similarGoals = results.filter((result) => result.score >= 0.68);

  console.log("Similar goals:", similarGoals);
  console.log("Similar goals count:", similarGoals.length);
  return similarGoals.length;

}
