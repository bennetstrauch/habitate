import { RequestHandler } from 'express'
import { ErrorWithStatus, StandardResponse } from '../utils/classes'
import { User, UserModel } from '../database/schemas/users.model'

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';


type RegisterReqHandler = RequestHandler<unknown, StandardResponse<string>, User, unknown>

// # check for uniqueness of username - case-insensitive
export const register: RegisterReqHandler = async (req, res, next) => {
    try {

        const newUser = req.body;

        const hashedPassword = await bcrypt.hash(newUser.password, 10)
        const newUserHashed = { ...req.body, password: hashedPassword }

        const savedUser = await UserModel.create(newUserHashed)
        const newUserId = savedUser._id.toString()


        res.status(201).json({ success: true, data: newUserId })

        console.log('User created successfully: ', savedUser)

    } catch (err) {
        next(err)
    }
}



type LoginResponse = { success: boolean, token?: string }
type LoginRequest = { email: string, password: string }

type LoginReqHandler = RequestHandler<unknown, LoginResponse, LoginRequest, unknown>

export const login: LoginReqHandler = async (req, res, next) => {

    const { email, password } = req.body;

    try {
        // Find user
        const user = await UserModel.findOne({ email });
        if (!user) {
            throw new ErrorWithStatus('Invalid email', 401)
        }

        // Compare password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new ErrorWithStatus('Invalid password', 401)
        }

        // Generate token
        const token = jwt.sign({ id: user._id, email: user.email }, process.env.SECRET_KEY_FOR_SIGNING_TOKEN, {
            expiresIn: '1h',
        });


        // Send token
        res.status(200).json({ success: true, token });

    } catch (err) {
        next(err);
    }

}