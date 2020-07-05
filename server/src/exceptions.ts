

export class ResourceNotFoundError extends Error {

    constructor(private resource: string, private identifier: unknown) {
        super(`${resource} not found`);
    }
}

export class FormValidationError extends Error {

    constructor(private formId: string, private schema: unknown, private data: unknown, private errors: unknown[]) {
        super(`Validation error for form ${formId}`);
    }

}

export class ApiError extends Error {
    constructor(msg: string, public code?: number, public meta?: unknown) {
        super(msg);
    }
}
