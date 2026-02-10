'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ChapterEditor } from './ChapterEditor'
import { Chapter } from '@/types/database'

interface SingleDocumentEditorProps {
  projectId: string
  existingChapter: Chapter | null
}

export function SingleDocumentEditor({ projectId, existingChapter }: SingleDocumentEditorProps) {
  const router = useRouter()
  const [chapter, setChapter] = useState<Chapter | null>(existingChapter)
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    async function createDefaultChapter() {
      if (chapter || isCreating) return

      setIsCreating(true)
      const supabase = createClient()

      try {
        const { data, error } = await supabase
          .from('chapters')
          .insert({
            project_id: projectId,
            title: 'Content',
            content: '',
            word_count: 0,
            sort_order: 0,
          })
          .select()
          .single()

        if (error) throw error

        setChapter(data as Chapter)
        router.refresh()
      } catch (error) {
        console.error('Error creating default chapter:', error)
      } finally {
        setIsCreating(false)
      }
    }

    createDefaultChapter()
  }, [chapter, isCreating, projectId, router])

  if (!chapter) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500 dark:text-gray-400">Loading editor...</div>
      </div>
    )
  }

  return <ChapterEditor chapter={chapter} projectId={projectId} backUrl="/projects" />
}
