// Shared UI Components for StudentHub

// Render Trust Badge
function renderTrustBadge(trustScore) {
    if (!trustScore) return '';
    
    let badge;
    if (trustScore >= 80) {
        badge = { label: 'Trusted Senior', class: 'trusted' };
    } else if (trustScore >= 60) {
        badge = { label: 'Verified Student', class: 'verified' };
    } else if (trustScore >= 40) {
        badge = { label: 'Active Member', class: 'member' };
    } else {
        return '';
    }
    
    return `<span class="trust-badge-badge ${badge.class}"><i class="fas fa-shield-halved"></i> ${badge.label}</span>`;
}

// Notification System
let notificationInterval = null;

function initNotifications() {
    fetchNotifications();
    if (notificationInterval) clearInterval(notificationInterval);
    notificationInterval = setInterval(fetchNotifications, 30000);
}

async function fetchNotifications() {
    try {
        const res = await fetch('php/notifications.php');
        const data = await res.json();
        
        if (data.success) {
            updateNotificationBadge(data.unread_count);
            renderNotificationDropdown(data.notifications);
        }
    } catch (e) {
        console.error('Error fetching notifications:', e);
    }
}

function updateNotificationBadge(count) {
    const badge = document.getElementById('notification-badge');
    if (badge) {
        badge.textContent = count;
        badge.style.display = count > 0 ? 'flex' : 'none';
    }
}

function renderNotificationDropdown(notifications) {
    const dropdown = document.getElementById('notification-dropdown');
    if (!dropdown) return;
    
    if (!notifications || notifications.length === 0) {
        dropdown.innerHTML = '<div style="padding: 20px; text-align: center; color: var(--text-muted);">No notifications</div>';
        return;
    }
    
    dropdown.innerHTML = notifications.slice(0, 10).map(n => `
        <div class="notification-item ${n.is_read ? '' : 'unread'}" onclick="markNotificationRead(${n.id}, '${n.link || ''}')">
            <p>${n.message}</p>
            <span>${timeAgo(n.created_at)}</span>
        </div>
    `).join('');
    
    dropdown.innerHTML += `<div style="padding: 10px; text-align: center; border-top: 1px solid var(--border);">
        <a href="notifications.html" style="color: var(--primary); font-size: 0.85rem;">View all notifications</a>
    </div>`;
}

function toggleNotificationDropdown() {
    const dropdown = document.getElementById('notification-dropdown');
    if (dropdown) {
        dropdown.classList.toggle('active');
        if (dropdown.classList.contains('active')) {
            fetchNotifications();
        }
    }
}

async function markNotificationRead(id, link) {
    try {
        await fetch('php/notifications.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'mark_read', notification_id: id })
        });
        
        if (link) {
            window.location.href = link;
        } else {
            toggleNotificationDropdown();
            fetchNotifications();
        }
    } catch (e) {
        console.error('Error marking notification read:', e);
    }
}

function timeAgo(date) {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return minutes + 'm ago';
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return hours + 'h ago';
    const days = Math.floor(hours / 24);
    return days + 'd ago';
}

// Close dropdowns on outside click
document.addEventListener('click', (e) => {
    if (!e.target.closest('.notification-bell') && !e.target.closest('.notification-dropdown')) {
        const dropdown = document.getElementById('notification-dropdown');
        if (dropdown) dropdown.classList.remove('active');
    }
});

// Initialize on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNotifications);
} else {
    initNotifications();
}
