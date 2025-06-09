#!/bin/bash
cd /home/kavia/workspace/code-generation/petmemoryvault-36436-276c48ef/petmemoryvault
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

