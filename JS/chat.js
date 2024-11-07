const chatbotToggler = document.querySelector(".chatbot-toggler");
const closeBtn = document.querySelector(".close-btn");
const chatbox = document.querySelector(".chatbox");
const chatInput = document.querySelector(".chat-input textarea");
const sendChatBtn = document.querySelector(".chat-input span");

let userMessage = "System prompt: You are an advanced AI bot designed to assist during natural disasters. You provide guidance and support to those affected by disasters such as hurricanes, earthquakes, floods, and wildfires. You are calm, empathetic, and knowledgeable, ensuring users receive accurate and timely information. Use clear and concise language to ensure your guidance is easily understood. \n\n";
const inputInitHeight = chatInput.scrollHeight;

// Import and initialize GoogleGenerativeAI
import { GoogleGenerativeAI } from 'https://esm.run/@google/generative-ai' 
const API_KEY='AIzaSyCV7i9qhSFeNIej1dFNCckUsDq0c0HDLZ8'
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const createChatLi = (message, className) => {
    const chatLi = document.createElement("li");
    chatLi.classList.add("chat", `${className}`);
    let chatContent = className === "outgoing" ? `<p></p>` : `<span class="material-symbols-outlined">smart_toy</span><p></p>`;
    chatLi.innerHTML = chatContent;
    chatLi.querySelector("p").textContent = message;
    return chatLi;
}

// Function to generate response from Google Generative AI
const generateResponse = async (chatElement) => {
    try {
        // Send the user's message to the AI model
        const result = await model.generateContent(userMessage);
        const response = await result.response;
        const aiResponse = response.text();
        function formatBoldText(text) {
            return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        }
        
        function formatBulletPoints(text) {
            // Split the text by new lines
            const lines = text.split('\n');
        
            // Map through the lines and replace single '*' with <li>, retaining non-bullet text
            const formattedText = lines.map(line => {
                // Add <li> if the line starts with '* '
                if (line.startsWith('* ')) {
                    return `<li>${line.slice(2)}</li>`;
                }
                // Retain the line if it's not a bullet point
                return line;
            }).join('\n');
        
            // If there are bullet points, wrap them with <ul> tags
            if (formattedText.includes('<li>')) {
                return `<ul>${formattedText}</ul>`;
            }
        
            // If no bullet points are present, return the original text
            return formattedText;
        }
        
        const formattedResponse=formatBulletPoints(formatBoldText(aiResponse))
        
        chatElement.querySelector("p").innerHTML =formattedResponse;
        // Append the AI response to the userMessage for context
        userMessage += `Bot: ${aiResponse}\n\n`;
        console.log(userMessage);
        chatbox.scrollTo(0, chatbox.scrollHeight);
    } catch (error) {
        console.error("Error generating response:", error);
        chatElement.querySelector("p").innerHTML = "Sorry, something went wrong.";
    }
}

const handleChat = async () => {
    const userInput = chatInput.value.trim();
    if (!userInput) return;

    // Clear the input textarea and set its height to default
    chatInput.value = "";
    chatInput.style.height = `${inputInitHeight}px`;

    // Append the user's message to the chatbox
    chatbox.appendChild(createChatLi(userInput, "outgoing"));
    chatbox.scrollTo(0, chatbox.scrollHeight);

    // Append the user's message to the userMessage variable for context
    userMessage += `User: ${userInput}\n\n`;

    // Display "Thinking..." message while waiting for the response
    const incomingChatLi = createChatLi("Thinking...", "incoming");
    chatbox.appendChild(incomingChatLi);
    chatbox.scrollTo(0, chatbox.scrollHeight);

    // Generate and display the AI response
    await generateResponse(incomingChatLi);
}

chatInput.addEventListener("input", () => {
    chatInput.style.height = `${inputInitHeight}px`;
    chatInput.style.height = `${chatInput.scrollHeight}px`;
});

chatInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey && window.innerWidth > 800) {
        e.preventDefault();
        handleChat();
    }
});

sendChatBtn.addEventListener("click", handleChat);
closeBtn.addEventListener("click", () => document.body.classList.remove("show-chatbot"));
chatbotToggler.addEventListener("click", () => document.body.classList.toggle("show-chatbot"));