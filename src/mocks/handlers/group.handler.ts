import { http, HttpResponse, delay } from 'msw'
import { groups, users } from '../db'
import { UserRole } from '@/types'
import type { Group, GroupUpdateRequest } from '@/types'

export const groupHandlers = [
  // POST /api/group - Create group
  http.post('/api/group', async ({ request }) => {
    await delay(300)

    const body = (await request.json()) as Omit<Group, 'id'>

    const newGroup: Group = {
      id: crypto.randomUUID(),
      name: body.name,
      description: body.description,
    }

    groups.push(newGroup)

    return HttpResponse.json(newGroup, { status: 201 })
  }),

  // GET /api/groups - List all groups
  http.get('/api/groups', async () => {
    await delay(200)
    return HttpResponse.json(groups)
  }),

  // GET /api/group/:groupId - Get group with users
  http.get('/api/group/:groupId', async ({ params, request }) => {
    await delay(200)

    const { groupId } = params
    const group = groups.find((g) => g.id === groupId)

    if (!group) {
      return HttpResponse.json(
        { error: 'Group not found' },
        { status: 404 }
      )
    }

    const url = new URL(request.url)
    const roleFilter = url.searchParams.get('role') as UserRole | null

    let groupUsers = users.filter((u) => u.groupId === groupId)

    if (roleFilter) {
      groupUsers = groupUsers.filter((u) => u.role === roleFilter)
    }

    return HttpResponse.json({
      ...group,
      users: groupUsers,
    })
  }),

  // PUT /api/group/:groupId - Update group
  http.put('/api/group/:groupId', async ({ params, request }) => {
    await delay(300)

    const { groupId } = params
    const groupIndex = groups.findIndex((g) => g.id === groupId)

    if (groupIndex === -1) {
      return HttpResponse.json(
        { error: 'Group not found' },
        { status: 404 }
      )
    }

    const body = (await request.json()) as GroupUpdateRequest

    // Update group fields
    if (body.name !== undefined) {
      groups[groupIndex].name = body.name
    }
    if (body.description !== undefined) {
      groups[groupIndex].description = body.description
    }

    return HttpResponse.json(groups[groupIndex])
  }),

  // DELETE /api/group/:groupId - Delete group
  http.delete('/api/group/:groupId', async ({ params }) => {
    await delay(300)

    const { groupId } = params
    const groupIndex = groups.findIndex((g) => g.id === groupId)

    if (groupIndex === -1) {
      return HttpResponse.json(
        { error: 'Group not found' },
        { status: 404 }
      )
    }

    // Check if group has users
    const groupUsers = users.filter((u) => u.groupId === groupId)
    if (groupUsers.length > 0) {
      return HttpResponse.json(
        { 
          error: 'Cannot delete group', 
          message: `This group has ${groupUsers.length} user(s) assigned. Please reassign or remove users before deleting.` 
        },
        { status: 400 }
      )
    }

    // Remove group
    groups.splice(groupIndex, 1)

    return HttpResponse.json({ success: true, message: 'Group deleted successfully' })
  }),
]
