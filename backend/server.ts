import express, {json, urlencoded} from 'express'
import cors from 'cors'
import morgan from 'morgan'
import { userRouter } from './users/users.router';
import { errorHandler, routerNotFoundHandler } from './utils/handlers';
import { connectToDB } from './database/connection';
import { goalRouter } from './goals/goals.router';
import { checkToken } from './users/users.middleware';
import { findSimilarGoals } from './database/queries';
import { Goal, GoalModel } from './goals/goals.model';


const app = express();

connectToDB()

app.use(morgan('dev'))
app.use(cors())
app.use(json())
app.use(urlencoded())


app.use('/users', userRouter)
app.use('/goals', checkToken, goalRouter)

app.use(routerNotFoundHandler)
app.use(errorHandler)


app.listen(3000, () => console.log('Server listening on Port 3000'))


async function test(){
const vector = Array.from({ length: 1536 }, () => Math.random());
const goal = await GoalModel.findOne({ _id: '676d36de8f67316b443ebadc',}) as Goal;
console.log('goal', goal)
findSimilarGoals(goal.embedded_name)
}

test()