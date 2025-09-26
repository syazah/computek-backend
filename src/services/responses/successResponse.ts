export function successResponse<T>(data: T, message: string = "Request successful") {
    return {
        success: true,
        message,
        data
    }
}