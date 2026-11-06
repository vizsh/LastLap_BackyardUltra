#!/bin/bash
# Encode the film's clips. Usage: tools/build_video.sh <source-folder> <output-folder>
# Desktop: 1920x1080. Phone: 1080x1920 portrait crop from the 4K masters.
# Every clip loops seamlessly: its tail dissolves into its own head, so there is no visible jump.
# No grain is baked in, because the film adds its own.
SRC="$1"; OUT="$2"
GRADE="hqdn3d=1.6:1.6:5:5,eq=contrast=1.08:saturation=0.9:gamma=0.94"
FADE=0.9

loopgraph() { # filters-before total-seconds
  local pre=$1 total=$2
  local off
  off=$(python -c "print(round($total-2*$FADE,3))")
  echo "[0:v]$pre,split=2[x][y];[x]trim=start=$FADE:end=$total,setpts=PTS-STARTPTS[a];[y]trim=end=$FADE,setpts=PTS-STARTPTS[b];[a][b]xfade=transition=fade:duration=$FADE:offset=$off,format=yuv420p[v]"
}

enc() { # name source start seconds slow crop-x-fraction [phone-width]
  local name=$1 src=$2 ss=$3 t=$4 slow=$5 cx=$6 pw=${7:-1080}
  local ph=$((pw*16/9))
  local total
  total=$(python -c "print(round($t*$slow,3))")
  ffmpeg -v error -y -ss "$ss" -t "$t" -i "$SRC/$src" -an \
    -filter_complex "$(loopgraph "setpts=$slow*PTS,scale=1920:1080:flags=lanczos,$GRADE,fps=24" "$total")" -map "[v]" \
    -c:v libx264 -preset slower -crf 23 -maxrate 7M -bufsize 14M -profile:v high -pix_fmt yuv420p -movflags +faststart -x264-params "aq-mode=3:aq-strength=1.1" "$OUT/$name.mp4"
  ffmpeg -v error -y -ss "$ss" -t "$t" -i "$SRC/$src" -an \
    -filter_complex "$(loopgraph "setpts=$slow*PTS,crop=ih*9/16:ih:(iw-ih*9/16)*$cx:0,scale=$pw:$ph:flags=lanczos,$GRADE,fps=24" "$total")" -map "[v]" \
    -c:v libx264 -preset slower -crf 23 -maxrate 5M -bufsize 10M -profile:v high -pix_fmt yuv420p -movflags +faststart "$OUT/$name-m.mp4"
  ffmpeg -v error -y -i "$OUT/$name.mp4" -frames:v 1 -c:v libwebp -quality 74 "$OUT/$name.webp"
  ffmpeg -v error -y -i "$OUT/$name-m.mp4" -frames:v 1 -c:v libwebp -quality 70 "$OUT/$name-m.webp"
  echo "$name $(($(wc -c <"$OUT/$name.mp4")/1024))KB phone $(($(wc -c <"$OUT/$name-m.mp4")/1024))KB $(ffprobe -v error -show_entries format=duration -of csv=p=0 "$OUT/$name.mp4")s"
}
enc run rungroup4k.mp4 4.2 5.4 1.25 0.52
enc dawn skyline4k.mp4 2 7 1.0 0.74
enc rain rainlight.mp4 1 8 1.0 0.5 720
enc shore waterfront4k.mp4 2.4 7 1.2 0.46
