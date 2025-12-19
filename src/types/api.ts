// API response wrapper
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

