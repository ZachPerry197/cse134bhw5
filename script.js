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

    form.addEventListener("submit", function (event) {
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
            event.preventDefault();
            form_errors = form_errors.concat(newErrors);
            formErrorsField.value = JSON.stringify(form_errors);
            displayErrors();
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
        // Fetch attributes from the element
        const title = this.getAttribute("title") || "Untitled Project";
        const imageSrc = this.getAttribute("image") || "placeholder.jpg";
        const description = this.getAttribute("description") || "No description available.";
        const link = this.getAttribute("link") || "#";

        // Define the card's HTML structure
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

    // Load from localStorage
    let projects = JSON.parse(localStorage.getItem("projects")) || [];

    // Grab additional projects from a JSON file
    try {
        const response = await fetch("projects.json");
        const jsonData = await response.json();
        projects = [...projects, ...jsonData];
    } catch (error) {
        console.error("Failed to fetch projects.json", error);
    }

    // Fill the page with project cards
    projects.forEach((project) => {
        const card = document.createElement("project-card");
        card.setAttribute("title", project.title);
        card.setAttribute("image", project.image);
        card.setAttribute("description", project.description);
        card.setAttribute("link", project.link);
        projectContainer.appendChild(card);
    });
});
