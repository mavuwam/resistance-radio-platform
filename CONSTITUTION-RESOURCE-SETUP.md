# Zimbabwe Constitution Resource Setup

## ✅ Completed Setup

The Zimbabwe Constitution (Consolidated 2023) has been successfully set up as a downloadable resource on your platform.

### What Was Done

1. **Document Upload to S3**
   - Uploaded: `Constitution Consolidated (2023).pdf` (1.3 MB)
   - Location: `s3://resistance-radio-media-dev-734110488556/documents/constitution.pdf`
   - Public URL: https://resistance-radio-media-dev-734110488556.s3.us-east-1.amazonaws.com/documents/constitution.pdf

2. **S3 Bucket Policy Configuration**
   - Added public read access for all files in the `documents/` folder
   - Policy allows anonymous downloads of constitutional documents
   - Secure: Only the `documents/*` path is publicly accessible

3. **Database Resource Entry**
   - Resource ID: 5
   - Title: "Zimbabwe Constitution (Consolidated 2023)"
   - Slug: `zimbabwe-constitution-2023`
   - Category: `constitutional_explainer`
   - Type: `pdf`
   - File Size: 1,344,893 bytes (1.3 MB)

## 📥 How Users Can Access

### On the Website

Users can now download the constitution from:
- **Resources Page**: https://resistanceradiostation.org/resources
- Filter by category: "Constitutional Explainers"
- Click the "Download" button on the constitution resource card

### Direct Download Link

https://resistance-radio-media-dev-734110488556.s3.us-east-1.amazonaws.com/documents/constitution.pdf

## 🔒 Security Configuration

### S3 Bucket Policy

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadDocuments",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::resistance-radio-media-dev-734110488556/documents/*"
    }
  ]
}
```

**What this means:**
- ✅ Anyone can download files from the `documents/` folder
- ❌ No one can upload, delete, or modify files (read-only)
- ❌ Other folders in the bucket remain private
- ✅ Secure and appropriate for public educational materials

## 📁 Adding More Documents

To add more public documents in the future:

### 1. Upload to S3

```bash
aws s3 cp "path/to/document.pdf" \
  s3://resistance-radio-media-dev-734110488556/documents/document-name.pdf \
  --content-type "application/pdf" \
  --profile Personal_Account_734110488556 \
  --region us-east-1
```

### 2. Add to Database

Create a script similar to `backend/src/db/add-constitution-resource.ts`:

```typescript
await pool.query(`
  INSERT INTO resources (
    title, slug, description, category, resource_type,
    file_url, file_size_bytes, created_at, updated_at
  ) VALUES (
    $1, $2, $3, $4, $5, $6, $7, NOW(), NOW()
  )
`, [
  'Document Title',
  'document-slug',
  'Document description',
  'constitutional_explainer', // or other category
  'pdf',
  'https://resistance-radio-media-dev-734110488556.s3.us-east-1.amazonaws.com/documents/document-name.pdf',
  fileSize
]);
```

### 3. Run the Script

```bash
npx ts-node backend/src/db/add-your-resource.ts
```

## 🎯 Resource Categories

Available categories for resources:
- `constitutional_explainer` - Constitutional documents and guides
- `debate_toolkit` - Debate and discussion materials
- `citizen_rights` - Rights and responsibilities guides
- `audio_clips` - Audio resources
- `educational_material` - General educational content
- `press_kit` - Media and press materials

## 🔍 Verification

Test the download:

```bash
# Check if publicly accessible
curl -I "https://resistance-radio-media-dev-734110488556.s3.us-east-1.amazonaws.com/documents/constitution.pdf"

# Should return: HTTP/1.1 200 OK
```

Or visit the URL in your browser - it should download immediately.

## 📊 Usage Tracking

To track downloads in the future, consider:
1. Using CloudFront with access logs
2. Adding analytics to the download button
3. Using S3 access logs (requires additional setup)

## 🚀 Next Steps

The constitution is now live and accessible! Users visiting the Resources page will see it in the "Constitutional Explainers" section and can download it with one click.

### Recommended Additional Documents

Consider adding:
- Bill of Rights explained
- Civic participation guides
- Electoral process overview
- Constitutional amendments history
- Citizen rights handbook

---

**Setup Date**: February 17, 2026  
**Document Size**: 1.3 MB  
**Public Access**: ✅ Enabled  
**Database Entry**: ✅ Created  
**Status**: 🟢 Live and Ready
