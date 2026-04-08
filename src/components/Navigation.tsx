import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Hexagon, User } from 'lucide-react'
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
      <Link to="/" className="nav-logo">
        <div className="nav-logomark">
          <Hexagon style={{ width: '14px', height: '14px', fill: 'white', stroke: 'white' }} />
        </div>
        <span>
          Meridi<span style={{ color: 'var(--terra)' }}>an</span>
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
          to="/category/fellowships"
          className={location.pathname.includes('fellowships') ? 'active' : ''}
        >
          Fellowships
        </Link>
        <Link
          to="/category/scholarships"
          className={location.pathname.includes('scholarships') ? 'active' : ''}
        >
          Scholarships
        </Link>
        <Link
          to="/category/conferences"
          className={location.pathname.includes('conferences') ? 'active' : ''}
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
        <>
          <button className="nav-ghost" onClick={() => navigate('/login')}>
            Log in
          </button>
          <button className="nav-solid" onClick={() => navigate('/signup')}>
            Get Started →
          </button>
        </>
      )}
    </nav>
  )
}
