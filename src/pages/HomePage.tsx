import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import type { Opportunity } from '@/types'
import { Search, ArrowRight } from 'lucide-react'
import { OpportunityCard } from '@/components/OpportunityCard'
import { LoadingState } from '@/components/LoadingState'
import { useCategories } from '@/hooks/useCategories'
import { useAuth } from '@/contexts/AuthContext'

export function HomePage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [featuredOpportunities, setFeaturedOpportunities] = useState<Opportunity[]>([])
  const { categories } = useCategories()
  const [stats, setStats] = useState({
    totalOpportunities: 0,
    fullyFundedPercent: 0,
    countriesCount: 0,
    usersCount: 18420
  })
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilters, setSelectedFilters] = useState<string[]>([])
  const [fundingFilter, setFundingFilter] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      const [opportunitiesResult, fullyFundedResult, categoriesCountResult, usersCountResult] = await Promise.all([
        supabase
          .from('opportunities')
          .select(`
            *,
            organization:organizations(*),
            opportunity_categories(
              category:categories(*)
            )
          `)
          .eq('is_featured', true)
          .order('deadline', { ascending: true })
          .limit(3),
        supabase
          .from('opportunities')
          .select('id, funding_type, location', { count: 'exact' }),
        supabase
          .from('opportunities')
          .select('id, opportunity_categories!inner(category_id)', { count: 'exact' }),
        supabase.rpc('get_user_count')
      ])

      if (opportunitiesResult.data) {
        setFeaturedOpportunities(opportunitiesResult.data)
      }

      if (fullyFundedResult.data) {
        const total = fullyFundedResult.data.length
        const fullyFunded = fullyFundedResult.data.filter(o => o.funding_type === 'fully_funded').length
        const fullyFundedPercent = total > 0 ? Math.round((fullyFunded / total) * 100) : 0
        
        const countries = new Set<string>()
        fullyFundedResult.data.forEach(o => {
          if (o.location && o.location !== 'Online' && o.location !== 'Global') {
            const parts = o.location.split(',')
            countries.add(parts[parts.length - 1].trim())
          }
        })
        const countriesCount = Math.max(countries.size, 1)

        setStats({
          totalOpportunities: total,
          fullyFundedPercent,
          countriesCount: countriesCount,
          usersCount: (usersCountResult.data as number) || 1
        })
      }

      if (categoriesCountResult.data && categories.length > 0) {
        const counts: Record<string, number> = {}
        categories.forEach(cat => {
          counts[cat.id] = categoriesCountResult.data.filter((opp: any) =>
            opp.opportunity_categories.some((oc: any) => oc.category_id === cat.id)
          ).length
        })
        setCategoryCounts(counts)
      }

      setIsLoading(false)
    }

    fetchData()
  }, [categories])

  return (
    <div>
      <section className="hero">
        <div className="wrap">
          <div className="hero-badge">
            <div className="badge-dot" />
            <span>{stats.totalOpportunities}+ active opportunities right now</span>
          </div>

          <h1 style={{ fontSize: 'clamp(40px, 7.5vw, 56px)', letterSpacing: '-1.5px', color: '#000' }}>
            Discover Your Next
            <br />
            <span className="shimmer-text">
              Big Opportunity
            </span>
          </h1>

          <p className="hero-sub">
            Opportunity For You curates verified fellowships, scholarships, conferences, and awards for ambitious young professionals — always linking to the official source.
          </p>

          <div className="hero-btns">
            <Link to="/category/fellowship">
              <button className="btn btn-primary">Explore Opportunities →</button>
            </Link>
            <button className="btn btn-outline" onClick={() => navigate(user ? '/profile' : '/signup')}>
              {user ? 'My Profile' : 'Get Started'}
            </button>
          </div>

          <div className="hero-trust">
            <div className="trust-item">
              <div className="trust-n">{stats.totalOpportunities.toLocaleString()}+</div>
              <div className="trust-l">Live listings</div>
            </div>
            <div className="trust-sep" />
            <div className="trust-item">
              <div className="trust-n">{stats.countriesCount}</div>
              <div className="trust-l">Countries</div>
            </div>
            <div className="trust-sep" />
            <div className="trust-item">
              <div className="trust-n">{stats.fullyFundedPercent}%</div>
              <div className="trust-l">Fully funded</div>
            </div>
            <div className="trust-sep" />
            <div className="trust-item">
              <div className="trust-n">{(stats.usersCount / 1000).toFixed(0)}k</div>
              <div className="trust-l">Users</div>
            </div>
          </div>
        </div>
      </section>

      <section className="search-wrap">
        <div className="search-box">
          <div className="search-icon">
            <Search />
          </div>
          <input
            type="text"
            placeholder="Search fellowships, scholarships, conferences..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className="search-go" onClick={() => {
            if (searchQuery.trim()) {
              navigate(`/category/fellowship?search=${encodeURIComponent(searchQuery)}`)
            }
          }}>Search</button>
        </div>
        <div className="chips-row">
          <span className="chips-label">Filter:</span>
          {categories.slice(0, 5).map((category) => (
            <button
              key={category.id}
              className={`chip ${selectedFilters.includes(category.slug) ? 'on' : ''}`}
              onClick={() => {
                if (selectedFilters.includes(category.slug)) {
                  setSelectedFilters(selectedFilters.filter(f => f !== category.slug))
                } else {
                  setSelectedFilters([...selectedFilters, category.slug])
                }
              }}
            >
              {category.name}
            </button>
          ))}
          <button
            className={`chip ${fundingFilter === 'fully_funded' ? 'g-on' : ''}`}
            onClick={() => {
              setFundingFilter(fundingFilter === 'fully_funded' ? null : 'fully_funded')
            }}
          >
            💚 Fully Funded
          </button>
        </div>
      </section>

      <section className="sec">
        <div className="wrap-lg">
          <div className="sec-top">
            <div>
              <div className="eyebrow">Featured this week</div>
              <h2 className="sec-h2">Handpicked Opportunities</h2>
            </div>
            <Link to="/category/fellowship" className="see-all">
              Browse all <ArrowRight />
            </Link>
          </div>

          {isLoading ? (
            <LoadingState count={6} />
          ) : (
            <div className="cards-grid">
              {featuredOpportunities.map((opportunity) => (
                <OpportunityCard key={opportunity.id} opportunity={opportunity} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="sec alt">
        <div className="wrap-lg">
          <div className="sec-top">
            <div>
              <div className="eyebrow">Explore by type</div>
              <h2 className="sec-h2">Browse by Category</h2>
            </div>
          </div>

          <div className="cat-grid">
            {categories.map((category) => (
              <Link key={category.id} to={`/category/${category.slug}`} style={{ display: 'block', height: '100%' }}>
                <div className="cat-card">
                  <div className="cat-name">{category.name}</div>
                  <div className="cat-count">
                    {categoryCounts[category.id] || 0} active
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {!user && (
        <section className="sec">
          <div className="wrap-lg">
            <div className="cta-wrap">
              <span className="cta-eye">Join {stats.usersCount.toLocaleString()}+ young professionals</span>
              <h2 className="cta-h2">
                Never miss an opportunity
                <br />
                that was <em>made for you</em>
              </h2>
              <p className="cta-sub">Free to use · Verified listings · No spam</p>
              <div className="cta-btns">
                <button className="btn-cta-main" onClick={() => navigate('/signup')}>
                  Create Free Profile →
                </button>
                <button className="btn-cta-ghost" onClick={() => navigate('/category/fellowship')}>
                  Browse Without Account
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      <footer>
        <div className="footer-grid">
          <div>
            <div className="f-logo">
              <div className="nav-logomark" style={{ width: '28px', height: '28px' }}>
                <svg viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="2">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                </svg>
              </div>
              <span>Opportunity For You</span>
            </div>
            <p className="f-desc">
              Curated global opportunities for ambitious young professionals — connecting you to fellowships, scholarships, and transformative experiences.
            </p>
          </div>
          <div>
            <div className="f-col-title">Explore</div>
            <ul className="f-links">
              <li><a>Fellowships</a></li>
              <li><a>Scholarships</a></li>
              <li><a>Conferences</a></li>
              <li><a>Internships</a></li>
            </ul>
          </div>
          <div>
            <div className="f-col-title">Company</div>
            <ul className="f-links">
              <li><a>About</a></li>
              <li><a>Blog</a></li>
              <li><a>Contact</a></li>
              <li><a>Privacy</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <div className="footer-copy">© 2026 Opportunity For You. All rights reserved.</div>
        </div>
      </footer>
    </div>
  )
}
