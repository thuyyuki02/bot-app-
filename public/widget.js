/**
 * Đệm Xanh AI Assistant - Official Website Embed Widget
 * https://demxanh.com
 *
 * Tính năng nổi bật:
 * - Tự động nhận diện URL và tên sản phẩm khách đang xem trên website demxanh.com
 * - Tự động theo dõi chuyển trang (hỗ trợ cả SPA / AJAX / popstate)
 * - Giao tiếp 2 chiều iframe an toàn (postMessage)
 * - Tự động chờ DOM sẵn sàng (onDomReady)
 * - Cách ly CSS với z-index: 2147483647 cao nhất
 */
(function () {
  if (window.__DEMXANH_AI_WIDGET_LOADED__) {
    console.log('[Đệm Xanh AI] Widget already loaded on this page.');
    return;
  }
  window.__DEMXANH_AI_WIDGET_LOADED__ = true;

  // 1. Locate current script element robustly (supports async, defer, GTM)
  var currentScript = document.currentScript;
  if (!currentScript) {
    var allScripts = document.getElementsByTagName('script');
    for (var i = allScripts.length - 1; i >= 0; i--) {
      var s = allScripts[i];
      if (
        s.src &&
        (s.src.indexOf('widget.js') !== -1 ||
          s.getAttribute('data-app-url') ||
          s.getAttribute('data-site-id'))
      ) {
        currentScript = s;
        break;
      }
    }
  }

  // 2. Determine App Origin (where the AI assistant backend/frontend is hosted)
  var appOrigin = '';
  if (window.__DEMXANH_AI_URL__) {
    appOrigin = window.__DEMXANH_AI_URL__;
  } else if (currentScript && currentScript.getAttribute('data-app-url')) {
    appOrigin = currentScript.getAttribute('data-app-url');
  } else if (currentScript && currentScript.src) {
    try {
      var urlObj = new URL(currentScript.src, window.location.href);
      // If script src is on another domain (e.g. vercel), use it
      if (urlObj.origin && urlObj.origin !== window.location.origin) {
        appOrigin = urlObj.origin;
      } else if (currentScript.src.indexOf('ai.demxanh.com') !== -1) {
        // Fallback for unconfigured subdomain
        appOrigin = 'https://bot-app-mauve.vercel.app';
      } else {
        appOrigin = urlObj.origin;
      }
    } catch (e) {
      appOrigin = 'https://bot-app-mauve.vercel.app';
    }
  } else {
    appOrigin = 'https://bot-app-mauve.vercel.app';
  }
  appOrigin = appOrigin.replace(/\/+$/, '');

  var siteId = (currentScript && currentScript.getAttribute('data-site-id')) || 'demxanh';
  var position = (currentScript && currentScript.getAttribute('data-position')) || 'right';
  var bottomOffset = (currentScript && currentScript.getAttribute('data-bottom')) || '20px';
  var sideOffset = (currentScript && currentScript.getAttribute('data-side')) || '20px';
  var botTitle = (currentScript && currentScript.getAttribute('data-title')) || 'Tư vấn chọn đệm chuẩn y khoa ✨';
  var autoOpen = currentScript && (currentScript.getAttribute('data-auto-open') === 'true' || currentScript.getAttribute('data-open') === 'true');

  // 3. Helper to extract rich page & product context from demxanh.com
  function getPageContext() {
    var url = window.location.href;
    var pathname = window.location.pathname;
    var title = document.title || 'Đệm Xanh';
    var productName = '';

    try {
      // Priority 1: OpenGraph title tag
      var ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle && ogTitle.content) {
        productName = ogTitle.content.split('-')[0].trim();
      }

      // Priority 2: Primary h1 heading on product details page
      if (!productName) {
        var h1 = document.querySelector('h1');
        if (h1 && h1.innerText) {
          productName = h1.innerText.trim();
        }
      }

      // Priority 3: Fallback from document title
      if (!productName && title) {
        productName = title.split('-')[0].trim();
      }

      // Extract price if available on demxanh.com
      var priceEl = document.querySelector('.price, .product-price, .special-price, .current-price, [itemprop="price"]');
      var price = priceEl ? priceEl.innerText.trim() : '';

      return {
        pageUrl: url,
        pathname: pathname,
        pageTitle: title,
        productName: productName || title,
        productPrice: price,
      };
    } catch (e) {
      return {
        pageUrl: url,
        pathname: pathname,
        pageTitle: title,
        productName: title,
      };
    }
  }

  console.log('[Đệm Xanh AI Assistant] Widget ready. Host:', appOrigin, 'Context:', getPageContext().productName);

  // 4. Helper to wait until document.body is available (avoids crashing if script in <head>)
  function onDomReady(fn) {
    if (document.body) {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
      window.addEventListener('load', fn);
    }
  }

  onDomReady(function initWidget() {
    // Avoid double injection
    if (document.getElementById('dx-widget-container')) return;

    // Inject Styles with high z-index and safe CSS resets
    var style = document.createElement('style');
    style.id = 'demxanh-ai-widget-styles';
    style.textContent = `
      #dx-widget-container {
        position: fixed !important;
        ${position === 'left' ? 'left: ' + sideOffset + ' !important;' : 'right: ' + sideOffset + ' !important;'}
        bottom: ${bottomOffset} !important;
        z-index: 2147483647 !important;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
        box-sizing: border-box !important;
        margin: 0 !important;
        padding: 0 !important;
        line-height: normal !important;
      }
      #dx-widget-container * {
        box-sizing: border-box !important;
      }
      #dx-widget-bubble {
        width: 60px !important;
        height: 60px !important;
        border-radius: 30px !important;
        background: linear-gradient(135deg, #059669 0%, #10b981 100%) !important;
        box-shadow: 0 8px 24px rgba(5, 150, 105, 0.45) !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        cursor: pointer !important;
        transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.25s ease !important;
        position: relative !important;
        user-select: none !important;
      }
      #dx-widget-bubble:hover {
        transform: scale(1.08) !important;
        box-shadow: 0 12px 30px rgba(5, 150, 105, 0.6) !important;
      }
      #dx-widget-bubble svg {
        width: 30px !important;
        height: 30px !important;
        fill: none !important;
        stroke: #ffffff !important;
        stroke-width: 2.2 !important;
        stroke-linecap: round !important;
        stroke-linejoin: round !important;
        display: block !important;
      }
      #dx-widget-badge {
        position: absolute !important;
        top: 2px !important;
        right: 2px !important;
        width: 14px !important;
        height: 14px !important;
        background: #34d399 !important;
        border: 2.5px solid #ffffff !important;
        border-radius: 50% !important;
      }
      #dx-widget-tooltip {
        position: absolute !important;
        bottom: 70px !important;
        ${position === 'left' ? 'left: 0 !important;' : 'right: 0 !important;'}
        background: #ffffff !important;
        color: #064e3b !important;
        padding: 8px 14px !important;
        border-radius: 16px !important;
        font-size: 12px !important;
        font-weight: 700 !important;
        white-space: nowrap !important;
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15) !important;
        border: 1px solid #d1fae5 !important;
        cursor: pointer !important;
        display: flex !important;
        align-items: center !important;
        gap: 6px !important;
        animation: dxBounce 2.5s infinite !important;
        user-select: none !important;
      }
      @keyframes dxBounce {
        0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
        40% { transform: translateY(-6px); }
        60% { transform: translateY(-3px); }
      }
      #dx-widget-frame-container {
        display: none;
        position: fixed !important;
        ${position === 'left' ? 'left: ' + sideOffset + ' !important;' : 'right: ' + sideOffset + ' !important;'}
        bottom: ${bottomOffset} !important;
        width: 420px !important;
        max-width: calc(100vw - 32px) !important;
        height: 640px !important;
        max-height: calc(100vh - 40px) !important;
        border-radius: 24px !important;
        overflow: hidden !important;
        box-shadow: 0 20px 48px rgba(0, 0, 0, 0.28) !important;
        z-index: 2147483647 !important;
        background: #ffffff !important;
        border: 1px solid rgba(226, 232, 240, 0.9) !important;
        transition: all 0.3s ease !important;
      }
      #dx-widget-iframe {
        width: 100% !important;
        height: 100% !important;
        border: none !important;
        display: block !important;
      }
      @media (max-width: 640px) {
        #dx-widget-frame-container {
          left: 0 !important;
          right: 0 !important;
          bottom: 0 !important;
          top: 0 !important;
          width: 100vw !important;
          max-width: 100vw !important;
          height: 100vh !important;
          max-height: 100vh !important;
          border-radius: 0 !important;
          border: none !important;
        }
      }
    `;
    document.head.appendChild(style);

    // Inject Bubble Container
    var container = document.createElement('div');
    container.id = 'dx-widget-container';
    container.innerHTML = `
      <div id="dx-widget-tooltip">
        <span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:#10b981;"></span>
        ${botTitle}
      </div>
      <div id="dx-widget-bubble" title="Chat với Trợ lý Đệm Xanh AI">
        <svg viewBox="0 0 24 24">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
        <div id="dx-widget-badge"></div>
      </div>
    `;
    document.body.appendChild(container);

    // Inject Frame Container
    var frameContainer = document.createElement('div');
    frameContainer.id = 'dx-widget-frame-container';

    var initialContext = getPageContext();

    var iframeUrl =
      appOrigin +
      '/?embed=true' +
      '&siteId=' +
      encodeURIComponent(siteId) +
      '&pageUrl=' +
      encodeURIComponent(initialContext.pageUrl) +
      '&title=' +
      encodeURIComponent(initialContext.pageTitle) +
      '&productName=' +
      encodeURIComponent(initialContext.productName || '');

    var iframe = document.createElement('iframe');
    iframe.id = 'dx-widget-iframe';
    iframe.src = iframeUrl;
    iframe.title = 'Trợ lý AI Đệm Xanh';
    iframe.allow = 'camera; microphone; geolocation';
    frameContainer.appendChild(iframe);
    document.body.appendChild(frameContainer);

    var isOpen = false;

    function sendCurrentPageContext() {
      try {
        var ctx = getPageContext();
        if (iframe && iframe.contentWindow) {
          iframe.contentWindow.postMessage(
            {
              type: 'DX_PAGE_VIEW',
              pageUrl: ctx.pageUrl,
              pathname: ctx.pathname,
              pageTitle: ctx.pageTitle,
              productName: ctx.productName,
              productPrice: ctx.productPrice,
            },
            '*'
          );
        }
      } catch (e) {}
    }

    function toggleWidget(open) {
      isOpen = typeof open === 'boolean' ? open : !isOpen;
      if (isOpen) {
        frameContainer.style.display = 'block';
        container.style.display = 'none';
        sendCurrentPageContext();
      } else {
        frameContainer.style.display = 'none';
        container.style.display = 'block';
      }
    }

    // Click listeners
    var bubble = document.getElementById('dx-widget-bubble');
    if (bubble) {
      bubble.addEventListener('click', function () {
        toggleWidget(true);
      });
    }
    var tooltip = document.getElementById('dx-widget-tooltip');
    if (tooltip) {
      tooltip.addEventListener('click', function () {
        toggleWidget(true);
      });
    }

    // Auto open if specified in data-auto-open attribute
    if (autoOpen) {
      setTimeout(function () {
        toggleWidget(true);
      }, 500);
    }

    // Auto notify iframe on SPA URL change (popstate, pushState, replaceState)
    function notifyPageUpdate() {
      setTimeout(function () {
        sendCurrentPageContext();
      }, 150);
    }

    window.addEventListener('popstate', notifyPageUpdate);
    window.addEventListener('hashchange', notifyPageUpdate);

    var origPush = history.pushState;
    if (origPush) {
      history.pushState = function () {
        var res = origPush.apply(this, arguments);
        notifyPageUpdate();
        return res;
      };
    }
    var origReplace = history.replaceState;
    if (origReplace) {
      history.replaceState = function () {
        var res = origReplace.apply(this, arguments);
        notifyPageUpdate();
        return res;
      };
    }

    // Listen to messages from iframe (e.g. close, minimize)
    window.addEventListener('message', function (event) {
      if (!event.data) return;
      if (event.data.type === 'DX_CLOSE_WIDGET') {
        toggleWidget(false);
      } else if (event.data.type === 'DX_OPEN_WIDGET') {
        toggleWidget(true);
      } else if (event.data.type === 'DX_RESIZE_WIDGET') {
        if (event.data.state === 'closed') {
          toggleWidget(false);
        }
      } else if (event.data.type === 'DX_REQUEST_PAGE_CONTEXT') {
        sendCurrentPageContext();
      }
    });

    // Expose API on window
    window.DemXanhAI = {
      open: function () {
        toggleWidget(true);
      },
      close: function () {
        toggleWidget(false);
      },
      toggle: function () {
        toggleWidget();
      },
      setPage: function (url, title, productName) {
        try {
          var ctx = getPageContext();
          if (url) ctx.pageUrl = url;
          if (title) ctx.pageTitle = title;
          if (productName) ctx.productName = productName;
          iframe.contentWindow.postMessage(
            {
              type: 'DX_PAGE_VIEW',
              pageUrl: ctx.pageUrl,
              pageTitle: ctx.pageTitle,
              productName: ctx.productName,
            },
            '*'
          );
        } catch (e) {}
      },
      origin: appOrigin,
    };
  });
})();
