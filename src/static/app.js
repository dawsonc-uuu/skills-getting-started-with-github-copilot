document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      // Reset the select so repeated calls don't duplicate options
      activitySelect.innerHTML = '<option value="">-- Select an activity --</option>';
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        // Build participants HTML with a remove button for each participant
        const participantsHTML = (details.participants && details.participants.length)
          ? `<div class="participants">\n              <h5>Participants (${details.participants.length})</h5>\n              <ul>${details.participants.map(p => `<li><span class=\"participant-email\">${p}</span><button class=\"participant-remove\" data-activity=\"${encodeURIComponent(name)}\" data-email=\"${encodeURIComponent(p)}\">✕</button></li>`).join('')}</ul>\n            </div>`
          : `<div class="participants">\n              <h5>Participants (0)</h5>\n              <p class=\"no-participants\">No participants yet</p>\n            </div>`;

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
          ${participantsHTML}
        `;

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });

      // Attach remove handlers for each participant remove button
      document.querySelectorAll('.participant-remove').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const activityEnc = btn.dataset.activity;
          const emailEnc = btn.dataset.email;
          const activity = decodeURIComponent(activityEnc);
          const email = decodeURIComponent(emailEnc);

          btn.disabled = true;
          try {
            const res = await fetch(`/activities/${encodeURIComponent(activity)}/participants?email=${encodeURIComponent(email)}`, { method: 'DELETE' });
            const body = await res.json().catch(() => ({}));
            if (res.ok) {
              // Refresh activities to update UI
              fetchActivities();
              messageDiv.textContent = body.message || 'Participant removed';
              messageDiv.className = 'success';
            } else {
              messageDiv.textContent = body.detail || 'Failed to remove participant';
              messageDiv.className = 'error';
            }
            messageDiv.classList.remove('hidden');
            setTimeout(() => messageDiv.classList.add('hidden'), 4000);
          } catch (err) {
            console.error('Error removing participant', err);
            messageDiv.textContent = 'Failed to remove participant';
            messageDiv.className = 'error';
            messageDiv.classList.remove('hidden');
            setTimeout(() => messageDiv.classList.add('hidden'), 4000);
          } finally {
            btn.disabled = false;
          }
        });
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
        // Refresh activities so the new participant appears immediately
        fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
