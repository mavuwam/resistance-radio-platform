# Live Broadcast Integration Guide

## Overview

This guide explains how to integrate your live radio broadcast with the Zimbabwe Voice web application. The app already has the infrastructure in place - you just need to connect your streaming source.

---

## Quick Start

**What you need:**
1. A streaming server (Icecast, SHOUTcast, or cloud service)
2. Broadcasting software (OBS, Mixxx, RadioDJ, or similar)
3. Admin access to your Zimbabwe Voice backend

**Time to setup:** 15-30 minutes

---

## Architecture Overview

```
┌─────────────────┐
│  Broadcasting   │  (Your studio/DJ software)
│    Software     │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  Streaming      │  (Icecast/SHOUTcast/Cloud)
│    Server       │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  Zimbabwe Voice │  (Your web app)
│    Backend      │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│   Listeners     │  (Website visitors)
│   (Frontend)    │
└─────────────────┘
```

---

## Option 1: Free/Low-Cost Solutions (Recommended for Start)

### A. Radio.co (Easiest - Recommended)

**Cost:** Free tier available, paid plans from $10/month

**Setup Steps:**

1. **Sign up at [Radio.co](https://radio.co)**
   - Create free account
   - Get your stream URL (looks like: `https://stream.radio.co/your-station/listen`)

2. **Configure your broadcasting software**
   - Download [Mixxx](https://mixxx.org/) (free DJ software)
   - Or use [BUTT](https://danielnoethen.de/butt/) (Broadcast Using This Tool)
   - Connect to Radio.co using their provided credentials

3. **Add stream to Zimbabwe Voice**
   ```bash
   # Connect to your database
   psql -h your-database-host -U your-username -d your-database
   
   # Insert live broadcast
   INSERT INTO live_broadcasts (stream_url, is_active, started_at)
   VALUES ('https://stream.radio.co/your-station/listen', true, NOW());
   ```

4. **Test on your website**
   - Go to `/listen` page
   - Click "Listen Live" button
   - Stream should start playing!

**Pros:**
✅ No server setup required
✅ Reliable hosting
✅ Built-in analytics
✅ Mobile apps available
✅ Auto-DJ when you're offline

**Cons:**
❌ Limited customization
❌ Bandwidth limits on free tier

---

### B. Zeno.FM (Free Alternative)

**Cost:** Completely free

**Setup Steps:**

1. **Sign up at [Zeno.FM](https://zeno.fm)**
   - Create station
   - Get stream URL

2. **Use their web broadcaster or connect software**
   - They provide a web-based broadcaster (no software needed!)
   - Or connect with BUTT/Mixxx

3. **Add to Zimbabwe Voice** (same as Radio.co above)

**Pros:**
✅ Completely free
✅ Unlimited bandwidth
✅ Web-based broadcasting
✅ Mobile apps

**Cons:**
❌ Ads on free tier
❌ Less professional features

---

## Option 2: Self-Hosted (More Control)

### A. Icecast Server (Open Source)

**Cost:** Server hosting only ($5-20/month)

**Requirements:**
- VPS server (DigitalOcean, Linode, AWS EC2)
- Basic Linux knowledge

**Setup Steps:**

1. **Install Icecast on your server**
   ```bash
   # Ubuntu/Debian
   sudo apt update
   sudo apt install icecast2
   
   # Configure Icecast
   sudo nano /etc/icecast2/icecast.xml
   ```

2. **Configure Icecast**
   ```xml
   <icecast>
     <limits>
       <clients>100</clients>
       <sources>2</sources>
     </limits>
     
     <authentication>
       <source-password>YOUR_SOURCE_PASSWORD</source-password>
       <admin-password>YOUR_ADMIN_PASSWORD</admin-password>
     </authentication>
     
     <hostname>stream.zimbabwevoice.org</hostname>
     <listen-socket>
       <port>8000</port>
     </listen-socket>
   </icecast>
   ```

3. **Start Icecast**
   ```bash
   sudo systemctl start icecast2
   sudo systemctl enable icecast2
   ```

4. **Configure broadcasting software (Mixxx example)**
   - Settings → Live Broadcasting
   - Type: Icecast 2
   - Host: your-server-ip
   - Port: 8000
   - Mount: /live
   - Login: source
   - Password: YOUR_SOURCE_PASSWORD

5. **Your stream URL will be:**
   ```
   http://your-server-ip:8000/live
   ```

6. **Add to Zimbabwe Voice database**
   ```sql
   INSERT INTO live_broadcasts (stream_url, is_active, started_at)
   VALUES ('http://your-server-ip:8000/live', true, NOW());
   ```

**Pros:**
✅ Full control
✅ No bandwidth limits (depends on server)
✅ No ads
✅ Professional features

**Cons:**
❌ Requires server management
❌ Need to handle scaling
❌ Responsible for uptime

---

### B. AWS/CloudFront Streaming (Professional)

**Cost:** Pay-as-you-go (typically $20-100/month for small station)

**Setup Steps:**

1. **Create S3 bucket for HLS streaming**
2. **Set up MediaLive for encoding**
3. **Configure CloudFront distribution**
4. **Use OBS to stream to MediaLive**

*This is complex - only recommended if you need professional-grade streaming with global CDN.*

---

## Broadcasting Software Options

### 1. Mixxx (Recommended for DJs)

**Cost:** Free and open source

**Features:**
- Professional DJ interface
- Auto-DJ mode
- Live streaming built-in
- Cross-platform (Windows, Mac, Linux)

**Download:** [mixxx.org](https://mixxx.org)

**Quick Setup:**
1. Install Mixxx
2. Go to Preferences → Live Broadcasting
3. Enter your stream server details
4. Click "Enable Live Broadcasting"
5. Start playing music!

---

### 2. BUTT (Broadcast Using This Tool)

**Cost:** Free

**Features:**
- Simple interface
- Multiple codec support
- Recording while streaming
- Cross-platform

**Download:** [danielnoethen.de/butt](https://danielnoethen.de/butt/)

**Use case:** Simple talk shows, interviews

---

### 3. OBS Studio (For Video + Audio)

**Cost:** Free

**Features:**
- Video streaming (if you want video later)
- Scene switching
- Multiple audio sources
- Professional production

**Download:** [obsproject.com](https://obsproject.com)

**Use case:** Professional broadcasts, interviews with video

---

### 4. RadioDJ (Windows Only)

**Cost:** Free

**Features:**
- Full radio automation
- Playlist management
- Jingles and ads scheduling
- Request system

**Download:** [radiodj.ro](http://www.radiodj.ro)

**Use case:** Automated radio station

---

## Admin Panel Integration

### Starting a Live Broadcast

You need to add an admin interface to control broadcasts. Here's how:

1. **Create admin broadcast route** (`backend/src/routes/admin/broadcasts.ts`):

```typescript
import { Router, Request, Response } from 'express';
import pool from '../../db/connection';
import { authenticateToken, requireRole } from '../../middleware/auth';

const router = Router();

// Start live broadcast
router.post('/start', authenticateToken, requireRole(['admin', 'content_manager']), 
  async (req: Request, res: Response) => {
    const { show_id, stream_url } = req.body;
    
    try {
      // End any active broadcasts first
      await pool.query(
        'UPDATE live_broadcasts SET is_active = false, ended_at = NOW() WHERE is_active = true'
      );
      
      // Start new broadcast
      const result = await pool.query(
        `INSERT INTO live_broadcasts (show_id, stream_url, is_active, started_at)
         VALUES ($1, $2, true, NOW())
         RETURNING *`,
        [show_id, stream_url]
      );
      
      res.json({
        success: true,
        broadcast: result.rows[0]
      });
    } catch (error) {
      console.error('Error starting broadcast:', error);
      res.status(500).json({ error: 'Failed to start broadcast' });
    }
});

// Stop live broadcast
router.post('/stop', authenticateToken, requireRole(['admin', 'content_manager']), 
  async (req: Request, res: Response) => {
    try {
      await pool.query(
        'UPDATE live_broadcasts SET is_active = false, ended_at = NOW() WHERE is_active = true'
      );
      
      res.json({ success: true });
    } catch (error) {
      console.error('Error stopping broadcast:', error);
      res.status(500).json({ error: 'Failed to stop broadcast' });
    }
});

// Update listener count
router.post('/update-listeners', authenticateToken, requireRole(['admin']), 
  async (req: Request, res: Response) => {
    const { count } = req.body;
    
    try {
      await pool.query(
        'UPDATE live_broadcasts SET listener_count = $1 WHERE is_active = true',
        [count]
      );
      
      res.json({ success: true });
    } catch (error) {
      console.error('Error updating listener count:', error);
      res.status(500).json({ error: 'Failed to update listener count' });
    }
});

export default router;
```

2. **Register the route** in `backend/src/index.ts`:

```typescript
import adminBroadcastsRouter from './routes/admin/broadcasts';

// Add with other admin routes
app.use('/api/admin/broadcasts', adminBroadcastsRouter);
```

3. **Create admin UI component** (`frontend/src/pages/AdminBroadcastPage.tsx`):

```typescript
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

const AdminBroadcastPage: React.FC = () => {
  const [isLive, setIsLive] = useState(false);
  const [streamUrl, setStreamUrl] = useState('');
  const [selectedShow, setSelectedShow] = useState('');
  const [shows, setShows] = useState([]);

  const startBroadcast = async () => {
    try {
      await api.post('/admin/broadcasts/start', {
        show_id: selectedShow || null,
        stream_url: streamUrl
      });
      setIsLive(true);
      alert('Broadcast started!');
    } catch (error) {
      alert('Failed to start broadcast');
    }
  };

  const stopBroadcast = async () => {
    try {
      await api.post('/admin/broadcasts/stop');
      setIsLive(false);
      alert('Broadcast stopped!');
    } catch (error) {
      alert('Failed to stop broadcast');
    }
  };

  return (
    <div className="admin-broadcast-page">
      <h1>Live Broadcast Control</h1>
      
      <div className="broadcast-status">
        <h2>Status: {isLive ? '🔴 LIVE' : '⚫ OFFLINE'}</h2>
      </div>

      <div className="broadcast-controls">
        <div className="form-group">
          <label>Stream URL</label>
          <input
            type="text"
            value={streamUrl}
            onChange={(e) => setStreamUrl(e.target.value)}
            placeholder="https://stream.radio.co/your-station/listen"
          />
        </div>

        <div className="form-group">
          <label>Show (Optional)</label>
          <select value={selectedShow} onChange={(e) => setSelectedShow(e.target.value)}>
            <option value="">No specific show</option>
            {shows.map(show => (
              <option key={show.id} value={show.id}>{show.title}</option>
            ))}
          </select>
        </div>

        <div className="button-group">
          <button 
            className="btn btn-primary" 
            onClick={startBroadcast}
            disabled={!streamUrl || isLive}
          >
            Start Broadcast
          </button>
          <button 
            className="btn btn-secondary" 
            onClick={stopBroadcast}
            disabled={!isLive}
          >
            Stop Broadcast
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminBroadcastPage;
```

---

## Testing Your Setup

### 1. Test Stream URL

Before adding to database, test your stream URL:

```bash
# Using curl
curl -I https://stream.radio.co/your-station/listen

# Should return HTTP 200 OK
```

### 2. Test in Browser

Open browser console and test:

```javascript
const audio = new Audio('https://stream.radio.co/your-station/listen');
audio.play();
```

### 3. Test on Website

1. Add stream to database
2. Go to `/listen` page
3. Click "Listen Live"
4. Check browser console for errors

---

## Common Stream URL Formats

Different services use different URL formats:

```
# Radio.co
https://stream.radio.co/your-station/listen

# Zeno.FM
https://stream.zeno.fm/your-station-id

# Icecast
http://your-server:8000/mountpoint

# SHOUTcast
http://your-server:8000/stream

# AWS CloudFront HLS
https://your-distribution.cloudfront.net/live/stream.m3u8
```

---

## Audio Formats Supported

The web app supports these formats:
- **MP3** (most compatible)
- **AAC** (better quality, smaller size)
- **OGG** (open source)
- **HLS** (.m3u8 - for adaptive streaming)

**Recommended:** MP3 at 128kbps (good quality, wide compatibility)

---

## Troubleshooting

### Problem: "Listen Live" button doesn't work

**Solutions:**
1. Check stream URL is correct in database
2. Verify stream is actually broadcasting
3. Check browser console for CORS errors
4. Test stream URL directly in browser

### Problem: CORS errors

**Solution:** Configure your streaming server to allow your domain:

```
# Icecast: Add to icecast.xml
<http-headers>
  <header name="Access-Control-Allow-Origin" value="*" />
</http-headers>
```

### Problem: Stream buffers/stutters

**Solutions:**
1. Reduce bitrate (try 96kbps or 64kbps)
2. Check your upload speed
3. Use a server closer to your location
4. Consider using a CDN

### Problem: Can't connect from broadcasting software

**Solutions:**
1. Check firewall allows port 8000 (or your port)
2. Verify credentials are correct
3. Check server is running: `sudo systemctl status icecast2`
4. Check logs: `sudo tail -f /var/log/icecast2/error.log`

---

## Mobile Broadcasting

### Broadcasting from Phone

**Apps:**
- **Android:** Mixlr, Spreaker Studio
- **iOS:** Mixlr, Spreaker Studio, Bossjock Studio

**Setup:**
1. Install app
2. Configure with your stream server details
3. Start broadcasting from anywhere!

---

## Scheduling Broadcasts

### Option 1: Manual (Simple)

Admin logs in and clicks "Start Broadcast" when going live.

### Option 2: Automated (Advanced)

Use cron jobs to start/stop broadcasts:

```bash
# Start broadcast at 6 PM daily
0 18 * * * curl -X POST https://your-api.com/api/admin/broadcasts/start \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"stream_url":"YOUR_URL"}'

# Stop broadcast at 10 PM daily
0 22 * * * curl -X POST https://your-api.com/api/admin/broadcasts/stop \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Monitoring & Analytics

### Track Listener Count

If using Icecast, you can fetch listener count:

```bash
# Get Icecast stats
curl http://your-server:8000/status-json.xsl
```

### Update in Zimbabwe Voice

```bash
# Update listener count every minute
*/1 * * * * curl -X POST https://your-api.com/api/admin/broadcasts/update-listeners \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"count":25}'
```

---

## Recommended Setup for Zimbabwe Voice

### Phase 1: Launch (Now)

**Use Radio.co free tier:**
- Cost: $0
- Setup time: 15 minutes
- Reliability: High
- Features: Basic streaming

**Steps:**
1. Sign up at Radio.co
2. Get stream URL
3. Add to database
4. Test on website
5. Start broadcasting!

### Phase 2: Growth (3-6 months)

**Upgrade to Radio.co paid plan or self-host:**
- Cost: $10-20/month
- Better quality
- More listeners
- Custom branding

### Phase 3: Scale (1+ year)

**Consider professional setup:**
- Dedicated streaming server
- CDN for global reach
- Multiple bitrate options
- Video streaming capability

---

## Quick Reference Commands

### Add Stream to Database

```sql
-- Start new broadcast
INSERT INTO live_broadcasts (stream_url, is_active, started_at)
VALUES ('YOUR_STREAM_URL', true, NOW());

-- Stop all broadcasts
UPDATE live_broadcasts SET is_active = false, ended_at = NOW() WHERE is_active = true;

-- Check current status
SELECT * FROM live_broadcasts WHERE is_active = true;
```

### Test Stream

```bash
# Test if stream is accessible
curl -I YOUR_STREAM_URL

# Play stream in terminal (requires mpv)
mpv YOUR_STREAM_URL
```

---

## Support & Resources

### Documentation
- [Icecast Documentation](https://icecast.org/docs/)
- [Mixxx Manual](https://manual.mixxx.org/)
- [OBS Studio Guide](https://obsproject.com/wiki/)

### Community
- [r/internetradio](https://reddit.com/r/internetradio)
- [Icecast Mailing List](https://lists.xiph.org/mailman/listinfo/icecast)

### Troubleshooting
- Check browser console (F12)
- Check server logs
- Test stream URL directly
- Verify database entry

---

## Next Steps

1. **Choose your streaming solution** (Radio.co recommended for start)
2. **Set up broadcasting software** (Mixxx or BUTT)
3. **Add stream URL to database**
4. **Test on your website**
5. **Create admin interface** (optional but recommended)
6. **Start broadcasting!**

---

## Need Help?

If you encounter issues:
1. Check the Troubleshooting section above
2. Verify your stream URL works in a browser
3. Check database has correct stream URL
4. Review browser console for errors
5. Test with different browsers

Your app is already set up to handle live streaming - you just need to connect your broadcast source!

---

*Last Updated: February 2026*
