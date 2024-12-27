import { GoalModel } from "../goals/goals.model";

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
            '$project': { '_id': 1 }
            }
        // {
        //     "$count": "similarGoalsCount",
        // },
       ])



       console.log('results', results)
       return results
}