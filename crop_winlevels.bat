@echo off
setlocal enabledelayedexpansion

REM --- Crop center vertical strip, then scale to 1080x1920 ---
REM Adjust crop/scale if needed:
set VF=crop=720:1080:(in_w-720)/2:0,scale=1080:1920

for %%D in (
"C:\Users\bengimen\Desktop\newass\assetmaker\winlevel1"
"C:\Users\bengimen\Desktop\newass\assetmaker\winlevel2"
"C:\Users\bengimen\Desktop\newass\assetmaker\winlevel3"
"C:\Users\bengimen\Desktop\newass\assetmaker\winlevel4"
) do (
  set "IN=%%~D"
  set "OUT=%%~D_cropped"

  if not exist "!OUT!" mkdir "!OUT!"

  echo.
  echo Processing: "!IN!"
  echo Output:     "!OUT!"

  for %%F in ("%%~D\*.png") do (
    ffmpeg -hide_banner -loglevel error -y -i "%%F" -vf "%VF%" "!OUT!\%%~nF.png"
  )
)

echo.
echo Done. Cropped images saved in *_cropped folders.
pause