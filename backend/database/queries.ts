import { GoalModel } from "../goals/goals.model";

export const embeddedName = 'name'
export const indexName = 'vector_index_goals'

export async function findSimilarGoals(queryVector : number[]){

    const results = await GoalModel.aggregate([
        {
        "$vectorSearch": {
        "queryVector": queryVector,
        "path": embeddedName,
        "numCandidates": 5000, // what to do here?
        "limit": 5000, // what to do here?
        "index": indexName,
        }
        },
        // {
        //     "$count": "similarGoalsCount",
        // },
       ])
       

       console.log('results', results)
       return results
}