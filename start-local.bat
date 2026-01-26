@echo off
title Fantasy Wydad - Local Testing
echo ==================================================
echo   ⚽ FANTASY WYDAD : LANCEMENT LOCAL
echo ==================================================
echo.

echo [1/2] Lancement du BACKEND (API)...
start "Fantasy Wydad BACKEND" cmd /k "cd backend && npm run dev"

echo [2/2] Lancement du FRONTEND (React)...
start "Fantasy Wydad FRONTEND" cmd /k "cd frontend && npm run dev"

echo.
echo --------------------------------------------------
echo ✅ TOUT EST PRÊT !
echo.
echo 📝 Backend : http://localhost:5000
echo 🌐 Frontend : http://localhost:5173
echo.
echo Gardez ces fenêtres ouvertes pour tester.
echo Appuyez sur une touche pour fermer cet assistant.
echo --------------------------------------------------
pause
