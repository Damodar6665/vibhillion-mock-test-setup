Add-Type -AssemblyName System.Drawing

$srcPath = "C:\Users\hp\.gemini\antigravity\brain\be06183e-c69a-490a-8870-2989599603b6\.user_uploaded\media_1793359769851_789b9d17.jpg"
$img = [System.Drawing.Bitmap]::FromFile($srcPath)

# In 460 x 1024:
# Let's find exactly where the emblem circles are:
# Card row 1 is around y=380 to 470
# UPSC emblem is on the left: x around 30 to 75, y around 390 to 450
# SSC emblem is on the right: x around 250 to 295, y around 390 to 450
# Card row 2 is around y=485 to 575
# APPSC emblem is on the left: x around 30 to 75, y around 495 to 555
# RRB emblem is on the right: x around 250 to 295, y around 495 to 555

$destDir = "E:\vibhillion mock test setup\apps\student\assets\images\emblems"

function Crop-Exact($source, $x, $y, $size, $destFile) {
    $rect = New-Object System.Drawing.Rectangle($x, $y, $size, $size)
    $bmp = New-Object System.Drawing.Bitmap($size, $size)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.DrawImage($source, 0, 0, $rect, [System.Drawing.GraphicsUnit]::Pixel)
    $bmp.Save($destFile, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
    Write-Host "Saved $destFile"
}

# UPSC
Crop-Exact $img 33 394 48 "$destDir\upsc.png"

# SSC
Crop-Exact $img 250 394 48 "$destDir\ssc.png"

# APPSC
Crop-Exact $img 33 496 48 "$destDir\appsc.png"

# RRB
Crop-Exact $img 250 496 48 "$destDir\rrb.png"

$img.Dispose()

# Also crop paper icon from media_1793359825183_9b821876.jpg
$src3 = "C:\Users\hp\.gemini\antigravity\brain\be06183e-c69a-490a-8870-2989599603b6\.user_uploaded\media_1793359825183_9b821876.jpg"
if (Test-Path $src3) {
    $img3 = [System.Drawing.Bitmap]::FromFile($src3)
    # Paper icon is around x=38, y=492, size=40
    Crop-Exact $img3 38 492 42 "$destDir\paper_icon.png"
    $img3.Dispose()
}

# Also crop the big hero icon from media_1793359837976_2a1175ef.jpg
$src4 = "C:\Users\hp\.gemini\antigravity\brain\be06183e-c69a-490a-8870-2989599603b6\.user_uploaded\media_1793359837976_2a1175ef.jpg"
if (Test-Path $src4) {
    $img4 = [System.Drawing.Bitmap]::FromFile($src4)
    # Hero icon is in center around x=202, y=125, size=56
    Crop-Exact $img4 202 125 56 "$destDir\hero_doc_icon.png"
    $img4.Dispose()
}

Write-Host "Precision crop completed."
