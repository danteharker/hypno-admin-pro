"""Upload a file to Bluehost (public_html/website_11714fd1). Uses ftp_connect."""
import sys
from ftp_connect import connect, upload_file, TARGET_DIR

def main():
    filename = sys.argv[1] if len(sys.argv) > 1 else "index.html"
    remote_name = sys.argv[2] if len(sys.argv) > 2 else None  # e.g. upload X as index.html
    print("Uploading", filename, "to", TARGET_DIR, "as", remote_name or filename, "...")
    try:
        ftp = connect()
        # Go to target folder, or we're already there (chrooted)
        try:
            ftp.cwd(TARGET_DIR)
        except Exception:
            # Account is chrooted to that folder — upload to current dir
            pass
        name = upload_file(ftp, filename, remote_name)
        ftp.quit()
        print("Done. Uploaded:", name)
    except FileNotFoundError:
        print("Error: File not found:", filename)
        sys.exit(1)
    except Exception as e:
        print("Error:", e)
        sys.exit(1)

if __name__ == "__main__":
    main()
