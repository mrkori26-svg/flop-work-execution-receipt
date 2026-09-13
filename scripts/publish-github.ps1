param([Parameter(Mandatory=$true)][ValidatePattern('^[A-Za-z0-9_.-]+$')][string]$Owner)
$ErrorActionPreference='Stop'
$RepoName='flop-work-execution-receipt'
$Version=(Get-Content -LiteralPath package.json -Raw|ConvertFrom-Json).version
$Tag="v$Version-alpha"
$Expected="https://github.com/$Owner/$RepoName.git"
if(-not(Get-Command gh -ErrorAction SilentlyContinue)){throw 'DESKTOP_INTERACTIVE_AUTH_REQUIRED: GitHub CLI is not installed.'}
gh auth status 1>$null 2>$null
if($LASTEXITCODE-ne 0){throw 'DESKTOP_INTERACTIVE_AUTH_REQUIRED: GitHub CLI is not authenticated.'}
if((git branch --show-current)-ne'main'){throw 'Release must run from main.'}
if(git status --porcelain){throw 'Working tree must be clean before publication.'}
npm ci --ignore-scripts
npm run check
New-Item -ItemType Directory -Force -Path release|Out-Null
npm pack --pack-destination release|Out-Null
$Tarball=(Get-ChildItem -LiteralPath release -Filter "flop-tools-work-execution-receipt-$Version.tgz" -File).FullName
$Hash=(Get-FileHash -LiteralPath $Tarball -Algorithm SHA256).Hash.ToLowerInvariant()
Set-Content -LiteralPath release\SHA256SUMS -Encoding ascii -Value "$Hash  $([IO.Path]::GetFileName($Tarball))"
$Origin=(git remote get-url origin 2>$null)
if($Origin-and($Origin-ne$Expected)-and($Origin-ne"git@github.com:$Owner/$RepoName.git")){throw "Refusing conflicting origin: $Origin"}
gh repo view "$Owner/$RepoName" 1>$null 2>$null
if($LASTEXITCODE-ne 0){gh repo create "$Owner/$RepoName" --public --description 'Portable deterministic evidence receipts for cross-system agent work observations.'}
if(-not$Origin){git remote add origin $Expected}
git push -u origin main
if(-not(git rev-parse -q --verify "refs/tags/$Tag^{}" 2>$null)){git tag -a $Tag -m "Portable Work Execution Receipt v$Version-alpha"}
git push origin $Tag
gh release view $Tag --repo "$Owner/$RepoName" 1>$null 2>$null
if($LASTEXITCODE-ne 0){gh release create $Tag $Tarball release\SHA256SUMS release-manifest.json schema\work-execution-receipt-v0.1.schema.json examples\receipt.json --repo "$Owner/$RepoName" --title "Portable Work Execution Receipt v$Version-alpha" --notes-file RELEASE_NOTES.md --prerelease}else{gh release upload $Tag $Tarball release\SHA256SUMS release-manifest.json schema\work-execution-receipt-v0.1.schema.json examples\receipt.json --repo "$Owner/$RepoName" --clobber}
