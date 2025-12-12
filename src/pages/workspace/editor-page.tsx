import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { WorkspaceView } from '@/features/workspace'
import { getTaskById } from '@/services/api'

export function EditorPage() {
  const { taskId } = useParams<{ taskId: string }>()

  const { data: task, isLoading } = useQuery({
    queryKey: ['task', taskId],
    queryFn: async () => {
      if (!taskId) return null
      const response = await getTaskById(taskId)
      return response.data || null
    },
    enabled: !!taskId,
  })

  return <WorkspaceView task={task ?? null} isLoading={isLoading} />
}

