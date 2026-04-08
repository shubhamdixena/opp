import { useState, useMemo } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { useCategories } from '@/hooks/useCategories'
import type { Opportunity } from '@/types'
import { Search, Grid3x3, List } from 'lucide-react'
import { OpportunityCard } from '@/components/OpportunityCard'
import { LoadingState } from '@/components/LoadingState'
import { EmptyState } from '@/components/EmptyState'
import { ErrorState } from '@/components/ErrorState'
import { supabase } from '@/lib/supabase'
import { useEffect } from 'react'

export function CategoryPage() {
  const { slug } = useParams<{ slug: string }>()
  const [searchParams] = useSearchParams()
  const { getCategoryBySlug, isLoading: categoriesLoading, error: categoriesError } = useCategories()
  const category = slug ? getCategoryBySlug(slug) : null

  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [isLoadingOpps, setIsLoadingOpps] = useState(true)
  const [oppsError, setOppsError] = useState<Error | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '')
  const [selectedRegions, setSelectedRegions] = useState<string[]>([])
  const [selectedFunding, setSelectedFunding] = useState<string[]>([])
  const [deadlineFilter, setDeadlineFilter] = useState<'week' | '30days' | '3months' | 'any'>('any')

  useEffect(() => {
    async function fetchOpportunities() {
      if (!slug || !category) return

      try {
        setIsLoadingOpps(true)
        setOppsError(null)

        const today = new Date().toISOString().split('T')[0]

        const { data, error } = await supabase
          .from('opportunities')
          .select(`
            *,
            organization:organizations(*),
            opportunity_categories!inner(
              category_id
            )
          `)
          .eq('opportunity_categories.category_id', category.id)
          .gte('deadline', today)
          .order('deadline', { ascending: true })

        if (error) throw error

        setOpportunities(data || [])
      } catch (err) {
        setOppsError(err instanceof Error ? err : new Error('Failed to fetch opportunities'))
      } finally {
        setIsLoadingOpps(false)
      }
    }

    fetchOpportunities()
  }, [slug, category])

  const filteredOpportunities = useMemo(() => {
    return opportunities.filter((opp) => {
      const matchesSearch =
        opp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        opp.description.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesRegion = selectedRegions.length === 0 || selectedRegions.includes(opp.region)
      const matchesFunding = selectedFunding.length === 0 || selectedFunding.includes(opp.funding_type)

      let matchesDeadline = true
      if (deadlineFilter !== 'any') {
        const deadline = new Date(opp.deadline)
        const today = new Date()
        const daysUntil = Math.floor((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

        if (deadlineFilter === 'week') matchesDeadline = daysUntil <= 7
        else if (deadlineFilter === '30days') matchesDeadline = daysUntil <= 30
        else if (deadlineFilter === '3months') matchesDeadline = daysUntil <= 90
      }

      return matchesSearch && matchesRegion && matchesFunding && matchesDeadline
    })
  }, [opportunities, searchQuery, selectedRegions, selectedFunding, deadlineFilter])

  const regionCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    opportunities.forEach(opp => {
      counts[opp.region] = (counts[opp.region] || 0) + 1
    })
    return counts
  }, [opportunities])

  const fundingCounts = useMemo(() => {
    const counts: Record<string, number> = {
      fully_funded: 0,
      partially_funded: 0,
      self_funded: 0
    }
    opportunities.forEach(opp => {
      counts[opp.funding_type] = (counts[opp.funding_type] || 0) + 1
    })
    return counts
  }, [opportunities])

  const toggleRegion = (region: string) => {
    setSelectedRegions(prev =>
      prev.includes(region) ? prev.filter(r => r !== region) : [...prev, region]
    )
  }

  const toggleFunding = (funding: string) => {
    setSelectedFunding(prev =>
      prev.includes(funding) ? prev.filter(f => f !== funding) : [...prev, funding]
    )
  }

  if (categoriesLoading) {
    return <LoadingState type="detail" />
  }

  if (categoriesError) {
    return <ErrorState message={categoriesError.message} />
  }

  if (!category) {
    return (
      <EmptyState
        title="Category not found"
        description="The category you're looking for doesn't exist."
        icon="empty"
      />
    )
  }

  return (
    <div>
      <section className="cat-header">
        <div className="wrap-lg">
          <div className="cat-hero-row">
            <div>
              <div className="cat-icon-big">{category.emoji || '📂'}</div>
              <h1 className="cat-title-text">{category.name}</h1>
              <p className="cat-sub-text">{category.description || `Explore ${category.name.toLowerCase()} opportunities`}</p>
            </div>
            <div className="cat-count-badge">
              <div className="live-dot" />
              <span>{filteredOpportunities.length} active listings</span>
            </div>
          </div>
        </div>
      </section>

      <section className="list-search-wrap">
        <div className="wrap-lg">
          <div className="list-search-inner">
            <div className="lsearch-box">
              <div className="search-icon">
                <Search />
              </div>
              <input
                type="text"
                placeholder="Search by name, org, keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search opportunities"
              />
            </div>
            <select
              className="filter-select"
              onChange={(e) => setSelectedRegions([e.target.value])}
              value={selectedRegions[0] || ''}
              aria-label="Filter by region"
            >
              <option value="">Any Region</option>
              <option value="Global">Global</option>
              <option value="Africa">Africa</option>
              <option value="Asia">Asia</option>
              <option value="Europe">Europe</option>
              <option value="North America">North America</option>
              <option value="South America">South America</option>
              <option value="Online">Online / Virtual</option>
            </select>
            <select
              className="filter-select"
              onChange={(e) => setDeadlineFilter(e.target.value as any)}
              value={deadlineFilter}
              aria-label="Filter by deadline"
            >
              <option value="any">Any Deadline</option>
              <option value="week">Next 7 days</option>
              <option value="30days">Next 30 days</option>
              <option value="3months">Next 3 months</option>
            </select>
            <div className="sort-toggle">
              <button className="sort-btn active">Deadline</button>
              <button className="sort-btn">Newest</button>
              <button className="sort-btn">A–Z</button>
            </div>
          </div>
        </div>
      </section>

      <section className="listing-body">
        <div className="wrap-xl">
          <div className="listing-body">
            <aside className="sidebar-left">
              <div className="filter-card">
                <div className="filter-title">
                  <span>Filters</span>
                  <button
                    className="filter-reset"
                    onClick={() => {
                      setSelectedRegions([])
                      setSelectedFunding([])
                      setDeadlineFilter('any')
                      setSearchQuery('')
                    }}
                  >
                    Reset all
                  </button>
                </div>

                <div className="filter-group">
                  <div className="filter-group-label">Funding Type</div>
                  <label className="filter-check">
                    <input
                      type="checkbox"
                      checked={selectedFunding.includes('fully_funded')}
                      onChange={() => toggleFunding('fully_funded')}
                    />
                    <div className="fcheck-box" />
                    <span>Fully Funded</span>
                    <span className="filter-count">{fundingCounts.fully_funded}</span>
                  </label>
                  <label className="filter-check">
                    <input
                      type="checkbox"
                      checked={selectedFunding.includes('partially_funded')}
                      onChange={() => toggleFunding('partially_funded')}
                    />
                    <div className="fcheck-box" />
                    <span>Partially Funded</span>
                    <span className="filter-count">{fundingCounts.partially_funded}</span>
                  </label>
                  <label className="filter-check">
                    <input
                      type="checkbox"
                      checked={selectedFunding.includes('self_funded')}
                      onChange={() => toggleFunding('self_funded')}
                    />
                    <div className="fcheck-box" />
                    <span>Self-Funded</span>
                    <span className="filter-count">{fundingCounts.self_funded}</span>
                  </label>
                </div>

                <div className="filter-divider" />

                <div className="filter-group">
                  <div className="filter-group-label">Deadline</div>
                  <div className="deadline-btns">
                    <button
                      className={`deadline-btn ${deadlineFilter === 'week' ? 'active' : ''}`}
                      onClick={() => setDeadlineFilter('week')}
                    >
                      ⚡ Closing this week
                    </button>
                    <button
                      className={`deadline-btn ${deadlineFilter === '30days' ? 'active' : ''}`}
                      onClick={() => setDeadlineFilter('30days')}
                    >
                      Next 30 days
                    </button>
                    <button
                      className={`deadline-btn ${deadlineFilter === '3months' ? 'active' : ''}`}
                      onClick={() => setDeadlineFilter('3months')}
                    >
                      Next 3 months
                    </button>
                    <button
                      className={`deadline-btn ${deadlineFilter === 'any' ? 'active' : ''}`}
                      onClick={() => setDeadlineFilter('any')}
                    >
                      Any time
                    </button>
                  </div>
                </div>

                <div className="filter-divider" />

                <div className="filter-group">
                  <div className="filter-group-label">Region</div>
                  <label className="filter-check">
                    <input
                      type="checkbox"
                      checked={selectedRegions.includes('Global')}
                      onChange={() => toggleRegion('Global')}
                    />
                    <div className="fcheck-box" />
                    <span>Global / All</span>
                    <span className="filter-count">{regionCounts['Global'] || 0}</span>
                  </label>
                  <label className="filter-check">
                    <input
                      type="checkbox"
                      checked={selectedRegions.includes('Africa')}
                      onChange={() => toggleRegion('Africa')}
                    />
                    <div className="fcheck-box" />
                    <span>Africa</span>
                    <span className="filter-count">{regionCounts['Africa'] || 0}</span>
                  </label>
                  <label className="filter-check">
                    <input
                      type="checkbox"
                      checked={selectedRegions.includes('Asia')}
                      onChange={() => toggleRegion('Asia')}
                    />
                    <div className="fcheck-box" />
                    <span>Asia</span>
                    <span className="filter-count">{regionCounts['Asia'] || 0}</span>
                  </label>
                  <label className="filter-check">
                    <input
                      type="checkbox"
                      checked={selectedRegions.includes('Europe')}
                      onChange={() => toggleRegion('Europe')}
                    />
                    <div className="fcheck-box" />
                    <span>Europe</span>
                    <span className="filter-count">{regionCounts['Europe'] || 0}</span>
                  </label>
                  <label className="filter-check">
                    <input
                      type="checkbox"
                      checked={selectedRegions.includes('Online')}
                      onChange={() => toggleRegion('Online')}
                    />
                    <div className="fcheck-box" />
                    <span>Online / Virtual</span>
                    <span className="filter-count">{regionCounts['Online'] || 0}</span>
                  </label>
                </div>
              </div>
            </aside>

            <div>
              <div className="results-header">
                <div className="results-count">
                  <span>{filteredOpportunities.length}</span> opportunities match your filters
                </div>
                <div className="view-toggle">
                  <button
                    className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                    onClick={() => setViewMode('grid')}
                    aria-label="Grid view"
                  >
                    <Grid3x3 />
                  </button>
                  <button
                    className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                    onClick={() => setViewMode('list')}
                    aria-label="List view"
                  >
                    <List />
                  </button>
                </div>
              </div>

              {isLoadingOpps ? (
                <LoadingState type={viewMode === 'grid' ? 'cards' : 'list'} />
              ) : oppsError ? (
                <ErrorState message={oppsError.message} />
              ) : filteredOpportunities.length === 0 ? (
                <EmptyState
                  title={searchQuery || selectedRegions.length > 0 ? 'No matches found' : 'No opportunities yet'}
                  description={searchQuery || selectedRegions.length > 0 ? 'Try adjusting your filters or search terms' : 'Check back soon for new opportunities'}
                  icon={searchQuery || selectedRegions.length > 0 ? 'filter' : 'empty'}
                  action={{
                    label: 'Clear filters',
                    onClick: () => {
                      setSearchQuery('')
                      setSelectedRegions([])
                      setSelectedFunding([])
                      setDeadlineFilter('any')
                    }
                  }}
                />
              ) : (
                <div className={viewMode === 'grid' ? 'cards-grid' : 'list-wrap'}>
                  {filteredOpportunities.map((opportunity) => (
                    <OpportunityCard key={opportunity.id} opportunity={opportunity} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
