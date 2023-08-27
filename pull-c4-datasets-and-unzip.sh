#!/bin/bash

# Navigate to the target directory
cd "./datasets/c4"

# Maximum number of files to pull in one batch
batch_size=10

# The first file number to start from
start=0  # Replace this with your actual starting number

# The total number of files to download
total_files=100  # This is now the total number of files to pull, starting from 'start'

# The last file number to download
end_file=$((start + total_files - 1))

# Initialize counters for loop
current_start=$start
current_end=$((current_start + batch_size - 1))

# Loop through batches
while [ $current_start -le $end_file ]; do
  # Initialize an array to hold file names for this batch
  declare -a file_names=()

  # Loop through this batch and pull files
  for i in $(seq $current_start $current_end); do
    if [ $i -le $end_file ]; then
      # Format the number with leading zeros
      padded_i=$(printf "%05d" $i)
      
      # Construct the file name
      file_name="c4-train.$padded_i-of-01024.json.gz"

      # Run git lfs pull for the file
      git lfs pull --include "en/$file_name" &

      # Add this file name to the array for this batch
      file_names+=($file_name)
    fi
  done

  # Wait for all git lfs pull commands to finish
  wait

  # Loop through the array of file names and unzip them
  for file_name in "${file_names[@]}"; do
    # Wait for the file to be completely downloaded
    while [ ! -f "en/$file_name" ]; do
      echo "Waiting for $file_name to be downloaded..."
      sleep 10
    done

    # Unzip the file
    gunzip "en/$file_name"
    
    # Optionally, you could add some echo statements or logs to track the progress
    uncompressed_file_name="${file_name%.gz}"
    echo "Pulled and uncompressed $uncompressed_file_name"
  done

  # Update the counters for the next batch
  current_start=$((current_start + batch_size))
  current_end=$((current_end + batch_size))
done

# Navigate back to the original directory
cd -
