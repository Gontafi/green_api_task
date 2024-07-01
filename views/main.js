const API_URL = "http://localhost:8081";

function getRequest(url) {
    fetch(url)
        .then(response => {
            console.log(response);
            return response.json();
        })
        .then(data => {
            document.getElementById("output_json").innerHTML = JSON.stringify(data, undefined, 2);
        })
        .catch(error => {
            console.error('There has been a problem with your fetch operation:', error);
        });
}

function getSettings() {
    const apiTokenInstance = document.getElementById("api_token").value;
    const idInstance = document.getElementById("id_instance").value;
    const url = `${API_URL}/waInstance${idInstance}/getSettings/${apiTokenInstance}`;

    getRequest(url);
}

function getStateInstance() {
    const apiTokenInstance = document.getElementById("api_token").value;
    const idInstance = document.getElementById("id_instance").value;
    const url = `${API_URL}/waInstance${idInstance}/getStateInstance/${apiTokenInstance}`;

    getRequest(url);
}

function sendMessage() {
    const apiTokenInstance = document.getElementById("api_token").value;
    const idInstance = document.getElementById("id_instance").value;
    const phone = document.getElementById("number_msg").value;
    const message = document.getElementById("message").value;
    const url = `${API_URL}/waInstance${idInstance}/sendMessage/${apiTokenInstance}`;

    fetch(url, {
        method: "POST",
        body: JSON.stringify({
            "chatId": phone + "@c.us",
            "message": message,
        })
    }).then(response => {
        console.log(response);
        return response.json();
    }).then(data => {
        document.getElementById("output_json").innerHTML = JSON.stringify(data, undefined, 2);
    }).catch(error => {
        console.error('There has been a problem with your fetch operation:', error);
    });
}

function sendFileByUrl() {
    const apiTokenInstance = document.getElementById("api_token").value;
    const idInstance = document.getElementById("id_instance").value;
    const phone = document.getElementById("number_msg_file").value;
    const fileURL = document.getElementById("file_url").value;


    const contentTypeUrl = `${API_URL}/getContentType?url=${encodeURIComponent(fileURL)}`;

    fetch(contentTypeUrl)
        .then(response => {
            if (response.ok) {
                return response.text();
            }
            throw new Error('Network response was not ok.');
        })
        .then(contentType => {
            let fileName = "";
            const url = `${API_URL}/waInstance${idInstance}/sendFileByUrl/${apiTokenInstance}`;

            const match = contentType.match(/filename="([^"]+)"/);

            if (match) {
                fileName = match[1];
                console.log(fileName);
            } else {
                console.log("Filename not found");
            }

            fetch(url, {
                method: "POST",
                body: JSON.stringify({
                    "chatId": phone + "@c.us",
                    "urlFile": fileURL,
                    "fileName": fileName,
                })
            }).then(response => {
                console.log(response);
                return response.json();
            }).then(data => {
                document.getElementById("output_json").innerHTML = JSON.stringify(data, undefined, 2);
            }).catch(error => {
                console.error('There has been a problem with your fetch operation:', error);
            });
        })
        .catch(error => {
            console.error('Failed to fetch content type:', error);
        });
}
