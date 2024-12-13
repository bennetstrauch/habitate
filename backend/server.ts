import express, {json} from 'express'
import cors from 'cors'
import morgan from 'morgan'
import { userRouter } from './users/users.router';
import { errorHandler, routerNotFoundHandler } from './utils/handlers';
import { connectToDB } from './database/connection';
import { goalRouter } from './goals/goals.router';
import { checkToken } from './users/users.middleware';


const app = express();

connectToDB()

app.use(morgan('dev'))
app.use(cors())
app.use(json())

app.use('/users', userRouter)
app.use('/goals', checkToken, goalRouter)


app.use(routerNotFoundHandler)
app.use(errorHandler)

app.listen(3000, () => console.log('Server listening on Port 3000'))