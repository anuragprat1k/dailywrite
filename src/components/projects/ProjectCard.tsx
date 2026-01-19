import Link from 'next/link'
import { Project } from '@/types/database'
import { Card, CardContent } from '@/components/ui/Card'

interface ProjectCardProps {
  project: Project
}

export function ProjectCard({ project }: ProjectCardProps) {
  const typeColors: Record<string, string> = {
    blog: 'bg-blue-100 text-blue-700',
    novel: 'bg-purple-100 text-purple-700',
    essay: 'bg-green-100 text-green-700',
    other: 'bg-gray-100 text-gray-700',
  }

  const colorClass = typeColors[project.type] || typeColors.other

  return (
    <Link href={`/projects/${project.id}`}>
      <Card className="hover:border-gray-200 hover:shadow-md transition-all cursor-pointer h-full">
        <CardContent className="py-5">
          <div className="flex items-start justify-between mb-3">
            <h3 className="font-semibold text-gray-900 line-clamp-1">
              {project.title}
            </h3>
            <span className={`text-xs px-2 py-1 rounded-full ${colorClass}`}>
              {project.type}
            </span>
          </div>
          {project.description && (
            <p className="text-sm text-gray-500 line-clamp-2 mb-3">
              {project.description}
            </p>
          )}
          <p className="text-xs text-gray-400">
            Updated {new Date(project.updated_at).toLocaleDateString()}
          </p>
        </CardContent>
      </Card>
    </Link>
  )
}
