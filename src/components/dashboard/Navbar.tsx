'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'

interface NavbarProps {
  userEmail?: string
}

export function Navbar({ userEmail }: NavbarProps) {
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <nav className="bg-white border-b border-gray-100">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="text-xl font-bold text-gray-900">
              WriteFlow
            </Link>
            <div className="hidden md:flex items-center gap-4">
              <Link
                href="/dashboard"
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/projects"
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Projects
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {userEmail && (
              <span className="text-sm text-gray-500 hidden md:block">
                {userEmail}
              </span>
            )}
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
