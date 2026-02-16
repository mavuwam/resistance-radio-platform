# Media Storage Guide

## Overview

Resistance Radio uses AWS S3 for media storage with CloudFront CDN for fast global delivery.

## Architecture

```
User Upload → Backend API → AWS S3 → CloudFront CDN → End Users
```

### Components

1. **AWS S3 Bucket**: `resistance-radio-media-dev-734110488556`
   - Primary storage for all media files
   - Organized by folders: `audio/`, `images/`, `documents/`
   - Lifecycle policies for cost optimization

2. **CloudFront CDN**: `dxbqjcig99tjb.cloudfront.net`
   - Global content delivery network
   - Edge caching for fast access
   - HTTPS enabled
   - Custom domain support

3. **Backend API**: Upload endpoints with authentication
   - File validation and processing
   - Secure upload to S3
   - URL generation

## File Types & Limits

### Audio Files
- **Formats**: MP3, WAV, OGG, AAC, FLAC
- **Max Size**: 100MB
- **Folder**: `audio/`
- **Use Cases**: Episodes, live streams, sound effects

### Images
- **Formats**: JPEG, PNG, GIF, WebP, SVG
- **Max Size**: 5MB
- **Folder**: `images/`
- **Use Cases**: Show artwork, article images, thumbnails

### Documents
- **Formats**: PDF, DOC, DOCX, TXT
- **Max Size**: 10MB
- **Folder**: `documents/`
- **Use Cases**: Resources, guides, transcripts

## API Endpoints

### Upload Audio
```http
POST /api/upload/audio
Authorization: Bearer <token>
Content-Type: multipart/form-data

Body: file (multipart)
```

**Response:**
```json
{
  "message": "File uploaded successfully",
  "file": {
    "key": "audio/uuid-filename.mp3",
    "url": "https://bucket.s3.amazonaws.com/audio/uuid-filename.mp3",
    "cdnUrl": "https://cdn.resistanceradio.org/audio/uuid-filename.mp3",
    "originalName": "episode-01.mp3",
    "size": 15728640,
    "mimeType": "audio/mpeg"
  }
}
```

### Upload Image
```http
POST /api/upload/image
Authorization: Bearer <token>
Content-Type: multipart/form-data

Body: file (multipart)
```

### Upload Document
```http
POST /api/upload/document
Authorization: Bearer <token>
Content-Type: multipart/form-data

Body: file (multipart)
```

### Delete File
```http
DELETE /api/upload/:folder/:filename
Authorization: Bearer <token>
```

### Get Signed URL (Private Content)
```http
GET /api/upload/signed-url/:folder/:filename?expiresIn=3600
Authorization: Bearer <token>
```

**Response:**
```json
{
  "signedUrl": "https://bucket.s3.amazonaws.com/audio/file.mp3?X-Amz-...",
  "expiresIn": 3600
}
```

## Frontend Usage

### FileUpload Component

```typescript
import FileUpload from '../components/FileUpload';

function MyComponent() {
  const handleUploadComplete = (fileData) => {
    console.log('File uploaded:', fileData);
    // Use fileData.cdnUrl for public access
  };

  const handleUploadError = (error) => {
    console.error('Upload failed:', error);
  };

  return (
    <FileUpload
      type="audio"
      onUploadComplete={handleUploadComplete}
      onUploadError={handleUploadError}
      label="Upload Episode"
    />
  );
}
```

### Direct API Call

```typescript
const uploadFile = async (file: File, type: 'audio' | 'image' | 'document') => {
  const formData = new FormData();
  formData.append('file', file);

  const token = localStorage.getItem('token');
  const response = await axios.post(
    `/api/upload/${type}`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`
      }
    }
  );

  return response.data.file;
};
```

## Security

### Authentication
- All upload endpoints require authentication
- Only `content_manager` and `administrator` roles can upload
- JWT token must be included in Authorization header

### File Validation
- MIME type checking
- File size limits enforced
- Malicious file detection
- Sanitized filenames (UUID-based)

### Access Control
- Public files: Accessible via CDN URL
- Private files: Require signed URLs with expiration
- Signed URLs expire after 1 hour by default

## CDN Configuration

### Caching
- Static assets cached for 1 year
- Cache-Control headers set automatically
- Invalidation via CloudFront API

### Performance
- Global edge locations
- Gzip/Brotli compression
- HTTP/2 support
- SSL/TLS encryption

### Custom Domain
To use a custom domain (e.g., `media.resistanceradio.org`):

1. Create CNAME record pointing to CloudFront distribution
2. Add alternate domain name in CloudFront settings
3. Update SSL certificate
4. Update `CDN_URL` environment variable

## Storage Management

### Folder Structure
```
resistance-radio-media-dev-734110488556/
├── audio/
│   ├── uuid-episode-01.mp3
│   ├── uuid-episode-02.mp3
│   └── ...
├── images/
│   ├── uuid-show-artwork.jpg
│   ├── uuid-article-hero.png
│   └── ...
└── documents/
    ├── uuid-guide.pdf
    ├── uuid-transcript.txt
    └── ...
```

### Lifecycle Policies
- Transition to Glacier after 90 days (optional)
- Delete incomplete multipart uploads after 7 days
- Archive old content to reduce costs

### Backup
- Versioning enabled on S3 bucket
- Cross-region replication (optional)
- Regular backups to `resistance-radio-backup-dev-734110488556`

## Cost Optimization

### Storage Costs
- Standard storage: $0.023/GB/month
- Intelligent-Tiering: Automatic cost optimization
- Glacier for archives: $0.004/GB/month

### Transfer Costs
- CloudFront: $0.085/GB (first 10TB)
- S3 to CloudFront: Free
- Direct S3 access: $0.09/GB

### Best Practices
1. Use CloudFront for all public content
2. Enable intelligent-tiering for infrequently accessed files
3. Compress audio files before upload
4. Use WebP for images when possible
5. Delete unused files regularly

## Monitoring

### CloudWatch Metrics
- Storage usage
- Request count
- Error rates
- Bandwidth usage

### Alerts
- Storage exceeds 100GB
- Error rate > 1%
- Unusual traffic patterns

## Troubleshooting

### Upload Fails
1. Check file size and type
2. Verify authentication token
3. Check S3 bucket permissions
4. Review CloudWatch logs

### Slow Downloads
1. Verify CloudFront is being used
2. Check edge location coverage
3. Review cache hit ratio
4. Consider enabling compression

### Access Denied
1. Verify IAM permissions
2. Check bucket policy
3. Verify CORS configuration
4. Review CloudFront settings

## Environment Variables

```bash
# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_S3_MEDIA_BUCKET=resistance-radio-media-dev-734110488556
CDN_URL=https://dxbqjcig99tjb.cloudfront.net
```

## Migration Guide

### From Local Storage
1. Upload existing files via API
2. Update database URLs to CDN URLs
3. Verify all files accessible
4. Remove local copies

### To Different Bucket
1. Create new bucket
2. Copy files using AWS CLI: `aws s3 sync s3://old-bucket s3://new-bucket`
3. Update environment variables
4. Update CloudFront origin
5. Test thoroughly

## Resources

- [AWS S3 Documentation](https://docs.aws.amazon.com/s3/)
- [CloudFront Documentation](https://docs.aws.amazon.com/cloudfront/)
- [AWS SDK for JavaScript](https://docs.aws.amazon.com/sdk-for-javascript/)
