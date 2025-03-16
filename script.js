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
