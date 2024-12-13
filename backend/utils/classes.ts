export class ErrorWithStatus extends Error {
    constructor(public message: string, public status: number) {
        super(message)
    }
}

export class StandardResponse<T>{
    success: boolean;
    data: T
}
