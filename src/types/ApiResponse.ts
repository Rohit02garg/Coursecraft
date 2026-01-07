export interface ApiResponse {
    success: boolean;
    message: string;
    data?: any; // Useful for sending back a User or Course object
}