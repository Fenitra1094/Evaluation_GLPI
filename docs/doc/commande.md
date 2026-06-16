Get-ChildItem C:\Users\harim\OneDrive\Documents\GitHub\Evaluation-glpi-NewApp -Recurse -File -ErrorAction SilentlyContinue |
Where-Object {$_.LastWriteTime -gt (Get-Date).AddMinutes(-30)} |
Sort-Object LastWriteTime -Descending |
Format-Table LastWriteTime, FullName -AutoSize