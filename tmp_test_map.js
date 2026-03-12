const rows = [{"message_id":1,"sender_id":699,"sender_role":"center","receiver_id":25,"receiver_role":"user","request_id":97,"message":"hi","is_read":0,"created_at":"2026-03-12T04:21:31.000Z","senderUserName":null,"senderCenterName":"HKS Kanjirapally","senderName":"HKS Kanjirapally"}];

const loggedInUserId = '25';
const centerName = 'HKS Kanjirapally';
const loggedInUserName = 'Eban';

try {
    const html = rows.map((m, index) => {
        const senderId = m.sender_id || m.senderId;
        const mRole = String(m.sender_role || m.senderRole || '').toLowerCase();
        const isMe = String(senderId) === String(loggedInUserId) && mRole === 'user';

        const align = isMe ? 'flex-end' : 'flex-start';
        const bg = isMe ? 'linear-gradient(135deg, #3b82f6, #2563eb)' : 'rgba(30, 41, 59, 0.8)';
        const color = '#f8fafc';
        const radius = isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px';
        
        // Use loggedInUserName = 'Eban' instead of localStorage.getItem...
        const senderName = isMe ? loggedInUserName : (m.senderName || centerName);
        
        const initial = senderName.charAt(0).toUpperCase();
        const avatarBg = isMe ? '#1d4ed8' : '#475569';
        const avatarBorder = isMe ? 'rgba(59,130,246,0.5)' : 'rgba(255,255,255,0.1)';
        
        const time = m.created_at ? new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
        const animDelay = (index === rows.length - 1) ? 'animation: slideUpFade 0.3s ease-out forwards;' : 'animation: none; opacity: 1;';

        return `
            <div class="chat-bubble-wrapper" style="align-self: ${align}; max-width: 85%; display: flex; flex-direction: ${isMe ? 'row-reverse' : 'row'}; align-items: flex-end; gap: 8px; margin-bottom: 16px; ${animDelay}">
                 <div style="flex-shrink:0; width: 28px; height: 28px; border-radius: 50%; background: ${avatarBg}; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 600; color: white; border: 2px solid ${avatarBorder}; margin-bottom: 2px;">
                    ${initial}
                 </div>
                 <div style="display: flex; flex-direction: column; align-items: ${align}; max-width: calc(100% - 36px);">
                    <span style="font-size: 0.7rem; color: #94a3b8; margin-bottom: 4px; padding: 0 4px; font-weight: 500;">${senderName}</span>
                    <div style="background: ${bg}; color: ${color}; padding: 12px 16px; border-radius: ${radius}; font-size: 0.95rem; line-height: 1.5; box-shadow: 0 4px 15px rgba(0,0,0,0.1); word-break: break-word; white-space: pre-wrap;">${m.message || m.messageText}</div>
                    <span style="font-size: 0.65rem; color: #64748b; margin-top: 6px; padding: 0 4px; font-weight: 500;">${time}</span>
                </div>
            </div>
        `;
    }).join('');
    console.log("SUCCESS!");
} catch (e) {
    console.log("ERROR!", e.message);
}
