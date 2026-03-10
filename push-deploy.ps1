# push-deploy.ps1
# Automates the build, push, and deploy process

Write-Host "--- Starting Build Process ---" -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed! Exiting..." -ForegroundColor Red
    exit 1
}

Write-Host "--- Pushing to GitHub ---" -ForegroundColor Cyan
git add .
git commit -m "Update from Antigravity: Automated Push and Deploy"
git push origin master
if ($LASTEXITCODE -ne 0) {
    Write-Host "Git push failed! Check your authentication/permissions." -ForegroundColor Yellow
}

Write-Host "--- Deploying to GitHub Pages (laserartlb.com) ---" -ForegroundColor Cyan
npm run deploy
if ($LASTEXITCODE -ne 0) {
    Write-Host "Deployment failed! Check your gh-pages configuration." -ForegroundColor Yellow
}

Write-Host "--- Process Completed ---" -ForegroundColor Green
