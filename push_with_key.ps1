$ErrorActionPreference = "Stop"

# ===== 固定配置（按需修改）=====
$RepoPath = "C:\Data\code\imtoken\bitrefill-demo"
$KeyPath = "C:\Users\wyb\.ssh\github_deploy_20260522_153640"
$CommitMessage = "chore: update"
$Branch = "master"
$Remote = "origin"
$RemoteUrl = "git@github.com:00xSimple/bitrefill-wallet-demo.git"

if (!(Test-Path $RepoPath)) { throw "RepoPath 不存在: $RepoPath" }
if (!(Test-Path $KeyPath)) { throw "KeyPath 不存在: $KeyPath" }

Push-Location $RepoPath
try {
  if (!(Test-Path ".git")) { throw "当前目录不是 Git 仓库: $RepoPath" }

  git remote get-url $Remote *> $null
  if ($LASTEXITCODE -eq 0) {
    git remote set-url $Remote $RemoteUrl
  } else {
    git remote add $Remote $RemoteUrl
  }

  $env:GIT_SSH_COMMAND = "ssh -i `"$KeyPath`" -o IdentitiesOnly=yes"

  git add -A
  git diff --cached --quiet
  if ($LASTEXITCODE -eq 0) {
    Write-Host "没有可提交的变更，结束。"
    exit 0
  }

  git commit -m $CommitMessage
  git push -u $Remote $Branch
  Write-Host "推送完成。"
}
finally {
  Remove-Item Env:GIT_SSH_COMMAND -ErrorAction SilentlyContinue
  Pop-Location
}
