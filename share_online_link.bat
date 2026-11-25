@echo off
title GradPath Online Share Link Generator
echo =======================================================
echo   GradPath: Generating Global Internet Share Link
echo   University of Frontier Technology, Bangladesh (UFTB)
echo =======================================================
echo.
echo Connecting to secure cloud tunnel...
echo (Please wait a few seconds for your public URL to appear below)
echo.
ssh -o StrictHostKeyChecking=no -R 80:localhost:5173 nokey@localhost.run
pause
