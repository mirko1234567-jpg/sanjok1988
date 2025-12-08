// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'startUnfollow') {
    autoUnfollow()
      .then((result) => {
        // result: { success, count, message }
        if (result && result.success) {
          sendResponse({ success: true, message: result.message, count: result.count });
        } else {
          sendResponse({ success: false, error: result?.message || 'Unknown' });
        }
      })
      .catch((error) => {
        sendResponse({ success: false, error: error.message });
      });
    return true; // Keep the channel open for async response
  }
});

async function autoUnfollow() {
  // Build a list of candidate selectors (covers various TikTok DOM variations)
  const selectors = [
    'button[data-e2e*="follow"]',
    '[data-e2e*="follow"]',
    'button[aria-label*="Follow"]',
    'button[aria-label*="Following"]',
    'button',
    '[role="button"]'
  ];

  const seen = new Set();
  const candidates = [];

  selectors.forEach(sel => {
    try {
      document.querySelectorAll(sel).forEach(el => {
        if (!seen.has(el) && el instanceof Element) {
          seen.add(el);
          candidates.push(el);
        }
      });
    } catch (e) {
      // ignore malformed selectors
    }
  });

  // Helper: is element visible
  function isVisible(el) {
    const rect = el.getBoundingClientRect();
    return !!(rect.width || rect.height) && window.getComputedStyle(el).visibility !== 'hidden' && el.offsetParent !== null;
  }

  // Filter candidates by text that indicates 'Following' / 'Unfollow' (case-insensitive)
  const buttons = candidates.filter(el => {
    try {
      if (!isVisible(el)) return false;
      const text = (el.innerText || el.textContent || '').trim().toLowerCase();
      return /(^|\s)(following|unfollow|following\b)/i.test(text) || text.includes('following') || text.includes('unfollow');
    } catch (e) {
      return false;
    }
  });

  console.log('Candidate elements found:', candidates.length, 'Filtered unfollow buttons:', buttons.length);

  if (buttons.length === 0) {
    return { success: false, count: 0, message: 'No following/unfollow buttons found on this page.' };
  }

  let i = 0;

  return new Promise((resolve) => {
    function clickNext() {
      if (i >= buttons.length) {
        console.log('Finished unfollowing all available users.');
        // Notify popup that we're done
        try { chrome.runtime.sendMessage({ action: 'done', count: buttons.length }); } catch (e) {}

        resolve({ success: true, count: buttons.length, message: 'Unfollowing complete.' });
        return;
      }

      const btn = buttons[i];
      const text = (btn.innerText || btn.textContent || '').trim();
      console.log('Unfollowing:', text);

      // Try clicking in a safe way
      try {
        btn.click();
      } catch (e) {
        // fallback: dispatch mouse events
        btn.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
        btn.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
        btn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      }

      i++;

      // Send progress update to popup (number unfollowed so far)
      try { chrome.runtime.sendMessage({ action: 'progress', count: i }); } catch (e) {}

      // Delay 2 seconds between clicks
      setTimeout(clickNext, 2000);
    }

    clickNext();
  });
}
