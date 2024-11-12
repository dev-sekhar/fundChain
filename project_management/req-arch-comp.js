function getTomorrowDate() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split("T")[0];
}

function isValidTargetDate(date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const targetDate = new Date(date);
  return targetDate >= today;
}

function isValidActualDate(date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const actualDate = new Date(date);
  return actualDate <= today && actualDate >= today;
}

function updateStatus(row) {
  const codingCheckbox = row.querySelector(".coding");
  const testingCheckbox = row.querySelector(".testing");
  const deploymentCheckbox = row.querySelector(".deployment");
  const statusText = row.querySelector(".status-text");
  const statusBubble = row.querySelector(".status-bubble");

  // Remove any existing status classes
  statusBubble.classList.remove(
    "status-pending",
    "status-in-progress",
    "status-completed"
  );

  if (
    codingCheckbox.checked &&
    testingCheckbox.checked &&
    deploymentCheckbox.checked
  ) {
    statusText.textContent = "Completed";
    statusBubble.classList.add("status-completed");
  } else if (
    codingCheckbox.checked ||
    testingCheckbox.checked ||
    deploymentCheckbox.checked
  ) {
    statusText.textContent = "In-Progress";
    statusBubble.classList.add("status-in-progress");
  } else {
    statusText.textContent = "Pending";
    statusBubble.classList.add("status-pending");
  }
}

function addEventListeners(row, component) {
  const codingCheckbox = row.querySelector(".coding");
  const testingCheckbox = row.querySelector(".testing");
  const deploymentCheckbox = row.querySelector(".deployment");

  // Add event listener for coding checkbox
  codingCheckbox.addEventListener("change", () => {
    testingCheckbox.disabled = !codingCheckbox.checked;
    if (!codingCheckbox.checked) {
      testingCheckbox.checked = false;
      deploymentCheckbox.checked = false;
      deploymentCheckbox.disabled = true;
    }
    updateStatus(row);
    saveComponentState(component);
  });

  // Add event listener for testing checkbox
  testingCheckbox.addEventListener("change", () => {
    deploymentCheckbox.disabled = !testingCheckbox.checked;
    if (!testingCheckbox.checked) {
      deploymentCheckbox.checked = false;
    }
    updateStatus(row);
    saveComponentState(component);
  });

  // Add event listener for deployment checkbox
  deploymentCheckbox.addEventListener("change", () => {
    updateStatus(row);
    saveComponentState(component);
  });

  // Initialize status
  updateStatus(row);

  // Date listeners
  const targetDateInput = row.querySelector(".target-date");
  const actualDateInput = row.querySelector(".actual-date");

  if (targetDateInput) {
    targetDateInput.addEventListener("change", (e) => {
      if (!isValidTargetDate(e.target.value)) {
        e.target.value = getTomorrowDate();
      }
      saveComponentState(component);
    });
  }

  if (actualDateInput) {
    actualDateInput.addEventListener("change", (e) => {
      const today = new Date().toISOString().split("T")[0];
      if (e.target.value && !isValidActualDate(e.target.value)) {
        e.target.value = today;
      }
      saveComponentState(component);
    });
  }
}

function saveComponentState(component) {
  const checkbox = document.querySelector(
    `input[type="checkbox"][data-component="${component}"]`
  );
  if (!checkbox) return;

  const row = checkbox.closest("tr");
  if (!row) return;

  const coding = row.querySelector(".coding").checked;
  const testing = row.querySelector(".testing").checked;
  const deployment = row.querySelector(".deployment").checked;
  const status = row.querySelector(".status-text").textContent;
  const targetDate = row.querySelector(".target-date").value;
  const actualDate = row.querySelector(".actual-date").value;

  const state = {
    coding,
    testing,
    deployment,
    status,
    targetDate,
    actualDate,
  };

  localStorage.setItem(component, JSON.stringify(state));
}

function loadComponentStates() {
  const checkboxes = document.querySelectorAll(
    'input[type="checkbox"][data-component]'
  );
  const processedComponents = new Set();

  checkboxes.forEach((checkbox) => {
    const component = checkbox.getAttribute("data-component");

    if (!processedComponents.has(component)) {
      processedComponents.add(component);

      const state = JSON.parse(localStorage.getItem(component));

      if (state) {
        const row = checkbox.closest("tr");
        const codingCheckbox = row.querySelector(".coding");
        const testingCheckbox = row.querySelector(".testing");
        const deploymentCheckbox = row.querySelector(".deployment");
        const targetDateInput = row.querySelector(".target-date");
        const actualDateInput = row.querySelector(".actual-date");

        if (codingCheckbox) {
          codingCheckbox.checked = state.coding;
        }

        if (testingCheckbox) {
          testingCheckbox.disabled = !codingCheckbox.checked;
          testingCheckbox.checked = state.testing;
        }

        if (deploymentCheckbox) {
          deploymentCheckbox.disabled = !testingCheckbox.checked;
          deploymentCheckbox.checked = state.deployment;
        }

        if (targetDateInput && state.targetDate) {
          targetDateInput.value = isValidTargetDate(state.targetDate)
            ? state.targetDate
            : getTomorrowDate();
        }

        if (actualDateInput && state.actualDate) {
          actualDateInput.value = isValidActualDate(state.actualDate)
            ? state.actualDate
            : new Date().toISOString().split("T")[0];
        }

        updateStatus(row);
      }
    }
  });
}

async function loadRequirements() {
  const response = await fetch("tracability_data.json");
  const data = await response.json();
  const tableBody = document.getElementById("requirementsTableBody");

  document.getElementById(
    "projectName"
  ).textContent = `${data.projectName}: Requirements Tracker`;

  const tomorrow = getTomorrowDate();

  data.steps.forEach((group, groupIndex) => {
    group.requirements.forEach((req, reqIndex) => {
      const functionalRequirement = req.functionalRequirement || req;
      const details = req.details ? req.details.join(", ") : "";
      const componentCount = req.components ? req.components.length : 0;

      if (componentCount > 0) {
        // Create main row with rowspan for common columns
        const mainRow = document.createElement("tr");
        mainRow.innerHTML = `
                    <td class="requirement-col" rowspan="${componentCount}">${
          groupIndex + 1
        }.${reqIndex + 1}</td>
                    <td class="desc-col" rowspan="${componentCount}">${functionalRequirement}</td>
                    <td class="details-col" rowspan="${componentCount}">${details}</td>
                    <td class="layer-col" rowspan="${componentCount}">${
          group.title
        }</td>
                    <td class="component-col">${req.components[0]}</td>
                    <td class="checkbox-col"><input type="checkbox" class="coding" data-component="${
                      req.components[0]
                    }" /></td>
                    <td class="checkbox-col"><input type="checkbox" class="testing" data-component="${
                      req.components[0]
                    }" disabled /></td>
                    <td class="checkbox-col"><input type="checkbox" class="deployment" data-component="${
                      req.components[0]
                    }" disabled /></td>
                    <td class="checkbox-col"><span class="bubble"></span></td>
                    <td class="status-col"><span class="status-bubble status-pending"></span><span class="status-text">Pending</span></td>
                    <td class="date-col"><input type="date" class="target-date" value="${tomorrow}" min="${tomorrow}" /></td>
                    <td class="date-col"><input type="date" class="actual-date" value="" max="${
                      new Date().toISOString().split("T")[0]
                    }" /></td>
                `;
        tableBody.appendChild(mainRow);
        addEventListeners(mainRow, req.components[0]);

        // Create component rows without the merged columns
        req.components.slice(1).forEach((component) => {
          const componentRow = document.createElement("tr");
          componentRow.innerHTML = `
                        <td class="component-col">${component}</td>
                        <td class="checkbox-col"><input type="checkbox" class="coding" data-component="${component}" /></td>
                        <td class="checkbox-col"><input type="checkbox" class="testing" data-component="${component}" disabled /></td>
                        <td class="checkbox-col"><input type="checkbox" class="deployment" data-component="${component}" disabled /></td>
                        <td class="checkbox-col"><span class="bubble"></span></td>
                        <td class="status-col"><span class="status-bubble status-pending"></span><span class="status-text">Pending</span></td>
                        <td class="date-col"><input type="date" class="target-date" value="${tomorrow}" min="${tomorrow}" /></td>
                        <td class="date-col"><input type="date" class="actual-date" value="" max="${
                          new Date().toISOString().split("T")[0]
                        }" /></td>
                    `;
          tableBody.appendChild(componentRow);
          addEventListeners(componentRow, component);
        });
      }
    });
  });

  loadComponentStates();
}

window.onload = loadRequirements;
