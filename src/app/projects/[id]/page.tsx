import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/dashboard/Navbar'
import { ChapterList } from '@/components/chapters/ChapterList'
import { SingleDocumentEditor } from '@/components/chapters/SingleDocumentEditor'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { DeleteProjectButton } from '@/components/projects/DeleteProjectButton'
import { Project, Chapter } from '@/types/database'

const SINGLE_DOCUMENT_TYPES = ['blog', 'essay']

interface ProjectPageProps {
  params: Promise<{ id: string }>
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const userId = user?.id ?? ''

  const { data: project, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single()

  if (error || !project) {
    notFound()
  }

  const typedProject = project as Project

  const { data: chapters } = await supabase
    .from('chapters')
    .select('*')
    .eq('project_id', id)
    .order('sort_order', { ascending: true })

  const chaptersList: Chapter[] = chapters || []
  const totalWords = chaptersList.reduce((sum, c) => sum + c.word_count, 0)
  const isSingleDocument = SINGLE_DOCUMENT_TYPES.includes(typedProject.type)

  // For single document types (blog/essay), render just the editor
  if (isSingleDocument) {
    return (
      <SingleDocumentEditor
        projectId={id}
        existingChapter={chaptersList[0] || null}
      />
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar userEmail={user?.email} />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link
            href="/projects"
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Projects
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Chapters</CardTitle>
              </CardHeader>
              <CardContent>
                <ChapterList projectId={id} chapters={chaptersList} />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{typedProject.title}</CardTitle>
              </CardHeader>
              <CardContent>
                {typedProject.description && (
                  <p className="text-gray-600 mb-4">{typedProject.description}</p>
                )}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Type</span>
                    <span className="capitalize">{typedProject.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Chapters</span>
                    <span>{chaptersList.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Total Words</span>
                    <span>{totalWords.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Created</span>
                    <span>{new Date(typedProject.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-red-600">Danger Zone</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500 mb-4">
                  Deleting this project will remove all chapters and content permanently.
                </p>
                <DeleteProjectButton projectId={id} />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
