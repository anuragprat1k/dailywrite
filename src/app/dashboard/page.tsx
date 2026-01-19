import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/dashboard/Navbar'
import { StatsCards } from '@/components/dashboard/StatsCards'
import { WritingChart } from '@/components/dashboard/WritingChart'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import {
  calculateStreak,
  calculateLongestStreak,
  getTotalWords,
  getWordsToday,
  getLast30DaysData,
} from '@/lib/utils/stats'
import { Project, WritingSession } from '@/types/database'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const userId = user?.id ?? ''

  // Fetch writing sessions
  const { data: sessions } = await supabase
    .from('writing_sessions')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })

  // Fetch recent projects
  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .limit(5)

  const writingSessions: WritingSession[] = sessions || []
  const recentProjects: Project[] = projects || []

  const currentStreak = calculateStreak(writingSessions)
  const longestStreak = calculateLongestStreak(writingSessions)
  const totalWords = getTotalWords(writingSessions)
  const wordsToday = getWordsToday(writingSessions)
  const chartData = getLast30DaysData(writingSessions)

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar userEmail={user?.email} />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome back{user?.email ? `, ${user.email.split('@')[0]}` : ''}!
          </h1>
          <p className="text-gray-600">Here&apos;s your writing overview.</p>
        </div>

        <div className="space-y-8">
          <StatsCards
            currentStreak={currentStreak}
            longestStreak={longestStreak}
            totalWords={totalWords}
            wordsToday={wordsToday}
          />

          <WritingChart data={chartData} />

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Projects</CardTitle>
              <Link href="/projects/new">
                <Button size="sm">New Project</Button>
              </Link>
            </CardHeader>
            <CardContent>
              {recentProjects.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No projects yet. Start writing!</p>
                  <Link href="/projects/new">
                    <Button>Create Your First Project</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentProjects.map((project) => (
                    <Link
                      key={project.id}
                      href={`/projects/${project.id}`}
                      className="block p-4 rounded-lg border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900">{project.title}</h3>
                          {project.description && (
                            <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                              {project.description}
                            </p>
                          )}
                        </div>
                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                          {project.type}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
