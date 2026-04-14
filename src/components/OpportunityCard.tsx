import { Link, useNavigate } from 'react-router-dom'
import type { Opportunity } from '@/types'
import { MapPin, Calendar, Bookmark, Building2 } from 'lucide-react'
import { format, differenceInDays } from 'date-fns'
import { useAuth } from '@/contexts/AuthContext'
import { useBookmarks } from '@/hooks/useBookmarks'
import { toast } from 'sonner'

interface OpportunityCardProps {
  opportunity: Opportunity & {
    organization?: any
    opportunity_categories?: Array<{ category: any }>
  }
}

export function OpportunityCard({ opportunity }: OpportunityCardProps) {
  const { user } = useAuth()
  const { isBookmarked, toggleBookmark } = useBookmarks()
  const navigate = useNavigate()
  const deadlineDate = new Date(opportunity.deadline)
  const daysUntilDeadline = differenceInDays(deadlineDate, new Date())
  const isClosingSoon = daysUntilDeadline <= 7 && daysUntilDeadline >= 0

  const fundingClass = {
    fully_funded: 'fund-full',
    partially_funded: 'fund-partial',
    self_funded: 'fund-self',
  }[opportunity.funding_type]

  const fundingLabel = {
    fully_funded: '✓ Fully Funded',
    partially_funded: '◐ Partial',
    self_funded: 'Self-funded',
  }[opportunity.funding_type]

  const primaryCategory = opportunity.opportunity_categories?.[0]?.category

  return (
    <Link to={`/opportunity/${opportunity.slug}`} className="card-link">
      <div className="card">
        <div className="card-head">
          <div className="card-tags">
            {primaryCategory && (
              <span className="tag tf">
                {primaryCategory.name}
              </span>
            )}
            {opportunity.is_featured && (
              <span className="tag" style={{ backgroundColor: 'var(--purple-bg)', color: 'var(--purple)' }}>
                Featured
              </span>
            )}
          </div>
          <button
            className="save-btn"
            onClick={async (e) => {
              e.preventDefault()
              if (!user) {
                toast.error('Please log in to save opportunities')
                navigate('/login')
                return
              }
              const { error } = await toggleBookmark(opportunity.id)
              if (error) {
                toast.error('Failed to save opportunity')
              } else {
                toast.success(isBookmarked(opportunity.id) ? 'Removed from saved' : 'Saved!')
              }
            }}
            aria-label="Save opportunity"
          >
            <Bookmark className={isBookmarked(opportunity.id) ? 'fill-current' : ''} />
          </button>
        </div>

        <h3 className="card-title">{opportunity.title}</h3>
        <div className="card-org">
          {opportunity.organization ? (
            <>
              
              {opportunity.organization.name}
              {opportunity.organization.country && ` · ${opportunity.organization.country}`}
            </>
          ) : (
            <>
              <Building2 style={{ width: '12px', height: '12px', display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
              Organization TBD · {opportunity.location}
            </>
          )}
        </div>

        <p className="card-desc" style={{ marginBottom: '8px' }}>{opportunity.description}</p>
        <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--terra)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '4px' }}>
          View details
          <svg style={{ width: '12px', height: '12px', stroke: 'currentColor', fill: 'none', strokeWidth: 2 }} viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </div>

        <div className="card-footer">
          <div className="card-metas">
            <div className={`meta ${isClosingSoon ? 'red' : ''}`}>
              <Calendar />
              <span>
                {isClosingSoon
                  ? `${format(deadlineDate, 'MMM d')} · ${daysUntilDeadline}d left`
                  : format(deadlineDate, 'MMM d, yyyy')}
              </span>
            </div>
            <div className="meta">
              <MapPin />
              <span>{opportunity.region === 'Online' ? '🌐 Online' : opportunity.region}</span>
            </div>
          </div>
          <span className={`fund ${fundingClass}`}>{fundingLabel}</span>
        </div>
      </div>
    </Link>
  )
}
