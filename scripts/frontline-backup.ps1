param(
  [string]$SiteUrl = "https://garythomaswhitehead.com",
  [string]$DestinationRoot = "",
  [string]$TokenFile = ""
)

$ErrorActionPreference = "Stop"
$projectRoot = Split-Path -Parent $PSScriptRoot
$workspaceRoot = Split-Path -Parent $projectRoot
if (-not $DestinationRoot) { $DestinationRoot = Join-Path $workspaceRoot "Backups\Frontline Tracker" }
if (-not $TokenFile) { $TokenFile = Join-Path $env:LOCALAPPDATA "Frontline Backup\backup-token" }
if (-not (Test-Path -LiteralPath $TokenFile)) { throw "Backup token file is missing: $TokenFile" }

$token = (Get-Content -LiteralPath $TokenFile -Raw).Trim()
if (-not $token) { throw "Backup token file is empty." }
$headers = @{ Authorization = "Bearer $token" }
$stamp = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH-mm-ss-fffZ")
$runFolder = Join-Path $DestinationRoot $stamp
$databaseFolder = Join-Path $runFolder "database"
$storageFolder = Join-Path $runFolder "storage"
New-Item -ItemType Directory -Path $databaseFolder -Force | Out-Null
New-Item -ItemType Directory -Path $storageFolder -Force | Out-Null

$dbCount = 0
$storageCount = 0
$storageBytes = [int64]0
$page = 0

try {
  for ($offset = 0; ; $offset += 500) {
    $uri = "$SiteUrl/api/backup-export?kind=database&offset=$offset&limit=500"
    $result = Invoke-RestMethod -Uri $uri -Headers $headers -Method Get
    $rows = @($result.rows)
    if ($rows.Count -eq 0) { break }
    $page += 1
    $rows | ConvertTo-Json -Depth 100 | Set-Content -LiteralPath (Join-Path $databaseFolder ("page-{0:D5}.json" -f $page)) -Encoding utf8
    $dbCount += $rows.Count
    if ($rows.Count -lt 500) { break }
  }
  if ($dbCount -eq 0) { throw "Database export returned zero records." }

  $bucketResult = Invoke-RestMethod -Uri "$SiteUrl/api/backup-export?kind=buckets" -Headers $headers -Method Get
  foreach ($bucket in @($bucketResult.buckets)) {
    $bucketName = [string]$bucket.name
    if (-not $bucketName) { $bucketName = [string]$bucket.id }
    if (-not $bucketName) { continue }
    $queue = [System.Collections.Generic.Queue[string]]::new()
    $queue.Enqueue("")
    while ($queue.Count -gt 0) {
      $prefix = $queue.Dequeue()
      for ($offset = 0; ; $offset += 500) {
        $encodedBucket = [uri]::EscapeDataString($bucketName)
        $encodedPrefix = [uri]::EscapeDataString($prefix)
        $listing = Invoke-RestMethod -Uri "$SiteUrl/api/backup-export?kind=objects&bucket=$encodedBucket&prefix=$encodedPrefix&offset=$offset&limit=500" -Headers $headers -Method Get
        $objects = @($listing.objects)
        foreach ($object in $objects) {
          $name = [string]$object.name
          if (-not $name) { continue }
          $objectPath = if ($prefix) { "$prefix/$name" } else { $name }
          if ($null -eq $object.metadata) {
            $queue.Enqueue($objectPath)
            continue
          }
          $localPath = Join-Path (Join-Path $storageFolder $bucketName) ($objectPath -replace "/", "\")
          $localParent = Split-Path -Parent $localPath
          New-Item -ItemType Directory -Path $localParent -Force | Out-Null
          $encodedPath = [uri]::EscapeDataString($objectPath)
          Invoke-WebRequest -Uri "$SiteUrl/api/backup-export?kind=object&bucket=$encodedBucket&path=$encodedPath" -Headers $headers -OutFile $localPath
          $file = Get-Item -LiteralPath $localPath
          $storageCount += 1
          $storageBytes += $file.Length
        }
        if ($objects.Count -lt 500) { break }
      }
    }
  }

  $summary = [ordered]@{
    status = "SUCCESS"
    dateUtc = (Get-Date).ToUniversalTime().ToString("o")
    databaseRecords = $dbCount
    storageFiles = $storageCount
    storageBytes = $storageBytes
    destination = $runFolder
  }
  $summary | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $runFolder "backup-summary.json") -Encoding utf8
  $summary | ConvertTo-Json -Compress
}
catch {
  $message = $_.Exception.Message
  $summary = [ordered]@{
    status = "FAILED"
    dateUtc = (Get-Date).ToUniversalTime().ToString("o")
    error = $message
    databaseRecords = $dbCount
    storageFiles = $storageCount
    storageBytes = $storageBytes
    destination = $runFolder
  }
  $summary | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $runFolder "backup-summary.json") -Encoding utf8
  Write-Error $message
  exit 1
}
