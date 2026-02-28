# FTP file locations — hypnoadminpro.com

**Files for the live site must be uploaded to:** `public_html/website_11714fd1`

The FTP account must have its **Directory** set in cPanel (FTP Accounts → Manage) to either `public_html/website_11714fd1` or the full path `/home3/hktklrmy/public_html/website_11714fd1`. Otherwise uploads go to the account root, not the site folder.

**Upload commands:**
```bash
# Upload default (index.html)
python upload_to_server.py

# Upload a specific file
python upload_to_server.py index.html
```
