document.getElementById("authenticate").addEventListener("click", function () {
  const apiKey = document.getElementById("api_key").value;
  const modelId = document.getElementById("model_id").value;

  fetch("/authenticate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ API_KEY: apiKey, model_id: modelId }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Authentication failed");
      }
      return response.json();
    })
    .then((data) => {
      localStorage.setItem("token", data.token);
      localStorage.setItem("org_id", data.org_id);

      document.getElementById("hallucination-form").style.display = "block";
      document.getElementById("hallucination-display").style.display = "block";
    })
    .catch((error) => {
      console.error("Error:", error);
    });
});

document
  .getElementById("submit_hallucination")
  .addEventListener("click", function () {
    const prompt = document.getElementById("prompt").value;
    const response = document.getElementById("response").value;
    const token = localStorage.getItem("token");

    fetch("/hallucination", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ prompt, response }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Submission failed");
        }
        return response.json();
      })
      .then((data) => {
        console.log("Hallucination submitted:", data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  });

document
  .getElementById("display_hallucination")
  .addEventListener("click", function () {
    const token = localStorage.getItem("token");
    fetch("/hallucination", {
      method: "GET",
      headers: {
        Authorization: `${token}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to retrieve hallucinations");
        }
        return response.json();
      })
      .then((data) => {
        const hallucinationDataDiv =
          document.getElementById("hallucination_data");
        // Task 3.b
        hallucinationDataDiv.innerHTML = data
          .map(
            (hallucination) =>
              `<div>Prompt: ${hallucination.prompt}, Response: ${hallucination.response}</div>`,
          )
          .join("");
        document.getElementById("hallucination-display").style.display =
          "block";
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  });
