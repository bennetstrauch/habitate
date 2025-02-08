import { GoalModel } from "./schemas";


export const embeddedName = 'name'
export const indexName = 'vector_index_goals'

export async function findSimilarGoals(queryVector : number[]){

    const results = await GoalModel.aggregate([

        {
        "$vectorSearch": {
        "index": indexName,
        "path": embeddedName,
        "queryVector": queryVector,
        "numCandidates": 5000, // what to do here?
        "limit": 1000, // what to do here?
        
        }
        },
        {
            "$count": "similarGoalsCount",
        },
       ]) as {similarGoalsCount: number}[]

       if (results.length === 0) {
        console.log('No similar goals found.');
        return 0; // Default response
      }

       console.log('results', results)
       return results[0].similarGoalsCount
}