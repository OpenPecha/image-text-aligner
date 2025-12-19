import { http, HttpResponse, delay } from 'msw'
import { users } from '../db'
import { UserRole } from '@/types'
import type { User, CreateUserDTO, UpdateUserDTO, PaginatedResponse } from '@/types'

export const userHandlers = [
  // POST /api/user - Create or update user (legacy endpoint)
  http.post('/api/user', async ({ request }) => {
    await delay(300)
    const body = (await request.json()) as CreateUserDTO

    const existingUser = users.find((u) => u.email === body.email)

    if (existingUser) {
      // Update existing user
      if (body.role !== undefined) {
        existingUser.role = body.role
      }
      if (body.groupId !== undefined) {
        existingUser.groupId = body.groupId
      }
      if (body.name) {
        existingUser.name = body.name
      }
      if (body.picture) {
        existingUser.picture = body.picture
      }

      return HttpResponse.json(existingUser, { status: 200 })
    }

    // Create new user with Annotator as default role
    const newUser: User = {
      id: crypto.randomUUID(),
      name: body.name,
      email: body.email,
      role: body.role ?? UserRole.Admin,
      groupId: body.groupId ?? '',
      picture: body.picture,
      createdAt: new Date(),
    }

    users.push(newUser)

    return HttpResponse.json(newUser, { status: 201 })
  }),

  // POST /api/users - Create new user
  http.post('/api/users', async ({ request }) => {
    await delay(300)
    const body = (await request.json()) as CreateUserDTO

    // Check if email already exists
    const existingUser = users.find((u) => u.email === body.email)
    if (existingUser) {
      return HttpResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      )
    }

    const newUser: User = {
      id: crypto.randomUUID(),
      name: body.name,
      email: body.email,
      role: body.role ?? UserRole.Admin,
      groupId: body.groupId ?? '',
      picture: body.picture,
      createdAt: new Date(),
    }

    users.push(newUser)

    return HttpResponse.json(newUser, { status: 201 })
  }),

  // GET /api/user/:email - Get user by email
  http.get('/api/user/:email', async ({ params }) => {
    await delay(200)

    const { email } = params
    const user = users.find((u) => u.email === email)

    if (!user) {
      return HttpResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return HttpResponse.json(user)
  }),

  // GET /api/users - Get all users with pagination and filters
  http.get('/api/users', async ({ request }) => {
    await delay(200)

    const url = new URL(request.url)
    const search = url.searchParams.get('search')?.toLowerCase() || ''
    const role = url.searchParams.get('role') as UserRole | null
    const groupId = url.searchParams.get('groupId')
    const page = parseInt(url.searchParams.get('page') || '1', 10)
    const limit = parseInt(url.searchParams.get('limit') || '15', 10)

    // Filter users
    let filteredUsers = [...users]

    if (search) {
      filteredUsers = filteredUsers.filter((user) =>
        user.name.toLowerCase().includes(search)
      )
    }

    if (role) {
      filteredUsers = filteredUsers.filter((user) => user.role === role)
    }

    if (groupId) {
      filteredUsers = filteredUsers.filter((user) => user.groupId === groupId)
    }

    // Calculate pagination
    const total = filteredUsers.length
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex)
    const hasMore = endIndex < total

    const response: PaginatedResponse<User> = {
      data: paginatedUsers,
      total,
      page,
      limit,
      hasMore,
    }

    return HttpResponse.json(response)
  }),

  // PATCH /api/users/:id - Update user details
  http.patch('/api/users/:id', async ({ params, request }) => {
    await delay(200)

    const { id } = params
    const body = (await request.json()) as UpdateUserDTO

    const userIndex = users.findIndex((u) => u.id === id)

    if (userIndex === -1) {
      return HttpResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const user = users[userIndex]

    // Update fields if provided
    if (body.name !== undefined) {
      user.name = body.name
    }
    if (body.role !== undefined) {
      user.role = body.role
    }
    if (body.groupId !== undefined) {
      user.groupId = body.groupId
    }

    return HttpResponse.json(user)
  }),

  // DELETE /api/users/:id - Delete user
  http.delete('/api/users/:id', async ({ params }) => {
    await delay(200)

    const { id } = params
    const userIndex = users.findIndex((u) => u.id === id)

    if (userIndex === -1) {
      return HttpResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    users.splice(userIndex, 1)

    return HttpResponse.json({ success: true }, { status: 200 })
  }),

  // PATCH /api/user/:id/role - Update user role (legacy endpoint)
  http.patch('/api/user/:id/role', async ({ params, request }) => {
    await delay(200)

    const { id } = params
    const body = (await request.json()) as { role: UserRole }

    const user = users.find((u) => u.id === id)

    if (!user) {
      return HttpResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    user.role = body.role

    return HttpResponse.json(user)
  }),
]
