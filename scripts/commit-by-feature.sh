
#!/usr/bin/env bash
set -Eeuo pipefail

# Usage:
#   ./scripts/commit-by-folder.sh
#   FILES_PER_COMMIT=3 ./scripts/commit-by-folder.sh

FILES_PER_COMMIT="${FILES_PER_COMMIT:-2}"

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "Error: Run this script inside your Git repository."
  exit 1
fi

if ! [[ "$FILES_PER_COMMIT" =~ ^[1-9][0-9]*$ ]]; then
  echo "Error: FILES_PER_COMMIT must be a positive integer."
  exit 1
fi

if ! git diff --cached --quiet; then
  echo "Error: Commit or unstage existing staged changes first."
  exit 1
fi

if ! git rev-parse --verify HEAD >/dev/null 2>&1; then
  echo "Error: Create an initial commit first."
  exit 1
fi

declare -A seen=()
files=()

# Collect tracked changes.
while IFS= read -r -d '' file; do
  files+=("$file")
  seen["$file"]=1
done < <(git diff --name-only -z HEAD)

# Collect untracked, non-ignored files.
while IFS= read -r -d '' file; do
  if [[ -z "${seen[$file]+yes}" ]]; then
    files+=("$file")
    seen["$file"]=1
  fi
done < <(git ls-files --others --exclude-standard -z)

# Exclude secrets and generated files.
filtered=()

for file in "${files[@]}"; do
  case "$file" in
    .env|.env.*|*/.env|*/.env.*|\
    node_modules/*|*/node_modules/*|\
    dist/*|*/dist/*|\
    build/*|*/build/*|\
    data/cv-uploads/*|*/data/cv-uploads/*|\
    *.pem|*.key)
      echo "Skipping protected/generated path: $file"
      continue
      ;;
  esac

  filtered+=("$file")
done

if ((${#filtered[@]} == 0)); then
  echo "No eligible changes found."
  exit 0
fi

mapfile -d '' -t files < <(
  printf '%s\0' "${filtered[@]}" | sort -z
)

folder_of() {
  local path="$1"
  if [[ "$path" == */* ]]; then
    printf '%s\n' "${path%/*}"
  else
    printf '.\n'
  fi
}

commit_prefix() {
  case "$1" in
    apps/frontend*) echo "feat(frontend)" ;;
    apps/backend*)  echo "feat(backend)" ;;
    lib/db*)        echo "db" ;;
    scripts*)       echo "chore(scripts)" ;;
    *)              echo "chore" ;;
  esac
}

describe_batch() {
  local folder="$1"
  local prefix
  prefix="$(commit_prefix "$folder")"

  case "$folder" in
    apps/frontend/src/components*)
      echo "feat(frontend): update shared UI components" ;;
    apps/frontend/src*)
      echo "feat(frontend): update application interface" ;;
    apps/frontend*)
      echo "chore(frontend): update frontend configuration" ;;
    apps/backend/src/lib*)
      echo "feat(backend): update backend services" ;;
    apps/backend/src*)
      echo "feat(backend): update API implementation" ;;
    apps/backend*)
      echo "chore(backend): update backend configuration" ;;
    lib/db*)
      echo "db: update database schema and configuration" ;;
    scripts*)
      echo "chore(scripts): update development scripts" ;;
    *)
      echo "$prefix: update $folder" ;;
  esac
}

index=0
total=${#files[@]}

while ((index < total)); do
  folder="$(folder_of "${files[$index]}")"
  batch=()

  while ((index < total)) &&
        [[ "$(folder_of "${files[$index]}")" == "$folder" ]] &&
        ((${#batch[@]} < FILES_PER_COMMIT)); do
    batch+=("${files[$index]}")
    ((index += 1))
  done

  message="$(describe_batch "$folder")"

  echo "----------------------------------------"
  echo "Folder: $folder"
  printf 'File: %s\n' "${batch[@]}"
  echo "Commit: $message"

  # Stage only this batch.
  git add -A -- "${batch[@]}"

  if git diff --cached --quiet; then
    echo "No changes to commit; skipping."
    continue
  fi

  # Use the actual current timestamp.
  timestamp="$(date '+%Y-%m-%dT%H:%M:%S%z')"

  GIT_AUTHOR_DATE="$timestamp" \
  GIT_COMMITTER_DATE="$timestamp" \
    git commit -m "$message"

done

echo
echo "All eligible batches processed."
echo
git log -20 --format='%h %ad %s' --date=iso
