const status = document.getElementById('status');
const details = document.getElementById('details');
const unfollowBtn = document.getElementById('unfollowBtn');
const unfollowFollowingCheckbox = document.getElementById('unfollowFollowing');
const unfollowFriendCheckbox = document.getElementById('unfollowFriend');

// Listen for progress messages from the content script
chrome.runtime.onMessage.addListener((msg, sender) => {
  if (!msg || !msg.action) return;
  if (msg.action === 'progress') {
    // Check if it's a string message (like "Loading all followers...") or a count
    if (typeof msg.message === 'string') {
      status.textContent = msg.message;
    } else if (typeof msg.count === 'number') {
      // Display separate counts if available
      if (msg.followingCount !== undefined && msg.friendCount !== undefined) {
        status.textContent = `Following: ${msg.followingCount} | Friend: ${msg.friendCount}`;
      } else {
        status.textContent = `Unfollowed: ${msg.count}`;
      }
    }
    status.style.color = '#ff9800';
  } else if (msg.action === 'totalFound') {
    status.textContent = `Found: ${msg.count} followers`;
    status.style.color = '#2196F3';
    // Show filtered count details with separate counts
    if (msg.candidates) {
      let detailText = `Scanned: ${msg.candidates} buttons | Filtered: ${msg.count}`;
      if (msg.followingCount !== undefined && msg.friendCount !== undefined) {
        detailText += ` (Following: ${msg.followingCount} | Friend: ${msg.friendCount})`;
      }
      details.textContent = detailText;
    }
  } else if (msg.action === 'done') {
    // Display final counts separately
    if (msg.followingCount !== undefined && msg.friendCount !== undefined) {
      status.textContent = `Done — Following: ${msg.followingCount} | Friend: ${msg.friendCount}`;
    } else {
      status.textContent = `Done — unfollowed ${msg.count}`;
    }
    status.style.color = '#4CAF50';
    unfollowBtn.disabled = false;
    unfollowBtn.textContent = 'Start Auto Unfollow';
  }
});

unfollowBtn.addEventListener('click', () => {
  // Validate that at least one option is selected
  if (!unfollowFollowingCheckbox.checked && !unfollowFriendCheckbox.checked) {
    status.textContent = 'Please select at least one option';
    status.style.color = '#f44336';
    return;
  }

  status.textContent = 'Unfollowed: 0';
  status.style.color = '#25f4ee';
  details.textContent = '';
  unfollowBtn.disabled = true;
  unfollowBtn.textContent = 'Unfollowing...';

  // Send message to content script to start the process with options
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]?.url?.includes('tiktok.com')) {
      chrome.tabs.sendMessage(
        tabs[0].id,
        {
          action: 'startUnfollow',
          unfollowFollowing: unfollowFollowingCheckbox.checked,
          unfollowFriend: unfollowFriendCheckbox.checked
        },
        (response) => {
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
        }
      );
    } else {
      status.textContent = 'Please open TikTok first';
      status.style.color = '#f44336';
      unfollowBtn.disabled = false;
      unfollowBtn.textContent = 'Start Auto Unfollow';
    }
  });
});