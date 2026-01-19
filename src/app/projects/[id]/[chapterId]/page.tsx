import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ChapterEditor } from '@/components/chapters/ChapterEditor'
import { Chapter } from '@/types/database'

interface ChapterPageProps {
  params: Promise<{ id: string; chapterId: string }>
}

export default async function ChapterPage({ params }: ChapterPageProps) {
  const { id, chapterId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const userId = user?.id ?? ''

  // Verify project belongs to user
  const { data: project } = await supabase
    .from('projects')
    .select('id')
    .eq('id', id)
    .eq('user_id', userId)
    .single()

  if (!project) {
    notFound()
  }

  // Get chapter
  const { data: chapter, error } = await supabase
    .from('chapters')
    .select('*')
    .eq('id', chapterId)
    .eq('project_id', id)
    .single()

  if (error || !chapter) {
    notFound()
  }

  const typedChapter = chapter as Chapter

  return <ChapterEditor chapter={typedChapter} projectId={id} />
}
