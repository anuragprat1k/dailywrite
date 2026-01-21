export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          type: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          type?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          type?: string
          created_at?: string
          updated_at?: string
        }
      }
      chapters: {
        Row: {
          id: string
          project_id: string
          title: string
          content: string
          word_count: number
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          title: string
          content?: string
          word_count?: number
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          title?: string
          content?: string
          word_count?: number
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
      }
      writing_sessions: {
        Row: {
          id: string
          user_id: string
          date: string
          words_written: number
          time_spent: number
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          words_written?: number
          time_spent?: number
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          words_written?: number
          time_spent?: number
        }
      }
    }
  }
}

export type Project = Database['public']['Tables']['projects']['Row']
export type Chapter = Database['public']['Tables']['chapters']['Row']
export type WritingSession = Database['public']['Tables']['writing_sessions']['Row']
