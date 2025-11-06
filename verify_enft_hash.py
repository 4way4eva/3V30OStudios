#!/usr/bin/env python3
"""
EVOL ENFT Hash Verification Script

This script verifies the integrity of ENFT artifacts by checking their SHA-256 hash.
It supports both local files and IPFS URIs.

Usage:
    python verify_enft_hash.py <file_path_or_ipfs_uri>

Examples:
    python verify_enft_hash.py EvolVerse_War_Codex_Scroll_SEALED.pdf
    python verify_enft_hash.py ipfs://QmABC.../EvolVerse_War_Codex_Scroll_SEALED.pdf
"""

import sys
import hashlib
import os
import urllib.request
import urllib.error

# Expected hash for the War Codex Scroll
EXPECTED_HASH = "f19f018eb2508f736c4a5694aad4e221a2a97b22b4657817760e490073cc1681"

# IPFS gateway URLs (will try each in order)
IPFS_GATEWAYS = [
    "https://ipfs.io/ipfs/",
    "https://gateway.pinata.cloud/ipfs/",
    "https://cloudflare-ipfs.com/ipfs/",
]


def calculate_sha256(file_path):
    """Calculate SHA-256 hash of a file."""
    sha256_hash = hashlib.sha256()
    try:
        with open(file_path, "rb") as f:
            # Read in chunks to handle large files
            for byte_block in iter(lambda: f.read(4096), b""):
                sha256_hash.update(byte_block)
        return sha256_hash.hexdigest()
    except FileNotFoundError:
        print(f"❌ Error: File not found: {file_path}")
        return None
    except Exception as e:
        print(f"❌ Error reading file: {e}")
        return None


def download_from_ipfs(ipfs_uri):
    """Download file from IPFS URI and return temporary file path."""
    # Parse IPFS URI (format: ipfs://CID/path or ipfs://CID)
    if not ipfs_uri.startswith("ipfs://"):
        print(f"❌ Error: Invalid IPFS URI format: {ipfs_uri}")
        return None
    
    # Extract CID and path
    ipfs_path = ipfs_uri[7:]  # Remove 'ipfs://'
    
    print(f"📥 Downloading from IPFS: {ipfs_path}")
    print(f"⏳ Trying IPFS gateways...")
    
    # Try each gateway
    for gateway in IPFS_GATEWAYS:
        url = gateway + ipfs_path
        try:
            print(f"   Trying: {gateway}...")
            response = urllib.request.urlopen(url, timeout=30)
            
            # Create temporary file
            temp_file = "/tmp/evol_enft_verify.tmp"
            with open(temp_file, "wb") as f:
                f.write(response.read())
            
            print(f"✅ Downloaded successfully from {gateway}")
            return temp_file
            
        except urllib.error.URLError as e:
            print(f"   ⚠️  Failed: {e}")
            continue
        except Exception as e:
            print(f"   ⚠️  Error: {e}")
            continue
    
    print(f"❌ Error: Could not download from any IPFS gateway")
    return None


def verify_hash(file_path, expected_hash=EXPECTED_HASH):
    """Verify file hash against expected value."""
    print("\n═══════════════════════════════════════")
    print("🔐 EVOL ENFT Hash Verification")
    print("═══════════════════════════════════════\n")
    
    print(f"📄 File: {file_path}")
    print(f"🎯 Expected hash: {expected_hash}\n")
    
    # Calculate actual hash
    print("⏳ Calculating SHA-256 hash...")
    actual_hash = calculate_sha256(file_path)
    
    if actual_hash is None:
        return False
    
    print(f"📊 Actual hash:   {actual_hash}\n")
    
    # Compare hashes
    if actual_hash.lower() == expected_hash.lower():
        print("═══════════════════════════════════════")
        print("✅ VERIFICATION SUCCESSFUL!")
        print("═══════════════════════════════════════")
        print("\n🎉 The artifact is authentic and unmodified.")
        print("   Hash matches expected value.\n")
        return True
    else:
        print("═══════════════════════════════════════")
        print("❌ VERIFICATION FAILED!")
        print("═══════════════════════════════════════")
        print("\n⚠️  WARNING: The artifact has been modified or corrupted.")
        print("   Hash does NOT match expected value.\n")
        print("   This could indicate:")
        print("   - File corruption during download")
        print("   - Intentional modification")
        print("   - Wrong file being verified\n")
        return False


def main():
    """Main entry point."""
    if len(sys.argv) < 2:
        print("Usage: python verify_enft_hash.py <file_path_or_ipfs_uri>")
        print("\nExamples:")
        print("  python verify_enft_hash.py EvolVerse_War_Codex_Scroll_SEALED.pdf")
        print("  python verify_enft_hash.py ipfs://QmABC.../EvolVerse_War_Codex_Scroll_SEALED.pdf")
        sys.exit(1)
    
    input_path = sys.argv[1]
    
    # Check if it's an IPFS URI
    if input_path.startswith("ipfs://"):
        temp_file = download_from_ipfs(input_path)
        if temp_file is None:
            sys.exit(1)
        file_path = temp_file
        cleanup_temp = True
    else:
        file_path = input_path
        cleanup_temp = False
    
    # Verify the hash
    success = verify_hash(file_path)
    
    # Cleanup temporary file if needed
    if cleanup_temp and os.path.exists(file_path):
        try:
            os.remove(file_path)
        except:
            pass
    
    # Exit with appropriate code
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
