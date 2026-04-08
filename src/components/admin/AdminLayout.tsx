import { useState, useRef, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Hexagon, LayoutDashboard, List, CirclePlus as PlusCircle, Upload, Settings, Users, ChevronLeft, Search, Bell, LogOut } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [showAvatarMenu, setShowAvatarMenu] = useState(false)
  const [totalListings, setTotalListings] = useState<number | null>(null)
  const avatarMenuRef = useRef<HTMLDivElement>(null)
  const location = useLocation()
  const navigate = useNavigate()

  const isActive = (path: string) => location.pathname === path

  const handleLogout = () => {
    localStorage.removeItem('admin-logged-in')
    navigate('/admin/login')
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (avatarMenuRef.current && !avatarMenuRef.current.contains(event.target as Node)) {
        setShowAvatarMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    async function fetchTotalListings() {
      const { count } = await supabase
        .from('opportunities')
        .select('id', { count: 'exact', head: true })
      setTotalListings(count || 0)
    }
    fetchTotalListings()
  }, [location.pathname])

  return (
    <div className="shell">
      <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`} id="sidebar">
        <div className="sidebar-head">
          <div className="sidebar-logo-mark">
            <Hexagon style={{ width: '14px', height: '14px', fill: 'white' }} />
          </div>
          <div>
            <div className="sidebar-logo-text">
              Meridi<span>an</span>
            </div>
            <div className="sidebar-logo-sub">Admin Panel</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">Overview</div>

          <Link to="/admin/dashboard" style={{ textDecoration: 'none' }}>
            <div className={`nav-item ${isActive('/admin/dashboard') ? 'active' : ''}`}>
              <div className="nav-icon">
                <LayoutDashboard />
              </div>
              <span className="nav-label">Dashboard</span>
            </div>
          </Link>

          <div className="nav-section-label">Listings</div>

          <Link to="/admin/listings" style={{ textDecoration: 'none' }}>
            <div className={`nav-item ${isActive('/admin/listings') ? 'active' : ''}`}>
              <div className="nav-icon">
                <List />
              </div>
              <span className="nav-label">All Listings</span>
              {totalListings !== null && <span className="nav-badge">{totalListings.toLocaleString()}</span>}
            </div>
          </Link>

          <Link to="/admin/add" style={{ textDecoration: 'none' }}>
            <div className={`nav-item ${isActive('/admin/add') ? 'active' : ''}`}>
              <div className="nav-icon">
                <PlusCircle />
              </div>
              <span className="nav-label">Add Opportunity</span>
            </div>
          </Link>

          <Link to="/admin/bulk-upload" style={{ textDecoration: 'none' }}>
            <div className={`nav-item ${isActive('/admin/bulk-upload') ? 'active' : ''}`}>
              <div className="nav-icon">
                <Upload />
              </div>
              <span className="nav-label">Bulk Upload</span>
            </div>
          </Link>

          <div className="nav-section-label">System</div>

          <div className="nav-item">
            <div className="nav-icon">
              <Users />
            </div>
            <span className="nav-label">User Accounts</span>
          </div>

          <div className="nav-item">
            <div className="nav-icon">
              <Settings />
            </div>
            <span className="nav-label">Settings</span>
          </div>
        </nav>

        <div className="sidebar-toggle" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
          <ChevronLeft />
        </div>
      </aside>

      <div className="main">
        <div className="topbar">
          <div>
            <div className="topbar-title" id="topbar-title">
              {location.pathname === '/admin/dashboard' && 'Dashboard'}
              {location.pathname === '/admin/listings' && 'All Listings'}
              {location.pathname === '/admin/add' && 'Add Opportunity'}
              {location.pathname === '/admin/bulk-upload' && 'Bulk Upload'}
            </div>
          </div>
          <div className="topbar-right">
            <div className="topbar-search">
              <Search />
              <input type="text" placeholder="Search listings..." />
            </div>
            <button className="topbar-btn tb-ghost tb-icon" title="Notifications">
              <Bell style={{ width: '16px', height: '16px' }} />
            </button>
            <Link to="/admin/add">
              <button className="topbar-btn tb-primary">
                <PlusCircle style={{ width: '13px', height: '13px' }} />
                Add Listing
              </button>
            </Link>
            <div style={{ position: 'relative' }} ref={avatarMenuRef}>
              <div
                className="topbar-avatar"
                onClick={() => setShowAvatarMenu(!showAvatarMenu)}
                style={{ cursor: 'pointer' }}
                title="Account"
              >
                SA
              </div>
              {showAvatarMenu && (
                <div style={{
                  position: 'absolute',
                  right: 0,
                  top: 'calc(100% + 8px)',
                  background: 'var(--warm-white)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--r)',
                  boxShadow: 'var(--sh2)',
                  minWidth: '160px',
                  zIndex: 1000
                }}>
                  <div style={{ padding: '8px 0' }}>
                    <button
                      onClick={handleLogout}
                      style={{
                        width: '100%',
                        padding: '8px 16px',
                        background: 'none',
                        border: 'none',
                        textAlign: 'left',
                        fontSize: '13px',
                        color: 'var(--text)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'background 0.15s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--cream2)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                    >
                      <LogOut style={{ width: '14px', height: '14px' }} />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="content" id="main-content">
          {children}
        </div>
      </div>
    </div>
  )
}
