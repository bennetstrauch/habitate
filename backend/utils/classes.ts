export class ErrorWithStatus extends Error {
    constructor(public override message: string, public status: number, public error?: string) {
        super(message)
    }
}

// ## questionmark needed?

