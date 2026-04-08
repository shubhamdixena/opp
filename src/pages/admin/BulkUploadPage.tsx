import { useNavigate } from 'react-router-dom'
import { Upload } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export function BulkUploadPage() {
  const navigate = useNavigate()

  if (!localStorage.getItem('admin-logged-in')) {
    navigate('/admin/login')
    return null
  }

  return (
    <div>
      <div className="page-head">
        <div className="page-head-left">
          <div className="page-eyebrow">Import Data</div>
          <div className="page-title">Bulk Upload Opportunities</div>
          <div className="page-sub">Upload multiple opportunities at once</div>
        </div>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Bulk Upload</CardTitle>
            <CardDescription>
              Import multiple opportunities efficiently
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <Upload className="h-4 w-4" />
              <AlertTitle>Feature Coming Soon</AlertTitle>
              <AlertDescription>
                Bulk upload functionality will be available in a future update.
                For now, please use the Add Opportunity form to create individual opportunities.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
