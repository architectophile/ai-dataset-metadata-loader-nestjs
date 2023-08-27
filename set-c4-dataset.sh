#!/bin/bash

# Check if the directory "./datasets" exists
if [ ! -d "./datasets" ]; then
  # Create the directory if it does not exist
  mkdir "./datasets"
fi

# Navigate to the target directory
cd "./datasets"

# Run git clone
git clone https://huggingface.co/datasets/allenai/c4

# Navigate back to the original directory
cd -