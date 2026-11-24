@echo off
setlocal enabledelayedexpansion
title Push ke GitHub - Creative Portfolio

:: Pindah ke folder project tempat file .bat ini berada
cd /d "%~dp0"

echo ===================================================
echo       AUTO PUSH KE GITHUB - KALUNA VISUAL
echo ===================================================
echo.

:: Cek apakah git terdeteksi
where git >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Git tidak ditemukan di sistem!
    goto selesai
)

:: Tampilkan ringkasan file yang berubah
echo File yang berubah / ditambahkan:
git status -s
echo.

:: Input pesan commit opsional
set "commit_msg="
set /p "commit_msg=Pesan commit (Tekan Enter langsung untuk pesan otomatis): "

if "!commit_msg!"=="" (
    set "commit_msg=Update portfolio - %date% %time:~0,5%"
)

echo.
echo [1/3] Menambahkan file ke Git (git add) ...
git add .

echo.
echo [2/3] Membuat commit...
git commit -m "!commit_msg!"

echo.
echo [3/3] Mengunggah ke GitHub (git push origin main) ...
git push origin main

if %errorlevel% equ 0 (
    echo.
    echo ===================================================
    echo  [SUKSES] Perubahan berhasil di-push ke GitHub!
    echo  GitHub Actions akan otomatis build ^& deploy ke web.
    echo ===================================================
) else (
    echo.
    echo ===================================================
    echo  [GAGAL] Gagal mengunggah ke GitHub.
    echo  Periksa koneksi internet atau autentikasi GitHub.
    echo ===================================================
)

:selesai
echo.
pause
