export type AuthorizeUserType = {
    id: string, 
    username: string, 
    role: string, 
    device_type: string, 
    ip_address?: string, 
    latitude?: number, 
    longitude?: number
}