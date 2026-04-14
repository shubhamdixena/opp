import { Link, useLocation, useNavigate } from 'react-router-dom'
import { User } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function Navigation() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, signOut } = useAuth()

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <nav className="nav">
      <Link to="/" className="nav-logo" style={{ textDecoration: 'none' }}>
        <span style={{ fontSize: '18px', fontWeight: 600, color: '#111', letterSpacing: '-0.3px' }}>
          Opportunity For You
        </span>
      </Link>

      <div className="nav-links">
        <Link
          to="/"
          className={isActive('/') && !location.pathname.includes('category') ? 'active' : ''}
        >
          Browse
        </Link>
        <Link
          to="/category/fellowship"
          className={location.pathname.includes('fellowship') ? 'active' : ''}
        >
          Fellowships
        </Link>
        <Link
          to="/category/scholarship"
          className={location.pathname.includes('scholarship') ? 'active' : ''}
        >
          Scholarships
        </Link>
        <Link
          to="/category/conference"
          className={location.pathname.includes('conference') ? 'active' : ''}
        >
          Conferences
        </Link>
      </div>

      {user ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="nav-solid">
              <User className="h-4 w-4 mr-1" />
              {user.email?.split('@')[0]}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/profile')}>
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleSignOut}>
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <button className="nav-ghost" onClick={() => navigate('/login')}>
          Log in
        </button>
      )}
    </nav>
  )
}
