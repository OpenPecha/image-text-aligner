// User roles in the system
export enum UserRole {
  Admin = 'Admin',
  Annotator = 'Annotator',
  Reviewer = 'Reviewer',
  FinalReviewer = 'FinalReviewer',
}

// User interface
export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  groupId?: string
  picture?: string
  createdAt?: Date
}

// Request payload for creating users
export interface CreateUserDTO {
  name: string
  email: string
  role?: UserRole
  groupId?: string
  picture?: string
}

// Request payload for updating users
export interface UpdateUserDTO {
  name?: string
  role?: UserRole
  groupId?: string
}

// Paginated response wrapper
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

// User query filters
export interface UserFilters {
  search?: string
  role?: UserRole
  groupId?: string
  page?: number
  limit?: number
}

// Role display configuration
export const ROLE_CONFIG: Record<UserRole, { label: string; description: string }> = {
  [UserRole.Admin]: { label: 'Admin', description: 'System administrator with full access' },
  [UserRole.Annotator]: { label: 'Annotator', description: 'Annotates and transcribes content' },
  [UserRole.Reviewer]: { label: 'Reviewer', description: 'Reviews and validates corrections' },
  [UserRole.FinalReviewer]: { label: 'Final Reviewer', description: 'Performs final quality check' },
}

