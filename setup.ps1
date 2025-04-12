# Create the directory structure and files
New-Item -ItemType Directory -Path "static/css" -Force
New-Item -ItemType Directory -Path "static/js" -Force
New-Item -ItemType Directory -Path "templates" -Force
New-Item -ItemType Directory -Path "modules/flashcard" -Force

# Create empty files
New-Item -Path "static/css/style.css" -ItemType File -Force
New-Item -Path "static/js/script.js" -ItemType File -Force
New-Item -Path "templates/base.html" -ItemType File -Force
New-Item -Path "templates/home.html" -ItemType File -Force
New-Item -Path "modules/flashcard/flashcard.py" -ItemType File -Force
New-Item -Path "modules/flashcard/flashcard.js" -ItemType File -Force
New-Item -Path "app.py" -ItemType File -Force
New-Item -Path "requirements.txt" -ItemType File -Force
New-Item -Path "README.md" -ItemType File -Force

# Output the created structure
Write-Output "Directory structure created:"
Get-ChildItem -Recurse | ForEach-Object {
    $indent = ' ' * 4 * ($_.FullName.Split('\').Count - 1)
    if ($_.PSIsContainer) {
        Write-Output "$indent├── $($_.Name)/"
    } else {
        Write-Output "$indent├── $($_.Name)"
    }
}