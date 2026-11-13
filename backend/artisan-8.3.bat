@echo off
REM Lance artisan avec le bon PHP meme si PATH pointe encore sur 8.1
C:\wamp\bin\php\php8.3.14\php.exe "%~dp0artisan" %*
