import { Search, Filter } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { UserRole, ROLE_CONFIG, type Group } from '@/types'

interface UserFiltersProps {
  search: string
  onSearchChange: (value: string) => void
  roleFilter: string
  onRoleFilterChange: (value: string) => void
  groupFilter: string
  onGroupFilterChange: (value: string) => void
  groups: Group[]
}

const ALL_ROLES = 'all'
const ALL_GROUPS = 'all'

export function UserFilters({
  search,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
  groupFilter,
  onGroupFilterChange,
  groups,
}: UserFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search member..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="flex gap-2">
        <Select value={roleFilter} onValueChange={onRoleFilterChange}>
          <SelectTrigger className="w-[140px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_ROLES}>All Roles</SelectItem>
            {Object.values(UserRole).map((role) => (
              <SelectItem key={role} value={role}>
                {ROLE_CONFIG[role].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={groupFilter} onValueChange={onGroupFilterChange}>
          <SelectTrigger className="w-[140px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Group" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_GROUPS}>All Groups</SelectItem>
            {groups.map((group) => (
              <SelectItem key={group.id} value={group.id}>
                {group.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

