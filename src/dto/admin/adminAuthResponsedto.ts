
export interface AdminDTO {
  id: string
  email: string
  role: "admin"
}
export interface AdminAuthResponseDTO {
  admin: AdminDTO
  accessToken: string
  refreshToken: string
}