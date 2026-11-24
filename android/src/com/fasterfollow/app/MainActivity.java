package com.fasterfollow.app;

import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.Color;
import android.graphics.drawable.ColorDrawable;
import android.net.ConnectivityManager;
import android.net.NetworkInfo;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.webkit.CookieManager;
import android.webkit.DownloadListener;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Button;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.TextView;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.HashMap;
import java.util.Map;

public class MainActivity extends Activity {

    static final String HOME = "https://fasterfollow.com/?utm_source=android_app&utm_medium=app";
    static final int FILE_REQ = 7;

    WebView web;
    ProgressBar bar;
    View splash;
    LinearLayout offline;
    ValueCallback<Uri[]> fileCb;
    boolean splashGone = false;
    String failedUrl = null;

    /* Hosts that should open in their own app / browser instead of inside the store app */
    static final String[] EXTERNAL = {
        "wa.me", "whatsapp.com", "instagram.com", "tiktok.com", "snapchat.com", "t.me", "telegram.me",
        "twitter.com", "x.com", "youtube.com", "youtu.be", "facebook.com", "fb.com", "fb.me", "m.me",
        "play.google.com", "apps.apple.com", "linkedin.com", "threads.net", "maps.google.com", "goo.gl"
    };

    static boolean hostIs(String host, String d) {
        return host.equals(d) || host.endsWith("." + d);
    }

    @Override
    protected void onCreate(Bundle state) {
        super.onCreate(state);
        int bg = Color.rgb(11, 11, 12);
        int gold = Color.rgb(255, 171, 1);
        float dp = getResources().getDisplayMetrics().density;

        FrameLayout root = new FrameLayout(this);
        root.setBackgroundColor(bg);

        web = new WebView(this);
        web.setBackgroundColor(bg);
        root.addView(web, new FrameLayout.LayoutParams(-1, -1));

        bar = new ProgressBar(this, null, android.R.attr.progressBarStyleHorizontal);
        bar.setMax(100);
        bar.setIndeterminate(false);
        bar.setProgressTintList(android.content.res.ColorStateList.valueOf(gold));
        bar.setProgressBackgroundTintList(android.content.res.ColorStateList.valueOf(bg));
        FrameLayout.LayoutParams bl = new FrameLayout.LayoutParams(-1, (int) (3 * dp));
        bl.gravity = Gravity.TOP;
        root.addView(bar, bl);

        /* Offline screen */
        offline = new LinearLayout(this);
        offline.setOrientation(LinearLayout.VERTICAL);
        offline.setGravity(Gravity.CENTER);
        offline.setBackgroundColor(bg);
        offline.setPadding((int) (32 * dp), 0, (int) (32 * dp), 0);
        TextView t1 = new TextView(this);
        t1.setText("ما فيه اتصال بالإنترنت");
        t1.setTextColor(Color.WHITE);
        t1.setTextSize(20);
        t1.setGravity(Gravity.CENTER);
        TextView t2 = new TextView(this);
        t2.setText("تأكد من اتصالك وجرب مرة ثانية");
        t2.setTextColor(Color.rgb(201, 201, 207));
        t2.setTextSize(15);
        t2.setGravity(Gravity.CENTER);
        t2.setPadding(0, (int) (8 * dp), 0, (int) (20 * dp));
        Button retry = new Button(this);
        retry.setText("إعادة المحاولة");
        retry.setTextColor(bg);
        retry.setTextSize(16);
        retry.setAllCaps(false);
        retry.setBackgroundColor(gold);
        retry.setPadding((int) (28 * dp), 0, (int) (28 * dp), 0);
        retry.setOnClickListener(new View.OnClickListener() {
            public void onClick(View v) {
                offline.setVisibility(View.GONE);
                String u = failedUrl != null ? failedUrl : HOME;
                failedUrl = null;
                web.loadUrl(u);
            }
        });
        offline.addView(t1);
        offline.addView(t2);
        offline.addView(retry, new LinearLayout.LayoutParams(-2, (int) (48 * dp)));
        offline.setVisibility(View.GONE);
        root.addView(offline, new FrameLayout.LayoutParams(-1, -1));

        /* Splash overlay (same look as the launch window) until the first page paints */
        splash = new View(this);
        splash.setBackgroundResource(R.drawable.splash);
        root.addView(splash, new FrameLayout.LayoutParams(-1, -1));

        setContentView(root);

        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setLoadWithOverviewMode(true);
        s.setUseWideViewPort(true);
        s.setSupportZoom(false);
        s.setBuiltInZoomControls(false);
        s.setDisplayZoomControls(false);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setJavaScriptCanOpenWindowsAutomatically(true);
        s.setSupportMultipleWindows(false);
        s.setMixedContentMode(WebSettings.MIXED_CONTENT_COMPATIBILITY_MODE);
        s.setCacheMode(WebSettings.LOAD_DEFAULT);
        s.setUserAgentString(s.getUserAgentString() + " FasterFollowApp/1.1");

        CookieManager cm = CookieManager.getInstance();
        cm.setAcceptCookie(true);
        cm.setAcceptThirdPartyCookies(web, true);

        web.setWebViewClient(new Client());
        web.setWebChromeClient(new Chrome());
        web.setDownloadListener(new DownloadListener() {
            public void onDownloadStart(String url, String ua, String cd, String mime, long len) {
                openExternal(Uri.parse(url));
            }
        });

        if (state != null) {
            web.restoreState(state);
        }
        if (state == null || web.getUrl() == null) {
            web.loadUrl(startUrl(getIntent()));
        }
    }

    String startUrl(Intent i) {
        if (i != null && i.getData() != null) {
            Uri u = i.getData();
            if ("https".equals(u.getScheme()) && u.getHost() != null && hostIs(u.getHost(), "fasterfollow.com")) {
                return u.toString();
            }
        }
        return HOME;
    }

    @Override
    protected void onNewIntent(Intent i) {
        super.onNewIntent(i);
        if (i != null && i.getData() != null) {
            web.loadUrl(startUrl(i));
        }
    }

    void hideSplash() {
        if (splashGone) return;
        splashGone = true;
        getWindow().setBackgroundDrawable(new ColorDrawable(Color.rgb(11, 11, 12)));
        splash.animate().alpha(0f).setDuration(250).withEndAction(new Runnable() {
            public void run() {
                splash.setVisibility(View.GONE);
            }
        });
    }

    boolean online() {
        try {
            ConnectivityManager c = (ConnectivityManager) getSystemService(CONNECTIVITY_SERVICE);
            NetworkInfo n = c.getActiveNetworkInfo();
            return n != null && n.isConnected();
        } catch (Exception e) {
            return true;
        }
    }

    void openExternal(Uri u) {
        try {
            Intent i = new Intent(Intent.ACTION_VIEW, u);
            i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            startActivity(i);
        } catch (ActivityNotFoundException e) {
            /* nothing can handle it: ignore */
        }
    }

    /** true = handled outside the WebView */
    boolean route(Uri u) {
        String scheme = u.getScheme() == null ? "" : u.getScheme().toLowerCase();
        if (scheme.equals("http") || scheme.equals("https")) {
            String host = u.getHost() == null ? "" : u.getHost().toLowerCase();
            for (String d : EXTERNAL) {
                if (hostIs(host, d)) {
                    openExternal(u);
                    return true;
                }
            }
            return false;
        }
        if (scheme.equals("intent")) {
            try {
                Intent i = Intent.parseUri(u.toString(), Intent.URI_INTENT_SCHEME);
                i.addCategory(Intent.CATEGORY_BROWSABLE);
                i.setComponent(null);
                i.setSelector(null);
                startActivity(i);
            } catch (Exception e) {
                try {
                    Intent i = Intent.parseUri(u.toString(), Intent.URI_INTENT_SCHEME);
                    String fb = i.getStringExtra("browser_fallback_url");
                    if (fb != null) web.loadUrl(fb);
                } catch (Exception ignored) {
                }
            }
            return true;
        }
        if (scheme.equals("about") || scheme.equals("javascript") || scheme.equals("data") || scheme.equals("blob")) {
            return false;
        }
        /* tel:, mailto:, whatsapp:, sms:, market:, snapchat:, etc. */
        openExternal(u);
        return true;
    }

    /* The store shows "download the app" badges for website visitors; hide them inside the app */
    static final String APP_JS =
        "(function(){try{var d=document;if(d.getElementById('ffapk-css'))return;"
        + "d.documentElement.classList.add('ff-apk');"
        + "var s=d.createElement('style');s.id='ffapk-css';"
        + "s.textContent='#ffAppBadges,.ffpwa{display:none!important}';"
        + "(d.head||d.documentElement).appendChild(s);"
        + "try{localStorage.setItem('ffpwa_installed','1')}catch(e){}}catch(e){}})();";

    /* Runs before the store script: tells it this is the installed app (standalone), so the app design loads */
    static final String STANDALONE_JS =
        "(function(){try{if(window.__ffApk)return;window.__ffApk=1;var mm=window.matchMedia;"
        + "window.matchMedia=function(q){if(/display-mode[ ]*:[ ]*(standalone|fullscreen|minimal-ui)/.test(String(q))){"
        + "return{matches:/standalone/.test(String(q)),media:String(q),onchange:null,addListener:function(){},removeListener:function(){},"
        + "addEventListener:function(){},removeEventListener:function(){},dispatchEvent:function(){return false}}}"
        + "return mm.call(window,q)};}catch(e){}})();";

    static boolean isStoreMainJs(Uri u) {
        String path = u.getPath();
        if (path == null) return false;
        int i = path.lastIndexOf('/');
        String f = path.substring(i + 1);
        return f.startsWith("ff-main.v") && f.endsWith(".js");
    }

    WebResourceResponse patchedMainJs(WebResourceRequest r) {
        HttpURLConnection c = null;
        try {
            c = (HttpURLConnection) new URL(r.getUrl().toString()).openConnection();
            c.setConnectTimeout(15000);
            c.setReadTimeout(20000);
            String ua = r.getRequestHeaders() != null ? r.getRequestHeaders().get("User-Agent") : null;
            if (ua != null) c.setRequestProperty("User-Agent", ua);
            if (c.getResponseCode() != 200) return null;
            InputStream in = c.getInputStream();
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            out.write((STANDALONE_JS + "\n").getBytes("UTF-8"));
            byte[] b = new byte[16384];
            int n;
            while ((n = in.read(b)) > 0) out.write(b, 0, n);
            in.close();
            Map<String, String> h = new HashMap<String, String>();
            h.put("Access-Control-Allow-Origin", "*");
            h.put("Cache-Control", "public, max-age=3600");
            return new WebResourceResponse("application/javascript", "utf-8", 200, "OK", h,
                    new ByteArrayInputStream(out.toByteArray()));
        } catch (Exception e) {
            return null;
        } finally {
            if (c != null) c.disconnect();
        }
    }

    class Client extends WebViewClient {
        @Override
        public WebResourceResponse shouldInterceptRequest(WebView v, WebResourceRequest r) {
            try {
                if ("GET".equalsIgnoreCase(r.getMethod()) && isStoreMainJs(r.getUrl())) {
                    return patchedMainJs(r);
                }
            } catch (Exception ignored) {
            }
            return null;
        }

        /* API 24+ (no @Override: compiled against API 23) */
        public boolean shouldOverrideUrlLoading(WebView v, WebResourceRequest r) {
            return route(r.getUrl());
        }

        @SuppressWarnings("deprecation")
        @Override
        public boolean shouldOverrideUrlLoading(WebView v, String url) {
            return route(Uri.parse(url));
        }

        @Override
        public void onPageStarted(WebView v, String url, Bitmap fav) {
            bar.setVisibility(View.VISIBLE);
        }

        @Override
        public void onPageCommitVisible(WebView v, String url) {
            v.evaluateJavascript(APP_JS, null);
            hideSplash();
        }

        @Override
        public void onPageFinished(WebView v, String url) {
            v.evaluateJavascript(APP_JS, null);
            bar.setVisibility(View.GONE);
            hideSplash();
            CookieManager.getInstance().flush();
        }

        @Override
        public void onReceivedError(WebView v, WebResourceRequest r, WebResourceError e) {
            if (r.isForMainFrame()) {
                failedUrl = r.getUrl().toString();
                if (!online() || e.getErrorCode() == ERROR_HOST_LOOKUP || e.getErrorCode() == ERROR_CONNECT
                        || e.getErrorCode() == ERROR_TIMEOUT) {
                    offline.setVisibility(View.VISIBLE);
                    hideSplash();
                }
            }
        }
    }

    class Chrome extends WebChromeClient {
        @Override
        public void onProgressChanged(WebView v, int p) {
            bar.setProgress(p);
            if (p >= 100) bar.setVisibility(View.GONE);
            if (p >= 70) hideSplash();
        }

        @Override
        public boolean onShowFileChooser(WebView v, ValueCallback<Uri[]> cb, FileChooserParams p) {
            if (fileCb != null) fileCb.onReceiveValue(null);
            fileCb = cb;
            try {
                startActivityForResult(p.createIntent(), FILE_REQ);
            } catch (Exception e) {
                fileCb = null;
                return false;
            }
            return true;
        }
    }

    @Override
    protected void onActivityResult(int req, int res, Intent data) {
        if (req == FILE_REQ) {
            if (fileCb != null) {
                fileCb.onReceiveValue(WebChromeClient.FileChooserParams.parseResult(res, data));
                fileCb = null;
            }
            return;
        }
        super.onActivityResult(req, res, data);
    }

    @Override
    public void onBackPressed() {
        if (offline.getVisibility() == View.VISIBLE) {
            offline.setVisibility(View.GONE);
        }
        if (web.canGoBack()) {
            web.goBack();
        } else {
            moveTaskToBack(true);
        }
    }

    @Override
    protected void onSaveInstanceState(Bundle out) {
        super.onSaveInstanceState(out);
        web.saveState(out);
    }

    @Override
    protected void onPause() {
        super.onPause();
        CookieManager.getInstance().flush();
        web.onPause();
    }

    @Override
    protected void onResume() {
        super.onResume();
        web.onResume();
    }

    @Override
    protected void onDestroy() {
        if (web != null) {
            ((ViewGroup) web.getParent()).removeView(web);
            web.destroy();
        }
        super.onDestroy();
    }
}
