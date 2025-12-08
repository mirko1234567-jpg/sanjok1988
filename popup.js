const status = document.getElementById('status');
const details = document.getElementById('details');
const unfollowBtn = document.getElementById('unfollowBtn');

// Listen for progress messages from the content script
chrome.runtime.onMessage.addListener((msg, sender) => {
  if (!msg || !msg.action) return;
  if (msg.action === 'progress') {
    // Check if it's a string message (like "Loading all followers...") or a count
    if (typeof msg.message === 'string') {
      status.textContent = msg.message;
    } else if (typeof msg.count === 'number') {
      status.textContent = `Unfollowed: ${msg.count}`;
    }
    status.style.color = '#ff9800';
  } else if (msg.action === 'totalFound') {
    status.textContent = `Found: ${msg.count} followers`;
    status.style.color = '#2196F3';
    // Show filtered count details
    if (msg.candidates) {
      details.textContent = `Scanned: ${msg.candidates} buttons | Filtered: ${msg.count}`;
    }
  } else if (msg.action === 'done') {
    status.textContent = `Done — unfollowed ${msg.count}`;
    status.style.color = '#4CAF50';
    unfollowBtn.disabled = false;
    unfollowBtn.textContent = 'Start Auto Unfollow';
  }
});

unfollowBtn.addEventListener('click', () => {
  status.textContent = 'Unfollowed: 0';
  status.style.color = '#25f4ee';
  unfollowBtn.disabled = true;
  unfollowBtn.textContent = 'Unfollowing...';

  // Send message to content script to start the process
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]?.url?.includes('tiktok.com')) {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'startUnfollow' }, (response) => {
        if (chrome.runtime.lastError) {
          status.textContent = 'Error: ' + chrome.runtime.lastError.message;
          status.style.color = '#f44336';
          unfollowBtn.disabled = false;
          unfollowBtn.textContent = 'Start Auto Unfollow';
          return;
        }

        if (response?.success) {
          // Final response (in case content script finished quickly)
          status.textContent = response.message + (response.count ? ` (${response.count})` : '');
          status.style.color = '#4CAF50';
        } else {
          status.textContent = 'Error: ' + (response?.error || 'Unknown');
          status.style.color = '#f44336';
          unfollowBtn.disabled = false;
          unfollowBtn.textContent = 'Start Auto Unfollow';
        }
      });
    } else {
      status.textContent = 'Please open TikTok first';
      status.style.color = '#f44336';
      unfollowBtn.disabled = false;
      unfollowBtn.textContent = 'Start Auto Unfollow';
    }
  });
});