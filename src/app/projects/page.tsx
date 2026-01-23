import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/dashboard/Navbar'
import { ProjectCard } from '@/components/projects/ProjectCard'
import { Button } from '@/components/ui/Button'
import { Project } from '@/types/database'

export default async function ProjectsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const userId = user?.id ?? ''

  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })

  const projectsList: Project[] = projects || []

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Navbar userEmail={user?.email} />

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">Projects</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage your writing projects</p>
          </div>
          <Link href="/projects/new">
            <Button>New Project</Button>
          </Link>
        </div>

        {projectsList.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-100 dark:bg-slate-800 dark:border-slate-700">
            <div className="w-16 h-16 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No projects yet</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Get started by creating your first project</p>
            <Link href="/projects/new">
              <Button>Create Your First Project</Button>
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projectsList.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
