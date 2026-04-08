export interface Organization {
  id: string
  name: string
  description?: string
  country?: string
  logo_emoji: string
  created_at: string
}

export interface Category {
  id: string
  name: string
  emoji: string
  description?: string
  slug: string
  created_at: string
}

export interface Tag {
  id: string
  name: string
  color: string
  created_at: string
}

export interface Opportunity {
  id: string
  title: string
  slug: string
  organization_id: string
  description: string
  full_description?: string
  eligibility?: any
  benefits?: any
  timeline?: any
  deadline: string
  program_start?: string
  duration?: string
  location: string
  region: string
  funding_type: 'fully_funded' | 'partially_funded' | 'self_funded'
  career_stage?: string
  application_url: string
  is_featured: boolean
  is_new: boolean
  is_draft?: boolean
  created_at: string
  updated_at: string
  organization?: Organization
  categories?: Category[]
  tags?: Tag[]
  opportunity_categories?: Array<{
    category: Category
  }>
}

export interface OpportunityWithRelations extends Opportunity {
  organization: Organization
  categories: Category[]
  tags: Tag[]
}
