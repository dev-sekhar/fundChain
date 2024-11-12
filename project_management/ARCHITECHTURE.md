<!DOCTYPE html>
<html>
<head>
    <title>Requirements Tracker</title>
    <link href="https://fonts.googleapis.com/css2?family=Arimo:wght@400;700&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: 'Arimo', sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 20px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        th, td {
            border: 1px solid #ddd;
            padding: 12px;
            text-align: left;
        }
        th {
            background-color: #0F0D46;
            color: white;
            font-weight: bold;
        }
        tr:nth-child(even) {
            background-color: #f9f9f9;
        }
        tr:hover {
            background-color: #f1f1f1;
        }
        .header {
            text-align: center;
            padding: 20px;
        }
        .complete {
            color: #197A24;
        }
        .incomplete {
            color: black;
        }
    </style>
    <script>
        async function loadRequirements() {
            const response = await fetch('req-arch-comp.json');
            const data = await response.json();
            const tableBody = document.getElementById('requirementsTableBody');

            document.getElementById('projectName').textContent = `${data.projectName}: Requirements Tracker`;

            data.steps.forEach((group, groupIndex) => {
                group.requirements.forEach((req, reqIndex) => {
                    const functionalRequirement = req.functionalRequirement || req;
                    const details = req.details ? req.details.join(', ') : '';

                    const mainRow = document.createElement('tr');
                    mainRow.innerHTML = `
                        <td>${groupIndex + 1}.${reqIndex + 1}</td>
                        <td>${functionalRequirement}</td>
                        <td>${details}</td>
                        <td>${group.title}</td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                    `;
                    tableBody.appendChild(mainRow);

                    if (req.components) {
                        req.components.forEach(component => {
                            const componentRow = document.createElement('tr');
                            componentRow.innerHTML = `
                                <td></td>
                                <td></td>
                                <td></td>
                                <td>${group.title}</td>
                                <td>${component}</td>
                                <td><input type="checkbox" class="coding" onchange="updateCompletion(this, '${component}')" /></td>
                                <td><input type="checkbox" class="testing" onchange="updateCompletion(this, '${component}')" /></td>
                                <td><input type="checkbox" class="deployment" onchange="updateCompletion(this, '${component}')" /></td>
                                <td class="completion incomplete">Incomplete</td>
                            `;
                            tableBody.appendChild(componentRow);
                        });
                    }
                });
            });

            loadCheckboxStates();
        }

        function updateCompletion(checkbox, component) {
            const row = checkbox.closest('tr');
            const codingCheckbox = row.querySelector('.coding');
            const testingCheckbox = row.querySelector('.testing');
            const deploymentCheckbox = row.querySelector('.deployment');
            const completionCell = row.querySelector('.completion');

            if (codingCheckbox.checked && testingCheckbox.checked && deploymentCheckbox.checked) {
                completionCell.textContent = 'Complete';
                completionCell.classList.remove('incomplete');
                completionCell.classList.add('complete');
            } else {
                completionCell.textContent = 'Incomplete';
                completionCell.classList.remove('complete');
                completionCell.classList.add('incomplete');
            }

            saveCheckboxStates(component, codingCheckbox.checked, testingCheckbox.checked, deploymentCheckbox.checked);
        }

        function saveCheckboxStates(component, coding, testing, deployment) {
            const states = {
                coding,
                testing,
                deployment
            };
            localStorage.setItem(component, JSON.stringify(states));
        }

        function loadCheckboxStates() {
            const rows = document.querySelectorAll('tr');
            rows.forEach(row => {
                const componentCell = row.querySelector('td:nth-child(5)');
                if (componentCell) {
                    const component = componentCell.textContent;
                    const states = JSON.parse(localStorage.getItem(component));

                    if (states) {
                        const codingCheckbox = row.querySelector('.coding');
                        const testingCheckbox = row.querySelector('.testing');
                        const deploymentCheckbox = row.querySelector('.deployment');

                        if (codingCheckbox) codingCheckbox.checked = states.coding;
                        if (testingCheckbox) testingCheckbox.checked = states.testing;
                        if (deploymentCheckbox) deploymentCheckbox.checked = states.deployment;

                        updateCompletion(codingCheckbox, component);
                    }
                }
            });
        }

        window.onload = loadRequirements;
    </script>
</head>
<body>
    <div class="header">
        <h1 id="projectName">Requirements Tracker</h1>
    </div>
    <table>
        <tr>
            <th>ID</th>
            <th>Functional Requirement</th>
            <th>Details</th>
            <th>Architecture Layer</th>
            <th>Component</th>
            <th>Coding</th>
            <th>Testing</th>
            <th>Deployment</th>
            <th>Completion</th>
        </tr>
        <tbody id="requirementsTableBody"></tbody>
    </table>
</body>
</html>



