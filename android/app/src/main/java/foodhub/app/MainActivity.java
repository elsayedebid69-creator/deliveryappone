package foodhub.app;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
    }

    @Override
    public void onStart() {
        super.onStart();
        try {
            String packageName = getPackageName();
            if (packageName != null && packageName.contains("captain")) {
                if (getBridge() != null && getBridge().getWebView() != null) {
                    getBridge().getWebView().post(() -> {
                        getBridge().getWebView().loadUrl("https://foodhub.delivery/captain");
                    });
                }
            } else if (packageName != null && packageName.contains("kitchen")) {
                if (getBridge() != null && getBridge().getWebView() != null) {
                    getBridge().getWebView().post(() -> {
                        getBridge().getWebView().loadUrl("https://foodhub.delivery/kitchen");
                    });
                }
            }
        } catch (Exception ignored) {
        }
    }
}
