set -e
SDK=/usr/lib/android-sdk/platforms/android-23/android.jar
rm -rf gen obj out; mkdir -p gen obj out
aapt package -f -m -J gen -M AndroidManifest.xml -S res -I $SDK -F out/res.apk --min-sdk-version 21 --target-sdk-version 34
javac -nowarn -source 8 -target 8 -bootclasspath $SDK -classpath $SDK -d obj -sourcepath src:gen src/com/fasterfollow/app/*.java gen/com/fasterfollow/app/R.java
dalvik-exchange --dex --min-sdk-version=21 --output=out/classes.dex obj
cp out/res.apk out/unsigned.apk
(cd out && aapt add unsigned.apk classes.dex >/dev/null)
zipalign -f -p 4 out/unsigned.apk out/aligned.apk
# keystore is kept privately (not in this repo)
apksigner sign --ks ff-release.keystore --ks-key-alias fasterfollow --ks-pass env:KSPASS --key-pass env:KSPASS --v1-signing-enabled true --v2-signing-enabled true --v3-signing-enabled true --out out/fasterfollow.apk out/aligned.apk
apksigner verify --verbose out/fasterfollow.apk | head -6
ls -la out/fasterfollow.apk
