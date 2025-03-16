document.addEventListener("DOMContentLoaded", function () {
    const form = document.querySelector("form");
    const nameField = document.getElementById("name");
    const emailField = document.getElementById("email");
    const messageField = document.getElementById("message");
    const errorOutput = document.getElementById("error-message");
    const formErrorsField = document.getElementById("form-errors");
    const maxMessageLength = 250;
    const themeToggle = document.getElementById("theme-toggle");
    const currentTheme = localStorage.getItem("theme");

    if (currentTheme === "dark") {
        document.body.classList.add("dark-mode");
        themeToggle.textContent = "🌙";
    }

    themeToggle.addEventListener("click", function () {
        document.body.classList.toggle("dark-mode");

        if (document.body.classList.contains("dark-mode")) {
            localStorage.setItem("theme", "dark");
            themeToggle.textContent = "🌙";
        } else {
            localStorage.setItem("theme", "light");
            themeToggle.textContent = "🌞";
        }
    });

    let form_errors = JSON.parse(formErrorsField.value);
    function flashField(field) {
        field.classList.add("flash");
        setTimeout(() => field.classList.remove("flash"), 300);
    }

    function displayErrors() {
        errorOutput.innerHTML = "";
        form_errors.forEach(err => {
            let errorItem = document.createElement("p");
            errorItem.textContent = `${err.field.toUpperCase()}: ${err.error}`;
            errorItem.style.color = "red";
            errorOutput.appendChild(errorItem);
        });
    }

    nameField.addEventListener("input", function () {
        if (!/^[a-zA-Z\s]*$/.test(nameField.value)) {
            flashField(nameField);
            nameField.value = nameField.value.replace(/[^a-zA-Z\s]/g, "");
            showTemporaryMessage("Only letters and spaces allowed!", errorOutput);
        }
    });

    emailField.addEventListener("input", function () {
        if (!emailField.checkValidity()) {
            flashField(emailField);
        }
    });

    const charCountDisplay = document.createElement("p");
    messageField.parentNode.insertBefore(charCountDisplay, messageField.nextSibling);

    messageField.addEventListener("input", function () {
        const remaining = maxMessageLength - messageField.value.length;
        charCountDisplay.textContent = `Characters remaining: ${remaining}`;
        charCountDisplay.style.color = remaining < 20 ? (remaining < 5 ? "red" : "orange") : "black";
    });



    form.addEventListener("submit", async function (event) {
        event.preventDefault();
    
        let newErrors = [];
    
        if (!nameField.value.trim()) {
            newErrors.push({ field: "name", error: "Name is required." });
            flashField(nameField);
        }
    
        if (!emailField.checkValidity()) {
            newErrors.push({ field: "email", error: "Invalid email format." });
            flashField(emailField);
        }
    
        if (messageField.value.trim().length < 10) {
            newErrors.push({ field: "message", error: "Message must be at least 10 characters." });
            flashField(messageField);
        }
    
        if (newErrors.length > 0) {
            form_errors = form_errors.concat(newErrors);
            formErrorsField.value = JSON.stringify(form_errors);
            displayErrors();
            return;
        }
        const formData = {
            name: nameField.value.trim(),
            email: emailField.value.trim(),
            message: messageField.value.trim(),
        };

        const binId = "https://api.jsonbin.io/v3/b/67d730888561e97a50ed40da";
        const masterKey = "$2a$10$9X/dqqMfiNn.YkTc8XAfwezKmFwYOOQKs7VnTQC6IUgZ3qWkCVj4m";

        const response = await fetch(`${binId}`, {
            headers: {
                "X-Master-Key": masterKey,
            }
        });
        if (!response.ok) {
            console.error("Error fetching data from JSONBin:", response.statusText);
            return;
        }
        const existingData = await response.json();
        if (!existingData.record.formSubmissions) {
            existingData.record.formSubmissions = [];
        }
        existingData.record.formSubmissions.push(formData);
    
        try {
            const updateResponse = await fetch(`${binId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "X-Master-Key": masterKey,
                },
                body: JSON.stringify(existingData.record),
            });
            
            if (!updateResponse.ok) {
                console.error("Error updating data in JSONBin:", updateResponse.statusText);
            } else {
                console.log("Form data successfully added to JSONBin!");
            }
    
            nameField.value = "";
            emailField.value = "";
            messageField.value = "";
    
            showTemporaryMessage("Your message has been sent successfully!", errorOutput);
    
        } catch (error) {
            console.error("Error sending data to JSONBin:", error);
            showTemporaryMessage("There was an error sending your message. Please try again later.", errorOutput);
        }
    });
    
    function showTemporaryMessage(msg, outputElement) {
        outputElement.textContent = msg;
        setTimeout(() => (outputElement.textContent = ""), 2000);
    }
});

class ProjectCard extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: "open" });
    }

    connectedCallback() {
        const title = this.getAttribute("title") || "Untitled Project";
        const imageSrc = this.getAttribute("image") || "placeholder.jpg";
        const description = this.getAttribute("description") || "No description available.";
        const link = this.getAttribute("link") || "#";

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    --bg-color: #007bff;
                    --text-color:rgb(174, 187, 236);
                    --border-radius: 10px;
                    --padding: 15px;
                    --shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
                    display: block;
                    max-width: 300px;
                    box-shadow: var(--shadow);
                    border-radius: var(--border-radius);
                    background: var(--bg-color);
                    padding: var(--padding);
                    transition: transform 0.2s ease-in-out;
                }

                :host(:hover) {
                    transform: scale(1.05);
                }

                h2 {
                    font-size: 1.2em;
                    color: var(--text-color);
                    margin: 0;
                }

                picture img {
                    width: 100%;
                    border-radius: var(--border-radius);
                }

                p {
                    font-size: 1em;
                    color: var(--text-color);
                }

                a {
                    display: inline-block;
                    margin-top: 10px;
                    text-decoration: none;
                    color: blue;
                    font-weight: bold;
                }
            </style>
            <h2>${title}</h2>
            <picture>
                <img src="${imageSrc}" alt="${title}">
            </picture>
            <p>${description}</p>
            <a href="${link}" target="_blank">Read More</a>
        `;
    }
}

customElements.define("project-card", ProjectCard);

document.addEventListener("DOMContentLoaded", async function () {
    const projectContainer = document.getElementById("projects");

    projectContainer.innerHTML = "";  

    let projects = [];

    try {
        const response = await fetch("projects.json");
        projects = await response.json();
    } catch (error) {
        console.error("Failed to fetch projects.json", error);
    }

    populateCards(projects);
});

function populateCards(data) {
    const projectContainer = document.getElementById("projects");
    projectContainer.innerHTML = "";

    data.forEach((project) => {
        const card = document.createElement("project-card");
        card.setAttribute("title", project.title);
        card.setAttribute("image", project.image);
        card.setAttribute("description", project.description);
        card.setAttribute("link", project.link);
        projectContainer.appendChild(card);
    });
}

async function loadLocalData() {
    try {
        localStorage.removeItem("projects");

        const response = await fetch("projects.json");
        const jsonData = await response.json();

        localStorage.setItem("projects", JSON.stringify(jsonData));

        populateCards(jsonData);
    } catch (error) {
        console.error("Failed to load projects.json", error);
    }
}

document.getElementById("loadLocal").addEventListener("click", loadLocalData);

async function loadRemoteData() {
    try {
      const response = await fetch("https://api.jsonbin.io/v3/b/67d71aa28960c979a572ce7d", {
        headers: { 
          "X-Master-Key": "$2a$10$9X/dqqMfiNn.YkTc8XAfwezKmFwYOOQKs7VnTQC6IUgZ3qWkCVj4m"
        }
      });
  
      if (!response.ok) throw new Error("Network response was not OK");
  
      const result = await response.json();
      const data = result.record;
      populateCards(data);
    } catch (error) {
      console.error("Error fetching remote data:", error);
    }
  }

document.getElementById("loadLocal").addEventListener("click", loadLocalData);
document.getElementById("loadRemote").addEventListener("click", loadRemoteData);
