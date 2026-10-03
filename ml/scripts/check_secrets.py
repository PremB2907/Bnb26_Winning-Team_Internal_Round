import subprocess
import re
import sys

def check_secrets():
    print("--- RUNNING SECRET DISCOVERY & GIT HYGIENE CHECK ---")

    # 1. Verify .env is gitignored and not tracked by git
    status_proc = subprocess.run(["git", "ls-files", ".env"], capture_output=True, text=True)
    if status_proc.stdout.strip():
        print("CRITICAL ERROR: .env file is tracked by git! Un-track it immediately.")
        sys.exit(1)

    # 2. Check tracked files for API key patterns
    tracked_files = subprocess.run(["git", "ls-files"], capture_output=True, text=True).stdout.splitlines()

    key_patterns = [
        re.compile(r"AIza[0-9A-Za-z_-]{35}"),
        re.compile(r"AQ\.[0-9A-Za-z_-]+")
    ]

    violations = 0
    for fpath in tracked_files:
        # Skip binary files, venv, or cache
        if fpath.endswith((".png", ".jpg", ".db", ".sqlite", ".pyc")) or "ml/venv" in fpath:
            continue
        try:
            with open(fpath, "r", encoding="utf-8", errors="ignore") as f:
                content = f.read()
                for pat in key_patterns:
                    matches = pat.findall(content)
                    if matches:
                        print(f"SECRET LEAK ERROR in file {fpath}: Found secret matching pattern!")
                        violations += 1
        except Exception:
            pass

    if violations > 0:
        print(f"FAILED: {violations} secret leak violations detected in git-tracked files!")
        sys.exit(1)

    print("ALL SECRET DISCOVERY CHECKS PASSED GREEN! No secrets tracked in git.")

if __name__ == "__main__":
    check_secrets()
