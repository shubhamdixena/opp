import { useState, useMemo, useEffect } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { useCategories } from '@/hooks/useCategories'
import type { Opportunity } from '@/types'
import { Search } from 'lucide-react'
import { OpportunityCard } from '@/components/OpportunityCard'
import { LoadingState } from '@/components/LoadingState'
import { EmptyState } from '@/components/EmptyState'
import { ErrorState } from '@/components/ErrorState'
import { supabase } from '@/lib/supabase'

const ITEMS_PER_PAGE = 5


  const getCategoryGradient = (slug: string) => {
    const defaultColor = 'linear-gradient(135deg,#f4f4f5 0%,#fafafa 60%,#ffffff 100%)';
    if (!slug) return defaultColor;
    
    const s = slug.toLowerCase();
    if (s.includes('scholarship')) return 'linear-gradient(135deg,#f0f7ff 0%,#e0effe 60%,#ffffff 100%)';
    if (s.includes('fellowship')) return 'linear-gradient(135deg,#fdf4fc 0%,#fbe8fa 60%,#ffffff 100%)';
    if (s.includes('grant')) return 'linear-gradient(135deg,#eefdf3 0%,#dcfce7 60%,#ffffff 100%)';
    if (s.includes('conference')) return 'linear-gradient(135deg,#fff5f1 0%,#ffede6 60%,#ffffff 100%)';
    if (s.includes('competition')) return 'linear-gradient(135deg,#f5f5ff 0%,#eceeff 60%,#ffffff 100%)';
    
    return defaultColor;
  };

export function CategoryPage() {
  const { slug } = useParams<{ slug: string }>()
  const [searchParams] = useSearchParams()
  const { getCategoryBySlug, isLoading: categoriesLoading, error: categoriesError } = useCategories()
  const category = slug ? getCategoryBySlug(slug) : null

  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [isLoadingOpps, setIsLoadingOpps] = useState(true)
  const [oppsError, setOppsError] = useState<Error | null>(null)
  
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '')
  const [selectedRegions, setSelectedRegions] = useState<string[]>([])
  const [selectedFunding, setSelectedFunding] = useState<string[]>([])
  const [deadlineFilter, setDeadlineFilter] = useState<'week' | '30days' | '3months' | 'any'>('any')
  const [selectedCountry, setSelectedCountry] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    async function fetchOpportunities() {
      if (!slug || !category) return

      try {
        setIsLoadingOpps(true)
        setOppsError(null)

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

  const availableRegions = useMemo(() => Array.from(new Set(opportunities.map(o => o.region))).filter(Boolean).sort(), [opportunities])
  const availableCountries = useMemo(() => Array.from(new Set(opportunities.map(o => o.location))).filter(Boolean).sort(), [opportunities])

  const filteredOpportunities = useMemo(() => {
    return opportunities.filter((opp) => {
      const matchesSearch =
        opp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        opp.description.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesRegion = selectedRegions.length === 0 || selectedRegions.includes(opp.region)
      const matchesFunding = selectedFunding.length === 0 || selectedFunding.includes(opp.funding_type)
      const matchesCountry = selectedCountry === '' || opp.location === selectedCountry

      let matchesDeadline = true
      if (deadlineFilter !== 'any') {
        const deadline = new Date(opp.deadline)
        const today = new Date()
        const daysUntil = Math.floor((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

        if (deadlineFilter === 'week') matchesDeadline = daysUntil <= 7
        else if (deadlineFilter === '30days') matchesDeadline = daysUntil <= 30
        else if (deadlineFilter === '3months') matchesDeadline = daysUntil <= 90
      }

      return matchesSearch && matchesRegion && matchesFunding && matchesDeadline && matchesCountry
    })
  }, [opportunities, searchQuery, selectedRegions, selectedFunding, deadlineFilter, selectedCountry])

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, selectedRegions, selectedFunding, deadlineFilter, selectedCountry])

  const totalPages = Math.ceil(filteredOpportunities.length / ITEMS_PER_PAGE)
  const paginatedOpportunities = filteredOpportunities.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  const regionCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    opportunities.forEach(opp => {
      counts[opp.region] = (counts[opp.region] || 0) + 1
    })
    return counts
  }, [opportunities])

  const fundingCounts = useMemo(() => {
    const counts: Record<string, number> = { fully_funded: 0, partially_funded: 0, self_funded: 0 }
    opportunities.forEach(opp => {
      counts[opp.funding_type] = (counts[opp.funding_type] || 0) + 1
    })
    return counts
  }, [opportunities])

  const toggleRegion = (region: string) => {
    setSelectedRegions(prev => prev.includes(region) ? prev.filter(r => r !== region) : [...prev, region])
  }

  const toggleFunding = (funding: string) => {
    setSelectedFunding(prev => prev.includes(funding) ? prev.filter(f => f !== funding) : [...prev, funding])
  }

  if (categoriesLoading) return <LoadingState type="detail" />
  if (categoriesError) return <ErrorState message={categoriesError.message} />
  if (!category) return <EmptyState title="Category not found" description="The category you're looking for doesn't exist." icon="empty" />

  return (
    <div>
      <section className="cat-header" style={{ background: category ? getCategoryGradient(category.slug) : undefined }}>
        <div className="wrap-lg">
          <div className="cat-hero-row">
            <div>
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
              <div className="search-icon"><Search /></div>
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
              onChange={(e) => setSelectedCountry(e.target.value)}
              value={selectedCountry}
              aria-label="Filter by country"
            >
              <option value="">Any Country</option>
              {availableCountries.map(loc => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
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
          </div>
        </div>
      </section>

      <section>
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
                      setSelectedCountry('')
                    }}
                  >
                    Reset all
                  </button>
                </div>

                <div className="filter-group">
                  <div className="filter-group-label">Funding Type</div>
                  <label className="filter-check">
                    <input type="checkbox" checked={selectedFunding.includes('fully_funded')} onChange={() => toggleFunding('fully_funded')} />
                    <div className="fcheck-box" />
                    <span>Fully Funded</span>
                    <span className="filter-count">{fundingCounts.fully_funded || 0}</span>
                  </label>
                  <label className="filter-check">
                    <input type="checkbox" checked={selectedFunding.includes('partially_funded')} onChange={() => toggleFunding('partially_funded')} />
                    <div className="fcheck-box" />
                    <span>Partially Funded</span>
                    <span className="filter-count">{fundingCounts.partially_funded || 0}</span>
                  </label>
                  <label className="filter-check">
                    <input type="checkbox" checked={selectedFunding.includes('self_funded')} onChange={() => toggleFunding('self_funded')} />
                    <div className="fcheck-box" />
                    <span>Self-Funded</span>
                    <span className="filter-count">{fundingCounts.self_funded || 0}</span>
                  </label>
                </div>

                <div className="filter-divider" />

                <div className="filter-group">
                  <div className="filter-group-label">Deadline</div>
                  <div className="deadline-btns">
                    <button className={`deadline-btn ${deadlineFilter === 'week' ? 'active' : ''}`} onClick={() => setDeadlineFilter('week')}>⚡ Closing this week</button>
                    <button className={`deadline-btn ${deadlineFilter === '30days' ? 'active' : ''}`} onClick={() => setDeadlineFilter('30days')}>Next 30 days</button>
                    <button className={`deadline-btn ${deadlineFilter === '3months' ? 'active' : ''}`} onClick={() => setDeadlineFilter('3months')}>Next 3 months</button>
                    <button className={`deadline-btn ${deadlineFilter === 'any' ? 'active' : ''}`} onClick={() => setDeadlineFilter('any')}>Any time</button>
                  </div>
                </div>

                <div className="filter-divider" />

                <div className="filter-group">
                  <div className="filter-group-label">Region</div>
                  {availableRegions.map(region => (
                    <label key={region} className="filter-check">
                      <input type="checkbox" checked={selectedRegions.includes(region)} onChange={() => toggleRegion(region)} />
                      <div className="fcheck-box" />
                      <span>{region}</span>
                      <span className="filter-count">{regionCounts[region] || 0}</span>
                    </label>
                  ))}
                </div>
              </div>
            </aside>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="results-header">
                <div className="results-count">
                  <span>{filteredOpportunities.length}</span> opportunities match your filters
                </div>
              </div>

              {isLoadingOpps ? (
                <LoadingState type="list" />
              ) : oppsError ? (
                <ErrorState message={oppsError.message} />
              ) : paginatedOpportunities.length === 0 ? (
                <EmptyState
                  title={searchQuery || selectedRegions.length > 0 || selectedCountry ? 'No matches found' : 'No opportunities yet'}
                  description={searchQuery || selectedRegions.length > 0 || selectedCountry ? 'Try adjusting your filters or search terms' : 'Check back soon for new opportunities'}
                  icon={searchQuery || selectedRegions.length > 0 || selectedCountry ? 'filter' : 'empty'}
                  action={{
                    label: 'Clear filters',
                    onClick: () => {
                      setSearchQuery('')
                      setSelectedRegions([])
                      setSelectedFunding([])
                      setDeadlineFilter('any')
                      setSelectedCountry('')
                    }
                  }}
                />
              ) : (
                <div className="cards-grid" style={{ gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)' }}>
                  {paginatedOpportunities.map((opportunity) => (
                    <OpportunityCard key={opportunity.id} opportunity={opportunity} />
                  ))}
                </div>
              )}

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '32px', paddingBottom: '32px' }}>
                  <button 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--card-bg)', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.5 : 1 }}
                  >
                    Previous
                  </button>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text2)' }}>
                    Page {currentPage} of {totalPages}
                  </span>
                  <button 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--card-bg)', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', opacity: currentPage === totalPages ? 0.5 : 1 }}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
