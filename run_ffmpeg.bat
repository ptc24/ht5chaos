# A little batch file so I don't have to keep looking up ffmpeg runes
#ffmpeg.exe -r 5 -i images/img%%05d.png -b:v 2M -c:v libx264 -r 25 -pix_fmt yuv420p out.mp4
ffmpeg.exe -r 20 -i images/img%%05d.png -q:v 0 -pix_fmt yuv420p out.avi
