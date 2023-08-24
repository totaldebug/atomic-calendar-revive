#!/bin/bash
set -ex

# Convenience workspace directory for later use
WORKSPACE_DIR=$(pwd)

# Now install all dependencies
yarn install

# Install documentation dependencies
pip3 install -r docs/requirements.txt
pip3 install sphinx-autobuild

echo "Done!"
