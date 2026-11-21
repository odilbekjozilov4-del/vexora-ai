
const STORAGE_KEY = "vexoraChats";
let activeChatId = null;

const translations = {
    uz: {
        description: "Sizning aqlli dunyongiz shu yerdan boshlanadi.",
        placeholder: "VEXORA’dan istalgan narsani so‘rang...",
        newChat: "＋ Yangi suhbat",
        greeting: "Salom! Men VEXORA AI. Sizga qanday yordam bera olaman?",
        empty: "Hozircha suhbatlar yo‘q",
        delete: "Suhbatni o‘chirmoqchimisiz?",
        confirm: "O‘chirish",
        search: "🔍 Suhbatlardan qidirish..."
    },
    en: {
        description: "Your intelligent world starts here.",
        placeholder: "Ask VEXORA anything...",
        newChat: "＋ New Chat",
        greeting: "Hello! I am VEXORA AI. How can I help you?",
        empty: "No conversations yet",
        delete: "Do you want to delete this conversation?",
        confirm: "Delete",
        search: "🔍 Search conversations..."
    },
    ru: {
        description: "Ваш интеллектуальный мир начинается здесь.",
        placeholder: "Спросите VEXORA о чём угодно...",
        newChat: "＋ Новый чат",
        greeting: "Здравствуйте! Я VEXORA AI. Чем могу вам помочь?",
        empty: "Пока нет разговоров",
        delete: "Удалить этот разговор?",
        confirm: "Удалить",
        search: "🔍 Поиск разговоров..."
    }
};


// TILNI ANIQLASH
function getLanguage() {
    return localStorage.getItem("vexoraLanguage") || "uz";
}

function getGreeting() {
    return translations[getLanguage()].greeting;
}


// SUHBATLARNI SAQLASH
function getChats() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
        return [];
    }
}

function saveChats(chats) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
}


// OVOZ TUGMALARINI MATNDAN AJRATISH
function getCleanMessage(element) {
    const clone = element.cloneNode(true);

    const controls = clone.querySelector(".voice-controls");
    if (controls) controls.remove();

    return clone.textContent.trim();
}


// SUHBATNI SAQLASH
function saveChat() {
    const chat = document.getElementById("chat");
    const chats = getChats();

    const messages = Array.from(chat.children).map(item => ({
        className: item.className,
        text: getCleanMessage(item)
    }));

    let current = chats.find(item => item.id === activeChatId);

    if (!current) {
        current = {
            id: activeChatId,
            title: "Yangi suhbat",
            messages: []
        };

        chats.push(current);
    }

    current.messages = messages;

    const firstUserMessage = messages.find(
        item => item.className === "user-message"
    );

    if (firstUserMessage) {
        current.title = firstUserMessage.text.slice(0, 30);
    }

    current.updatedAt = Date.now();

    saveChats(chats);
    renderHistory();
}


// SUHBATLAR TARIXI
function renderHistory() {
    const history = document.getElementById("chatHistory");
    const searchInput = document.getElementById("historySearch");

    if (!history) return;

    const chats = getChats();

    const searchText = searchInput
        ? searchInput.value.trim().toLowerCase()
        : "";

    history.innerHTML = "";

    const filteredChats = chats
        .sort((a, b) => b.updatedAt - a.updatedAt)
        .filter(item => {
            const title = (item.title || "").toLowerCase();

            const messages = (item.messages || [])
                .map(message => message.text)
                .join(" ")
                .toLowerCase();

            return title.includes(searchText) ||
                   messages.includes(searchText);
        });

    if (filteredChats.length === 0) {
        const empty = document.createElement("p");

        empty.className = "empty-history";

        empty.textContent = searchText
            ? "Mos suhbat topilmadi"
            : translations[getLanguage()].empty;

        history.appendChild(empty);
        return;
    }

    filteredChats.forEach(item => {
        const wrapper = document.createElement("div");
        wrapper.className = "history-row";

        const openButton = document.createElement("button");
        openButton.className = "history-item";
        openButton.textContent = "💬 " + item.title;
        openButton.onclick = () => openChat(item.id);

        if (item.id === activeChatId) {
            openButton.classList.add("active");
        }

        const deleteButton = document.createElement("button");
        deleteButton.className = "delete-chat";
        deleteButton.textContent = "🗑️";
        deleteButton.title = translations[getLanguage()].confirm;
        deleteButton.onclick = () => deleteChat(item.id);

        wrapper.appendChild(openButton);
        wrapper.appendChild(deleteButton);

        history.appendChild(wrapper);
    });
}


// ESKI SUHBATNI OCHISH
function openChat(id) {
    const chats = getChats();
    const selected = chats.find(item => item.id === id);

    if (!selected) return;

    activeChatId = id;

    const chat = document.getElementById("chat");
    chat.innerHTML = "";

    selected.messages.forEach(item => {
        const message = document.createElement("div");

        message.className = item.className;
        message.textContent = item.text;

        chat.appendChild(message);

        if (item.className === "ai-message") {
            addSpeakButton(message);
        }
    });

    renderHistory();
}


// SUHBATNI O‘CHIRISH
function deleteChat(id) {
    const words = translations[getLanguage()];

    if (!confirm(words.delete)) return;

    let chats = getChats();

    chats = chats.filter(item => item.id !== id);

    saveChats(chats);

    if (activeChatId === id) {
        activeChatId = null;

        if (chats.length > 0) {
            chats.sort((a, b) => b.updatedAt - a.updatedAt);
            openChat(chats[0].id);
        } else {
            newChat();
            return;
        }
    }

    renderHistory();
}


// YANGI SUHBAT
function newChat() {
    speechSynthesis.cancel();

    activeChatId = String(Date.now());

    const chat = document.getElementById("chat");
    chat.innerHTML = "";

    const greeting = document.createElement("div");

    greeting.className = "ai-message";
    greeting.textContent = getGreeting();

    chat.appendChild(greeting);

    addSpeakButton(greeting);

    saveChat();
    renderHistory();
}


// XABAR YUBORISH
function sendMessage() {
    const input = document.getElementById("userInput");
    const message = input.value.trim();

    if (!message) {
        alert("Iltimos, savolingizni yozing!");
        return;
    }

    speechSynthesis.cancel();

    const chat = document.getElementById("chat");

    const userMessage = document.createElement("div");
    userMessage.className = "user-message";
    userMessage.textContent = message;

    chat.appendChild(userMessage);

    const typing = document.createElement("div");

    typing.className = "typing-message";
    typing.innerHTML = "<span></span><span></span><span></span>";

    chat.appendChild(typing);

    input.value = "";

    setTimeout(function() {
        typing.remove();

        let answer;

        if (message.toLowerCase().includes("salom")) {
            answer = "Salom! VEXORA AI xizmatida. Sizga qanday yordam beray?";
        } else {
            answer = "Savolingizni qabul qildim! Men hali o‘rganish bosqichidaman.";
        }

        const aiMessage = document.createElement("div");

        aiMessage.className = "ai-message";
        aiMessage.textContent = "";

        chat.appendChild(aiMessage);

        let index = 0;

        const typingEffect = setInterval(function() {
            aiMessage.textContent += answer.charAt(index);

            index++;

            if (index >= answer.length) {
                clearInterval(typingEffect);

                addSpeakButton(aiMessage);
                saveChat();
            }
        }, 30);

    }, 1000);
}


// OVOZ BOSHQARUV TUGMALARI
function addSpeakButton(messageElement) {
    if (messageElement.querySelector(".voice-controls")) return;

    const controls = document.createElement("div");
    controls.className = "voice-controls";

    const playButton = document.createElement("button");
    playButton.type = "button";
    playButton.textContent = "▶️";
    playButton.title = "Ovoz chiqarib o‘qish";

    const pauseButton = document.createElement("button");
    pauseButton.type = "button";
    pauseButton.textContent = "⏸️";
    pauseButton.title = "Pauza / davom ettirish";

    const stopButton = document.createElement("button");
    stopButton.type = "button";
    stopButton.textContent = "⏹️";
    stopButton.title = "Ovozni to‘xtatish";

    // OVOZNI BOSHLASH
    playButton.onclick = function() {
        const text = getCleanMessage(messageElement);
        speakText(text);
    };

    // PAUZA VA DAVOM ETTIRISH
    pauseButton.onclick = function() {
        if (speechSynthesis.speaking) {
            if (speechSynthesis.paused) {
                speechSynthesis.resume();
                pauseButton.textContent = "⏸️";
            } else {
                speechSynthesis.pause();
                pauseButton.textContent = "▶️";
            }
        }
    };

    // OVOZNI BUTUNLAY TO‘XTATISH
    stopButton.onclick = function() {
        speechSynthesis.cancel();
        pauseButton.textContent = "⏸️";
    };

    controls.appendChild(playButton);
    controls.appendChild(pauseButton);
    controls.appendChild(stopButton);

    messageElement.appendChild(controls);
}


// MATNNI OVOZGA AYLANTIRISH
function speakText(text) {
    if (!("speechSynthesis" in window)) {
        alert("Brauzeringiz ovozli o‘qishni qo‘llab-quvvatlamaydi.");
        return;
    }

    speechSynthesis.cancel();

    const voice = new SpeechSynthesisUtterance(text);

    const language = getLanguage();

    voice.lang = {
        uz: "uz-UZ",
        en: "en-US",
        ru: "ru-RU"
    }[language] || "uz-UZ";

    voice.rate = 1;
    voice.pitch = 1;
    voice.volume = 1;

    speechSynthesis.speak(voice);
}


// OVOZLI XABAR KIRITISH
function startVoiceInput() {
    const micButton = document.getElementById("micButton");
    const input = document.getElementById("userInput");

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
        alert("Ovozli kiritish brauzeringizda qo‘llab-quvvatlanmaydi. Google Chrome'dan foydalaning.");
        return;
    }

    const recognition = new SpeechRecognition();

    const language = getLanguage();

    recognition.lang = {
        uz: "uz-UZ",
        en: "en-US",
        ru: "ru-RU"
    }[language] || "uz-UZ";

    recognition.continuous = false;
    recognition.interimResults = true;

    micButton.textContent = "🔴";
    micButton.disabled = true;

    recognition.onresult = function(event) {
        let transcript = "";

        for (let i = 0; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
        }

        input.value = transcript;
    };

    recognition.onend = function() {
        micButton.textContent = "🎙️";
        micButton.disabled = false;
    };

    recognition.onerror = function(event) {
        console.log("Mikrofon xatosi:", event.error);

        micButton.textContent = "🎙️";
        micButton.disabled = false;

        if (event.error === "not-allowed") {
            alert("Mikrofondan foydalanishga ruxsat bering!");
        } else {
            alert("Ovozni aniqlashda xatolik yuz berdi: " + event.error);
        }
    };

    try {
        recognition.start();
    } catch (error) {
        micButton.textContent = "🎙️";
        micButton.disabled = false;

        alert("Mikrofonni ishga tushirib bo‘lmadi.");
    }
}
