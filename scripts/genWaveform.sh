#!/bin/bash

usage() { echo "Usage: genWaveform.sh -i input.mp3 -l desiredWaveformLength" 1>&2; exit 1; }

while getopts ":hi:l:" option; do
	case "${option}" in
		i)
			input=${OPTARG}
			;;
		l)
			length=${OPTARG}
			;;
		h | *)
			usage
			;;
	esac
done
shift $((OPTIND -1))

if [ -z "${input}" ] || [ -z "${length}" ]; then
	usage
fi

params=$(mp3info -F -p "%Q %S" "${input}")
params=($params)

sampleRate="${params[0]}"
duration="${params[1]}"

echo $sampleRate
echo $duration
samplesPerPixel=$(echo "${sampleRate}*${duration}/${length}" | bc)
echo $samplesPerPixel

filename="${input%.*}"
echo $filename

audiowaveform -i "${input}" -o "waveforms/${filename}.dat" -z "${samplesPerPixel}" -b 8
