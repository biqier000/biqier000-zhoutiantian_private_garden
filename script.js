// 初始化轮播图
const swiper = new Swiper('.swiper-container', {
    loop: true,
    autoplay: {
        delay: 4000,
        disableOnInteraction: false,
    },
    pagination: {
        el: '.swiper-pagination',
        clickable: true,
    },
    navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
    },
    effect: 'fade',
    fadeEffect: {
        crossFade: true
    },
    speed: 1000,
});

// 鼠标悬停时暂停自动播放
const swiperContainer = document.querySelector('.swiper-container');
swiperContainer.addEventListener('mouseenter', () => {
    swiper.autoplay.stop();
});
swiperContainer.addEventListener('mouseleave', () => {
    swiper.autoplay.start();
});

// AI 聊天功能
const chatMessages = document.getElementById('chatMessages');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');

// 添加加载动画的 HTML
function addLoadingMessage() {
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'message ai-message loading';
    loadingDiv.innerHTML = `
        <div class="message-content">
            <div class="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    `;
    chatMessages.appendChild(loadingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return loadingDiv;
}

// 添加消息到聊天界面
function addMessage(content, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'ai-message'}`;
    messageDiv.innerHTML = `
        <div class="message-content">${content}</div>
        <div class="message-time">${new Date().toLocaleTimeString()}</div>
    `;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// 调用 AI API
async function callAI(message) {
    try {
        const response = await fetch('https://api.chatanywhere.tech/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer sk-ZDZIfY4bx3kPxZesdHp9twb2nl1Q17LO3BvrTjvvyFQFFGT3'
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: "你是一个友好的AI助手。"
                    },
                    {
                        role: "user",
                        content: message
                    }
                ],
                temperature: 0.7,
                max_tokens: 2000,
                presence_penalty: 0,
                frequency_penalty: 0
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('API错误详情:', errorData);
            throw new Error(`API请求失败: ${response.status}`);
        }

        const data = await response.json();
        console.log('API响应:', data);

        if (data.choices && data.choices[0] && data.choices[0].message) {
            return data.choices[0].message.content;
        } else {
            throw new Error('响应格式不正确');
        }
    } catch (error) {
        console.error('API 调用错误:', error);
        return `抱歉，我现在无法回答。错误信息：${error.message}`;
    }
}

// 发送消息处理
async function handleSendMessage() {
    const message = messageInput.value.trim();
    if (!message) return;

    // 禁用输入和发送按钮
    messageInput.disabled = true;
    sendButton.disabled = true;

    // 显示用户消息
    addMessage(message, true);
    messageInput.value = '';

    // 显示加载动画
    const loadingMessage = addLoadingMessage();

    try {
        // 调用 AI API
        const response = await callAI(message);
        
        // 移除加载动画
        loadingMessage.remove();
        
        // 显示 AI 回复
        addMessage(response);
    } catch (error) {
        // 移除加载动画
        loadingMessage.remove();
        
        // 显示错误消息
        addMessage('抱歉，发生了一些错误。请稍后再试。');
    } finally {
        // 重新启用输入和发送按钮
        messageInput.disabled = false;
        sendButton.disabled = false;
        messageInput.focus();
    }
}

// 事件监听器
sendButton.addEventListener('click', handleSendMessage);

messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
    }
}); 