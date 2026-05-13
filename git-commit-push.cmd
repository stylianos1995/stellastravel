@echo off
cd /d "%~dp0"
git add src server package.json package-lock.json README.md public
if errorlevel 1 exit /b 1
git commit -m "Add partner agencies on home page; fix Data import path"
if errorlevel 1 exit /b 1
git push -u origin main
