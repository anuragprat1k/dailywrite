import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/dashboard/Navbar'
import { ProjectForm } from '@/components/projects/ProjectForm'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'

export default async function NewProjectPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Navbar userEmail={user?.email} />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Create New Project</CardTitle>
            </CardHeader>
            <CardContent>
              <ProjectForm mode="create" />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
