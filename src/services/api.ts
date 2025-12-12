import {
  type User,
  type Task,
  type TaskHistoryEntry,
  type DashboardStats,
  type ApiResponse,
  type TaskFilter,
  UserRole,
  TaskStatus,
  TaskAction,
  VALID_TRANSITIONS,
} from '@/types'
import {
  users,
  tasks,
  findUserById,
  findTaskById,
  generateId,
} from './mock-db'

// Simulate network delay
const delay = (ms: number = 300): Promise<void> => {
  const randomDelay = ms + Math.random() * 200
  return new Promise(resolve => setTimeout(resolve, randomDelay))
}

// ============ AUTH API ============

export const loginUser = async (email: string): Promise<ApiResponse<User>> => {
  await delay()
  const user = users.find(u => u.email === email)
  if (!user) {
    return { success: false, error: 'User not found' }
  }
  return { success: true, data: user }
}

export const getUsersByRole = async (role: UserRole): Promise<ApiResponse<User[]>> => {
  await delay()
  const filtered = users.filter(u => u.role === role)
  return { success: true, data: filtered }
}

export const getAllUsers = async (): Promise<ApiResponse<User[]>> => {
  await delay()
  return { success: true, data: [...users] }
}

// ============ TASK API ============

export const getTasks = async (filter?: TaskFilter): Promise<ApiResponse<Task[]>> => {
  await delay()
  let result = [...tasks]

  if (filter?.status && filter.status.length > 0) {
    result = result.filter(t => filter.status!.includes(t.status))
  }

  if (filter?.assignedTo) {
    result = result.filter(t => t.assignedTo === filter.assignedTo)
  }

  if (filter?.reviewerId) {
    result = result.filter(t => t.reviewerId === filter.reviewerId)
  }

  if (filter?.search) {
    const searchLower = filter.search.toLowerCase()
    result = result.filter(t => 
      t.noisyText.toLowerCase().includes(searchLower) ||
      t.correctedText.toLowerCase().includes(searchLower) ||
      t.id.toLowerCase().includes(searchLower)
    )
  }

  // Sort by updatedAt descending
  result.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())

  return { success: true, data: result }
}

export const getTaskById = async (taskId: string): Promise<ApiResponse<Task>> => {
  await delay()
  const task = findTaskById(taskId)
  if (!task) {
    return { success: false, error: 'Task not found' }
  }
  return { success: true, data: { ...task } }
}

export const getTasksForTranscriber = async (userId: string): Promise<ApiResponse<Task[]>> => {
  await delay()
  const result = tasks.filter(t => 
    t.assignedTo === userId && 
    (t.status === TaskStatus.InProgress || t.status === TaskStatus.Rejected)
  )
  return { success: true, data: result }
}

export const getTasksForReviewer = async (userId: string): Promise<ApiResponse<Task[]>> => {
  await delay()
  // Tasks awaiting review (can be claimed) or already claimed by this reviewer
  const result = tasks.filter(t => 
    t.status === TaskStatus.AwaitingReview ||
    (t.status === TaskStatus.InReview && t.reviewerId === userId)
  )
  return { success: true, data: result }
}

export const getTasksForFinalReviewer = async (userId: string): Promise<ApiResponse<Task[]>> => {
  await delay()
  // Tasks awaiting final review (can be claimed) or already claimed by this reviewer
  const result = tasks.filter(t => 
    t.status === TaskStatus.AwaitingFinalReview ||
    (t.status === TaskStatus.FinalReview && t.finalReviewerId === userId)
  )
  return { success: true, data: result }
}

// ============ TASK MUTATIONS ============

const addHistoryEntry = (
  task: Task,
  action: TaskAction,
  user: User,
  previousStatus: TaskStatus,
  newStatus: TaskStatus,
  comment?: string
): TaskHistoryEntry => {
  const entry: TaskHistoryEntry = {
    id: generateId(),
    action,
    userId: user.id,
    userName: user.name,
    timestamp: new Date(),
    previousStatus,
    newStatus,
    comment,
  }
  task.history.push(entry)
  return entry
}

export const assignTask = async (
  taskId: string,
  transcriberUserId: string,
  adminUserId: string
): Promise<ApiResponse<Task>> => {
  await delay()

  const taskIndex = tasks.findIndex(t => t.id === taskId)
  if (taskIndex === -1) {
    return { success: false, error: 'Task not found' }
  }

  const task = tasks[taskIndex]
  if (task.status !== TaskStatus.Pending) {
    return { success: false, error: 'Task is not in pending status' }
  }

  const transcriber = findUserById(transcriberUserId)
  if (!transcriber || transcriber.role !== UserRole.Transcriber) {
    return { success: false, error: 'Invalid transcriber' }
  }

  const admin = findUserById(adminUserId)
  if (!admin) {
    return { success: false, error: 'Admin not found' }
  }

  const previousStatus = task.status
  task.status = TaskStatus.InProgress
  task.assignedTo = transcriber.id
  task.assignedToName = transcriber.name
  task.updatedAt = new Date()

  addHistoryEntry(task, TaskAction.Assigned, admin, previousStatus, task.status)

  return { success: true, data: { ...task } }
}

export const saveTaskProgress = async (
  taskId: string,
  correctedText: string,
  userId: string
): Promise<ApiResponse<Task>> => {
  await delay()

  const taskIndex = tasks.findIndex(t => t.id === taskId)
  if (taskIndex === -1) {
    return { success: false, error: 'Task not found' }
  }

  const task = tasks[taskIndex]
  if (task.assignedTo !== userId && task.reviewerId !== userId && task.finalReviewerId !== userId) {
    return { success: false, error: 'You are not assigned to this task' }
  }

  const user = findUserById(userId)
  if (!user) {
    return { success: false, error: 'User not found' }
  }

  task.correctedText = correctedText
  task.updatedAt = new Date()

  addHistoryEntry(task, TaskAction.TextUpdated, user, task.status, task.status)

  return { success: true, data: { ...task } }
}

export const submitTask = async (
  taskId: string,
  correctedText: string,
  userId: string
): Promise<ApiResponse<Task>> => {
  await delay()

  const taskIndex = tasks.findIndex(t => t.id === taskId)
  if (taskIndex === -1) {
    return { success: false, error: 'Task not found' }
  }

  const task = tasks[taskIndex]
  if (task.assignedTo !== userId) {
    return { success: false, error: 'You are not assigned to this task' }
  }

  if (task.status !== TaskStatus.InProgress && task.status !== TaskStatus.Rejected) {
    return { success: false, error: 'Task cannot be submitted in current status' }
  }

  const user = findUserById(userId)
  if (!user) {
    return { success: false, error: 'User not found' }
  }

  const previousStatus = task.status
  task.correctedText = correctedText
  task.status = TaskStatus.AwaitingReview
  task.updatedAt = new Date()

  addHistoryEntry(task, TaskAction.Submitted, user, previousStatus, task.status)

  return { success: true, data: { ...task } }
}

export const claimForReview = async (
  taskId: string,
  reviewerId: string
): Promise<ApiResponse<Task>> => {
  await delay()

  const taskIndex = tasks.findIndex(t => t.id === taskId)
  if (taskIndex === -1) {
    return { success: false, error: 'Task not found' }
  }

  const task = tasks[taskIndex]
  if (task.status !== TaskStatus.AwaitingReview) {
    return { success: false, error: 'Task is not awaiting review' }
  }

  const reviewer = findUserById(reviewerId)
  if (!reviewer || reviewer.role !== UserRole.Reviewer) {
    return { success: false, error: 'Invalid reviewer' }
  }

  const previousStatus = task.status
  task.status = TaskStatus.InReview
  task.reviewerId = reviewer.id
  task.reviewerName = reviewer.name
  task.updatedAt = new Date()

  addHistoryEntry(task, TaskAction.ClaimedForReview, reviewer, previousStatus, task.status)

  return { success: true, data: { ...task } }
}

export const approveTask = async (
  taskId: string,
  reviewerId: string,
  comment?: string
): Promise<ApiResponse<Task>> => {
  await delay()

  const taskIndex = tasks.findIndex(t => t.id === taskId)
  if (taskIndex === -1) {
    return { success: false, error: 'Task not found' }
  }

  const task = tasks[taskIndex]
  if (task.status !== TaskStatus.InReview) {
    return { success: false, error: 'Task is not in review' }
  }

  if (task.reviewerId !== reviewerId) {
    return { success: false, error: 'You are not the reviewer for this task' }
  }

  const reviewer = findUserById(reviewerId)
  if (!reviewer) {
    return { success: false, error: 'Reviewer not found' }
  }

  const previousStatus = task.status
  task.status = TaskStatus.AwaitingFinalReview
  task.updatedAt = new Date()

  addHistoryEntry(task, TaskAction.Approved, reviewer, previousStatus, task.status, comment)

  return { success: true, data: { ...task } }
}

export const rejectTask = async (
  taskId: string,
  reviewerId: string,
  comment: string
): Promise<ApiResponse<Task>> => {
  await delay()

  const taskIndex = tasks.findIndex(t => t.id === taskId)
  if (taskIndex === -1) {
    return { success: false, error: 'Task not found' }
  }

  const task = tasks[taskIndex]
  if (task.status !== TaskStatus.InReview && task.status !== TaskStatus.FinalReview) {
    return { success: false, error: 'Task cannot be rejected in current status' }
  }

  const reviewer = findUserById(reviewerId)
  if (!reviewer) {
    return { success: false, error: 'Reviewer not found' }
  }

  // Verify the reviewer is assigned
  if (task.status === TaskStatus.InReview && task.reviewerId !== reviewerId) {
    return { success: false, error: 'You are not the reviewer for this task' }
  }
  if (task.status === TaskStatus.FinalReview && task.finalReviewerId !== reviewerId) {
    return { success: false, error: 'You are not the final reviewer for this task' }
  }

  const previousStatus = task.status
  const action = task.status === TaskStatus.FinalReview ? TaskAction.FinalRejected : TaskAction.Rejected
  task.status = TaskStatus.Rejected
  task.updatedAt = new Date()

  addHistoryEntry(task, action, reviewer, previousStatus, task.status, comment)

  return { success: true, data: { ...task } }
}

export const claimForFinalReview = async (
  taskId: string,
  finalReviewerId: string
): Promise<ApiResponse<Task>> => {
  await delay()

  const taskIndex = tasks.findIndex(t => t.id === taskId)
  if (taskIndex === -1) {
    return { success: false, error: 'Task not found' }
  }

  const task = tasks[taskIndex]
  if (task.status !== TaskStatus.AwaitingFinalReview) {
    return { success: false, error: 'Task is not awaiting final review' }
  }

  const finalReviewer = findUserById(finalReviewerId)
  if (!finalReviewer || finalReviewer.role !== UserRole.FinalReviewer) {
    return { success: false, error: 'Invalid final reviewer' }
  }

  const previousStatus = task.status
  task.status = TaskStatus.FinalReview
  task.finalReviewerId = finalReviewer.id
  task.finalReviewerName = finalReviewer.name
  task.updatedAt = new Date()

  addHistoryEntry(task, TaskAction.ClaimedForFinalReview, finalReviewer, previousStatus, task.status)

  return { success: true, data: { ...task } }
}

export const finalApproveTask = async (
  taskId: string,
  finalReviewerId: string,
  comment?: string
): Promise<ApiResponse<Task>> => {
  await delay()

  const taskIndex = tasks.findIndex(t => t.id === taskId)
  if (taskIndex === -1) {
    return { success: false, error: 'Task not found' }
  }

  const task = tasks[taskIndex]
  if (task.status !== TaskStatus.FinalReview) {
    return { success: false, error: 'Task is not in final review' }
  }

  if (task.finalReviewerId !== finalReviewerId) {
    return { success: false, error: 'You are not the final reviewer for this task' }
  }

  const finalReviewer = findUserById(finalReviewerId)
  if (!finalReviewer) {
    return { success: false, error: 'Final reviewer not found' }
  }

  const previousStatus = task.status
  task.status = TaskStatus.Completed
  task.updatedAt = new Date()

  addHistoryEntry(task, TaskAction.FinalApproved, finalReviewer, previousStatus, task.status, comment)

  return { success: true, data: { ...task } }
}

export const reassignRejectedTask = async (
  taskId: string,
  adminUserId: string
): Promise<ApiResponse<Task>> => {
  await delay()

  const taskIndex = tasks.findIndex(t => t.id === taskId)
  if (taskIndex === -1) {
    return { success: false, error: 'Task not found' }
  }

  const task = tasks[taskIndex]
  if (task.status !== TaskStatus.Rejected) {
    return { success: false, error: 'Task is not in rejected status' }
  }

  const admin = findUserById(adminUserId)
  if (!admin) {
    return { success: false, error: 'Admin not found' }
  }

  const previousStatus = task.status
  task.status = TaskStatus.InProgress
  task.updatedAt = new Date()

  addHistoryEntry(task, TaskAction.Reassigned, admin, previousStatus, task.status)

  return { success: true, data: { ...task } }
}

// ============ STATS API ============

export const getDashboardStats = async (): Promise<ApiResponse<DashboardStats>> => {
  await delay(200)

  const stats: DashboardStats = {
    pending: tasks.filter(t => t.status === TaskStatus.Pending).length,
    inProgress: tasks.filter(t => t.status === TaskStatus.InProgress).length,
    awaitingReview: tasks.filter(t => 
      t.status === TaskStatus.AwaitingReview || 
      t.status === TaskStatus.InReview ||
      t.status === TaskStatus.AwaitingFinalReview ||
      t.status === TaskStatus.FinalReview
    ).length,
    completed: tasks.filter(t => t.status === TaskStatus.Completed).length,
    rejected: tasks.filter(t => t.status === TaskStatus.Rejected).length,
    total: tasks.length,
  }

  return { success: true, data: stats }
}

export const getTranscriberStats = async (userId: string): Promise<ApiResponse<DashboardStats>> => {
  await delay(200)

  const userTasks = tasks.filter(t => t.assignedTo === userId)

  const stats: DashboardStats = {
    pending: 0,
    inProgress: userTasks.filter(t => t.status === TaskStatus.InProgress).length,
    awaitingReview: userTasks.filter(t => 
      t.status === TaskStatus.AwaitingReview || 
      t.status === TaskStatus.InReview ||
      t.status === TaskStatus.AwaitingFinalReview ||
      t.status === TaskStatus.FinalReview
    ).length,
    completed: userTasks.filter(t => t.status === TaskStatus.Completed).length,
    rejected: userTasks.filter(t => t.status === TaskStatus.Rejected).length,
    total: userTasks.length,
  }

  return { success: true, data: stats }
}

// ============ TASK CREATION (Admin) ============

export const createTask = async (
  imageUrl: string,
  noisyText: string,
  adminUserId: string
): Promise<ApiResponse<Task>> => {
  await delay()

  const admin = findUserById(adminUserId)
  if (!admin || admin.role !== UserRole.Admin) {
    return { success: false, error: 'Only admins can create tasks' }
  }

  const newTask: Task = {
    id: generateId(),
    imageUrl,
    noisyText,
    correctedText: '',
    status: TaskStatus.Pending,
    history: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const historyEntry: TaskHistoryEntry = {
    id: generateId(),
    action: TaskAction.Created,
    userId: admin.id,
    userName: admin.name,
    timestamp: new Date(),
    newStatus: TaskStatus.Pending,
  }
  newTask.history.push(historyEntry)

  tasks.push(newTask)

  return { success: true, data: { ...newTask } }
}

// Export validation helper
export const canTransitionTo = (currentStatus: TaskStatus, newStatus: TaskStatus): boolean => {
  return VALID_TRANSITIONS[currentStatus]?.includes(newStatus) ?? false
}

