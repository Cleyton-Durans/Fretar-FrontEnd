@echo off
rem Liga o Fretar (back + front) e abre o navegador. Coloque este arquivo na raiz do projeto.
cd /d "%~dp0"
if not exist artisan (
  echo ERRO: coloque este arquivo na pasta do projeto, ao lado do arquivo artisan.
  pause
  exit /b 1
)
start "Fretar - BACK (deixe aberta)" cmd /k "php artisan config:clear && php artisan serve"
start "Fretar - FRONT (deixe aberta)" cmd /k "npm run dev"
echo Aguardando os servidores ligarem...
timeout /t 10 /nobreak >nul
start http://localhost:5173
