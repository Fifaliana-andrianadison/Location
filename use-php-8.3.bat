@echo off
REM Bascule la session courante sur PHP 8.3.14 (WAMP) requis par backend/composer.json (^8.3)
set "PATH=C:\wamp\bin\php\php8.3.14;%PATH%"
php -v
echo PHP 8.3 actif pour cette fenetre. Relancez: cd backend ^&^& php artisan serve
