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

// Auto-scroll to load all followers
async function autoScrollToLoadAll(maxScrolls = 50, scrollDelay = 500) {
  // Find the scrollable container (TikTok's following list is usually in a modal or div)
  let scrollContainer = null;

  // Try common selectors for the scrollable container
  const containerSelectors = [
    '[role="dialog"]',           // Modal container
    '[role="listbox"]',          // Listbox
    '.tiktok-modal',             // TikTok modal
    '[class*="modal"]',          // Any element with "modal" in class
    '[class*="scroll"]',         // Any element with "scroll" in class
    'div[style*="overflow"]',    // Divs with overflow CSS
  ];

  // Try to find a container that has scrollHeight > clientHeight
  for (const selector of containerSelectors) {
    try {
      const elements = document.querySelectorAll(selector);
      for (const el of elements) {
        if (el.scrollHeight > el.clientHeight) {
          scrollContainer = el;
          break;
        }
      }
      if (scrollContainer) break;
    } catch (e) {
      // ignore invalid selectors
    }
  }

  // Fallback: if no container found, try scrolling the window
  if (!scrollContainer) {
    scrollContainer = window;
    console.log('No modal container found, using window scroll');
  } else {
    console.log('Found scrollable container:', scrollContainer.className || scrollContainer.tagName);
  }

  let scrollCount = 0;
  let lastHeight = scrollContainer === window ? document.documentElement.scrollHeight : scrollContainer.scrollHeight;

  return new Promise((resolve) => {
    const scrollInterval = setInterval(() => {
      if (scrollContainer === window) {
        // Scroll the window
        window.scrollTo(0, document.documentElement.scrollHeight);
      } else {
        // Scroll the container
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }

      scrollCount++;

      // Check if we've reached the end or max scrolls
      const newHeight = scrollContainer === window ? document.documentElement.scrollHeight : scrollContainer.scrollHeight;
      if (newHeight === lastHeight || scrollCount >= maxScrolls) {
        clearInterval(scrollInterval);
        console.log(`Finished scrolling after ${scrollCount} scrolls. Total height: ${newHeight}`);
        resolve();
        return;
      }

      lastHeight = newHeight;
    }, scrollDelay);
  });
}

async function autoUnfollow() {
  // First, send a message to the popup indicating we're scrolling
  try { chrome.runtime.sendMessage({ action: 'progress', message: 'Loading all followers...' }); } catch (e) {}

  // Auto-scroll to load all followers
  console.log('Starting auto-scroll to load all followers...');
  await autoScrollToLoadAll(50, 500);

  console.log('Scroll complete. Now scanning for unfollow buttons...');

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

  // Send a message showing total found before starting unfollows
  try { chrome.runtime.sendMessage({ action: 'totalFound', count: buttons.length, candidates: candidates.length }); } catch (e) {}

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
