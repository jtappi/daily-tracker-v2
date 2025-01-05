#!/bin/bash

# Define the source and backup file paths
SOURCE_FILE="sftp://9c7a9742-c49a-11ef-8187-00163eada87b@sftp.sd6.gpaas.net/lamp0/web/vhosts/default/src/data.json"
BACKUP_FILE="sftp://9c7a9742-c49a-11ef-8187-00163eada87b@sftp.sd6.gpaas.net/lamp0/web/vhosts/default/src/backup_data.json"

# Copy the data.json file to backup_data.json
cp "$SOURCE_FILE" "$BACKUP_FILE"

# Log the backup creation
echo "Backup created successfully: $BACKUP_FILE"