import { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import type { Category, Tag, Organization } from '@/types'

export function AddOpportunityPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditMode = !!id

  const [formData, setFormData] = useState({
    title: '',
    organizationId: '',
    newOrganization: '',
    newOrgCountry: '',
    newOrgEmoji: '🏢',
    categoryIds: [] as string[],
    location: '',
    deadline: '',
    fundingType: 'fully_funded' as 'fully_funded' | 'partially_funded' | 'self_funded',
    startDate: '',
    duration: '',
    fullDescription: '',
    eligibleNationalities: '',
    careerStage: '',
    ageRange: '',
    sector: '',
    applicationUrl: '',
    region: 'Global',
    tagIds: [] as string[],
    tagInput: '',
    isFeatured: false,
  })

  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    if (!localStorage.getItem('admin-logged-in')) {
      navigate('/admin/login')
      return
    }

    async function fetchData() {
      setFetching(true)
      try {
        const [categoriesRes, tagsRes, orgsRes] = await Promise.all([
          supabase.from('categories').select('*').order('name'),
          supabase.from('tags').select('*').order('name'),
          supabase.from('organizations').select('*').order('name')
        ])

        if (categoriesRes.data) setCategories(categoriesRes.data)
        if (tagsRes.data) setTags(tagsRes.data)
        if (orgsRes.data) setOrganizations(orgsRes.data)

        if (isEditMode && id) {
          const { data: opportunity, error } = await supabase
            .from('opportunities')
            .select(`
              *,
              opportunity_categories(category_id),
              opportunity_tags(tag_id)
            `)
            .eq('id', id)
            .single()

          if (error) throw error

          if (opportunity) {
            setFormData({
              title: opportunity.title || '',
              organizationId: opportunity.organization_id || '',
              newOrganization: '',
              newOrgCountry: '',
              newOrgEmoji: '🏢',
              categoryIds: opportunity.opportunity_categories?.map((oc: any) => oc.category_id) || [],
              location: opportunity.location || '',
              deadline: opportunity.deadline || '',
              fundingType: opportunity.funding_type || 'fully_funded',
              startDate: opportunity.program_start || '',
              duration: opportunity.duration || '',
              fullDescription: opportunity.full_description || opportunity.description || '',
              eligibleNationalities: opportunity.eligibility?.nationalities || '',
              careerStage: opportunity.career_stage || '',
              ageRange: opportunity.eligibility?.age_range || '',
              sector: opportunity.eligibility?.sector || '',
              applicationUrl: opportunity.application_url || '',
              region: opportunity.region || 'Global',
              tagIds: opportunity.opportunity_tags?.map((ot: any) => ot.tag_id) || [],
              tagInput: '',
              isFeatured: opportunity.is_featured || false,
            })
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        toast.error('Failed to load form data')
      } finally {
        setFetching(false)
      }
    }

    fetchData()
  }, [navigate, id, isEditMode])

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      let organizationId = formData.organizationId

      if (formData.newOrganization.trim()) {
        const { data: newOrg, error: orgError } = await supabase
          .from('organizations')
          .insert({
            name: formData.newOrganization,
            country: formData.newOrgCountry || null,
            logo_emoji: formData.newOrgEmoji || '🏢',
          })
          .select()
          .single()

        if (orgError) throw orgError
        organizationId = newOrg.id
      }

      if (!organizationId) {
        toast.error('Please select or create an organization')
        setLoading(false)
        return
      }

      const eligibility = {
        nationalities: formData.eligibleNationalities || null,
        age_range: formData.ageRange || null,
        sector: formData.sector || null,
      }

      const opportunityData = {
        title: formData.title,
        slug: generateSlug(formData.title),
        organization_id: organizationId,
        description: formData.fullDescription.substring(0, 280),
        full_description: formData.fullDescription || null,
        eligibility,
        deadline: formData.deadline,
        program_start: formData.startDate || null,
        duration: formData.duration || null,
        location: formData.location,
        region: formData.region,
        funding_type: formData.fundingType,
        career_stage: formData.careerStage || null,
        application_url: formData.applicationUrl,
        is_featured: formData.isFeatured,
        is_new: !isEditMode,
        updated_at: new Date().toISOString(),
      }

      let opportunityId: string

      if (isEditMode && id) {
        const { error: updateError } = await supabase
          .from('opportunities')
          .update(opportunityData)
          .eq('id', id)

        if (updateError) throw updateError
        opportunityId = id

        await supabase.from('opportunity_categories').delete().eq('opportunity_id', id)
        await supabase.from('opportunity_tags').delete().eq('opportunity_id', id)
      } else {
        const { data: newOpp, error: insertError } = await supabase
          .from('opportunities')
          .insert(opportunityData)
          .select()
          .single()

        if (insertError) throw insertError
        opportunityId = newOpp.id
      }

      if (formData.categoryIds.length > 0) {
        const categoryJunctions = formData.categoryIds.map(catId => ({
          opportunity_id: opportunityId,
          category_id: catId,
        }))
        const { error: catError } = await supabase
          .from('opportunity_categories')
          .insert(categoryJunctions)
        if (catError) throw catError
      }

      if (formData.tagIds.length > 0) {
        const tagJunctions = formData.tagIds.map(tagId => ({
          opportunity_id: opportunityId,
          tag_id: tagId,
        }))
        const { error: tagError } = await supabase
          .from('opportunity_tags')
          .insert(tagJunctions)
        if (tagError) throw tagError
      }

      toast.success(isEditMode ? 'Opportunity updated successfully!' : 'Opportunity published successfully!')
      navigate('/admin/listings')
    } catch (error: any) {
      console.error('Error saving opportunity:', error)
      toast.error(error.message || 'Failed to save opportunity')
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return <div className="page-head"><div className="page-title">Loading...</div></div>
  }

  return (
    <div>
      <div className="page-head">
        <div className="page-head-left">
          <div className="page-eyebrow">Listings</div>
          <div className="page-title">{isEditMode ? 'Edit Opportunity' : 'Add New Opportunity'}</div>
          <div className="page-sub">Fill in the details below. All fields marked * are required.</div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Link to="/admin/listings">
            <button className="btn btn-outline">Cancel</button>
          </Link>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Saving...' : (isEditMode ? 'Update Listing' : 'Publish Listing')}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px', alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            <div className="card" style={{ marginBottom: '16px' }}>
              <div className="form-section">
                <div className="form-section-title">Basic Information</div>
                <div className="form-grid">
                  <div className="form-group full">
                    <label className="form-label">Opportunity Title <span>*</span></label>
                    <input
                      className="form-input"
                      type="text"
                      placeholder="e.g. Obama Foundation Leaders Program 2025"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Organisation</label>
                    <input
                      className="form-input"
                      type="text"
                      list="organizations-list"
                      placeholder="Type or select organization..."
                      value={formData.organizationId ? organizations.find(o => o.id === formData.organizationId)?.name || '' : formData.newOrganization}
                      onChange={(e) => {
                        const selectedOrg = organizations.find(o => o.name === e.target.value)
                        if (selectedOrg) {
                          setFormData({ ...formData, organizationId: selectedOrg.id, newOrganization: '' })
                        } else {
                          setFormData({ ...formData, organizationId: '', newOrganization: e.target.value })
                        }
                      }}
                      style={{ marginBottom: '8px' }}
                    />
                    <datalist id="organizations-list">
                      {organizations.map(org => (
                        <option key={org.id} value={org.name} />
                      ))}
                    </datalist>
                    {formData.newOrganization && !formData.organizationId && (
                      <div style={{ marginTop: '8px', padding: '8px 12px', background: 'var(--blue-bg)', border: '1px solid var(--blue)', borderRadius: 'var(--r)', fontSize: '12px', color: 'var(--blue)' }}>
                        Will create new organization: "{formData.newOrganization}"
                      </div>
                    )}
                    {formData.newOrganization && !formData.organizationId && (
                      <>
                        <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr', gap: '8px', marginTop: '8px' }}>
                          <input
                            className="form-input"
                            type="text"
                            placeholder="🏢"
                            value={formData.newOrgEmoji}
                            onChange={(e) => setFormData({ ...formData, newOrgEmoji: e.target.value })}
                            maxLength={2}
                          />
                          <input
                            className="form-input"
                            type="text"
                            placeholder="Country (optional)"
                            value={formData.newOrgCountry}
                            onChange={(e) => setFormData({ ...formData, newOrgCountry: e.target.value })}
                          />
                        </div>
                      </>
                    )}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Categories <span>*</span></label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '140px', overflowY: 'auto', padding: '4px' }}>
                      {categories.map(cat => (
                        <label key={cat.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={formData.categoryIds.includes(cat.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({ ...formData, categoryIds: [...formData.categoryIds, cat.id] })
                              } else {
                                setFormData({ ...formData, categoryIds: formData.categoryIds.filter(id => id !== cat.id) })
                              }
                            }}
                          />
                          <span style={{ fontSize: '13px' }}>{cat.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Country / Location <span>*</span></label>
                    <input
                      className="form-input"
                      type="text"
                      placeholder="e.g. United States / Global"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Application Deadline <span>*</span></label>
                    <input
                      className="form-input"
                      type="date"
                      value={formData.deadline}
                      onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <div className="form-section-title">Funding & Duration</div>
                <div className="form-grid">
                  <div className="form-group full">
                    <label className="form-label">Funding Type <span>*</span></label>
                    <div className="radio-group">
                      <label className={`radio-option ${formData.fundingType === 'fully_funded' ? 'selected' : ''}`} onClick={() => setFormData({ ...formData, fundingType: 'fully_funded' })}>
                        <input type="radio" name="funding" value="fully_funded" />
                        <div className="radio-dot"></div>
                        ✓ Fully Funded
                      </label>
                      <label className={`radio-option ${formData.fundingType === 'partially_funded' ? 'selected' : ''}`} onClick={() => setFormData({ ...formData, fundingType: 'partially_funded' })}>
                        <input type="radio" name="funding" value="partially_funded" />
                        <div className="radio-dot"></div>
                        ◐ Partially Funded
                      </label>
                      <label className={`radio-option ${formData.fundingType === 'self_funded' ? 'selected' : ''}`} onClick={() => setFormData({ ...formData, fundingType: 'self_funded' })}>
                        <input type="radio" name="funding" value="self_funded" />
                        <div className="radio-dot"></div>
                        Self-Funded
                      </label>
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Program Start Date</label>
                    <input
                      className="form-input"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Duration</label>
                    <input
                      className="form-input"
                      type="text"
                      placeholder="e.g. 2 years, 6 weeks"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <div className="form-section-title">Description</div>
                <div className="form-grid">
                  <div className="form-group full">
                    <label className="form-label">Program Description <span>*</span></label>
                    <textarea
                      className="form-textarea"
                      placeholder="Full program details, what's covered, impact, eligibility highlights, etc."
                      style={{ minHeight: '200px' }}
                      value={formData.fullDescription}
                      onChange={(e) => setFormData({ ...formData, fullDescription: e.target.value })}
                      required
                    ></textarea>
                    <span className="form-hint">First 280 characters will be shown on cards. Full description appears on detail page.</span>
                  </div>
                </div>
              </div>

              <div className="form-section">
                <div className="form-section-title">Eligibility</div>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Eligible Nationalities</label>
                    <input
                      className="form-input"
                      type="text"
                      placeholder="e.g. All African countries, Global"
                      value={formData.eligibleNationalities}
                      onChange={(e) => setFormData({ ...formData, eligibleNationalities: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Career Stage</label>
                    <select
                      className="form-select"
                      value={formData.careerStage}
                      onChange={(e) => setFormData({ ...formData, careerStage: e.target.value })}
                    >
                      <option>Any</option>
                      <option>Student / Graduate</option>
                      <option>Early Career (0–5 yrs)</option>
                      <option>Mid-Career (5–15 yrs)</option>
                      <option>Senior / Executive</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Age Range</label>
                    <input
                      className="form-input"
                      type="text"
                      placeholder="e.g. 18–35, No restriction"
                      value={formData.ageRange}
                      onChange={(e) => setFormData({ ...formData, ageRange: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Sector / Field</label>
                    <input
                      className="form-input"
                      type="text"
                      placeholder="e.g. Governance, Public Health, Tech"
                      value={formData.sector}
                      onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'sticky', top: '24px' }}>
            <div className="card card-sm">
              <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text)', marginBottom: '14px' }}>Publishing</div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
                <div className="toggle-wrap">
                  <label className="toggle">
                    <input type="checkbox" checked={formData.isFeatured} onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })} />
                    <div className="toggle-track"></div>
                  </label>
                  <span className="toggle-label">Featured listing</span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button type="submit" className="btn btn-primary" style={{ justifyContent: 'center', width: '100%' }} disabled={loading}>
                  {loading ? 'Saving...' : (isEditMode ? 'Update Listing' : 'Publish Listing')}
                </button>
              </div>
            </div>

            <div className="card card-sm">
              <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text)', marginBottom: '14px' }}>Official Link</div>
              <div className="form-group">
                <label className="form-label">Application URL <span style={{ color: 'var(--red)' }}>*</span></label>
                <input
                  className="form-input"
                  type="url"
                  placeholder="https://..."
                  value={formData.applicationUrl}
                  onChange={(e) => setFormData({ ...formData, applicationUrl: e.target.value })}
                  required
                />
                <span className="form-hint">Must link to the official application page. Meridian never links to third parties.</span>
              </div>
            </div>

            <div className="card card-sm">
              <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text)', marginBottom: '14px' }}>Visibility Tags</div>
              <div className="form-group">
                <label className="form-label">Regions Eligible</label>
                <select
                  className="form-select"
                  style={{ marginBottom: '8px' }}
                  value={formData.region}
                  onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                >
                  <option>Global</option>
                  <option>South Asia</option>
                  <option>Africa</option>
                  <option>Europe</option>
                  <option>Southeast Asia</option>
                  <option>North America</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Additional Tags</label>
                <input
                  className="form-input"
                  type="text"
                  list="tags-list"
                  placeholder="Type to add tags..."
                  value={formData.tagInput}
                  onChange={(e) => setFormData({ ...formData, tagInput: e.target.value })}
                  onKeyDown={async (e) => {
                    if (e.key === 'Enter' || e.key === ',') {
                      e.preventDefault()
                      const tagName = formData.tagInput.trim().replace(',', '')
                      if (tagName) {
                        let existingTag = tags.find(t => t.name.toLowerCase() === tagName.toLowerCase())
                        if (!existingTag) {
                          const { data: newTag, error } = await supabase
                            .from('tags')
                            .insert({ name: tagName, slug: tagName.toLowerCase().replace(/\s+/g, '-') })
                            .select()
                            .single()
                          if (!error && newTag) {
                            existingTag = newTag
                            setTags([...tags, newTag])
                          }
                        }
                        if (existingTag && !formData.tagIds.includes(existingTag.id)) {
                          setFormData({ ...formData, tagIds: [...formData.tagIds, existingTag.id], tagInput: '' })
                        } else {
                          setFormData({ ...formData, tagInput: '' })
                        }
                      }
                    }
                  }}
                />
                <datalist id="tags-list">
                  {tags.filter(t => !formData.tagIds.includes(t.id)).map(tag => (
                    <option key={tag.id} value={tag.name} />
                  ))}
                </datalist>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                  {formData.tagIds.map(tagId => {
                    const tag = tags.find(t => t.id === tagId)
                    return tag ? (
                      <span
                        key={tagId}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '4px 10px',
                          background: 'var(--cream3)',
                          border: '1px solid var(--border)',
                          borderRadius: '100px',
                          fontSize: '12px',
                          color: 'var(--text2)'
                        }}
                      >
                        {tag.name}
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, tagIds: formData.tagIds.filter(id => id !== tagId) })}
                          style={{
                            background: 'none',
                            border: 'none',
                            padding: '0',
                            cursor: 'pointer',
                            color: 'var(--text4)',
                            lineHeight: 1
                          }}
                        >
                          ×
                        </button>
                      </span>
                    ) : null
                  })}
                </div>
                <div style={{ display: 'none', flexDirection: 'column', gap: '6px', maxHeight: '120px', overflowY: 'auto', padding: '4px' }}>
                  {tags.map(tag => (
                    <label key={tag.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={formData.tagIds.includes(tag.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({ ...formData, tagIds: [...formData.tagIds, tag.id] })
                          } else {
                            setFormData({ ...formData, tagIds: formData.tagIds.filter(id => id !== tag.id) })
                          }
                        }}
                      />
                      <span style={{ fontSize: '12px' }}>{tag.name}</span>
                    </label>
                  ))}
                </div>
                <span className="form-hint">Press Enter or comma to add. Type to search existing or create new tags.</span>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
