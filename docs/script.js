// Code pour la page principale (index.html)
document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('taskInput');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const taskList = document.getElementById('taskList');
    const trackTasksBtn = document.getElementById('trackTasksBtn');

    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

    // Fonction pour ajouter une tâche
    const addTask = () => {
        const taskName = taskInput.value.trim();
        if (taskName === '') return;

        const task = {
            name: taskName,
            status: 'incomplete'
        };

        tasks.push(task);
        saveTasks();
        displayTasks();

        alert('Tâche ajoutée avec succès !');
        taskInput.value = '';
    };

    // Fonction pour afficher les tâches sur la page principale
    const displayTasks = () => {
        taskList.innerHTML = '';
        tasks.forEach((task, index) => {
            if (task.status !== 'complete') { // Ne pas afficher les tâches complétées
                const li = document.createElement('li');
                li.className = `list-group-item ${task.status}`;
                li.textContent = task.name;

                // Bouton de modification
                const editBtn = document.createElement('button');
                editBtn.textContent = 'Modifier';
                editBtn.className = 'edit-btn btn btn-secondary btn-sm';
                editBtn.addEventListener('click', () => {
                    const newTaskName = prompt('Modifier la tâche', task.name);
                    if (newTaskName) {
                        tasks[index].name = newTaskName.trim();
                        saveTasks();
                        displayTasks();
                    }
                });

                // Bouton de suppression
                const removeBtn = document.createElement('button');
                removeBtn.textContent = 'Supprimer';
                removeBtn.className = 'remove-btn btn btn-danger btn-sm';
                removeBtn.addEventListener('click', () => {
                    tasks.splice(index, 1);
                    saveTasks();
                    displayTasks();
                });

                li.appendChild(editBtn);
                li.appendChild(removeBtn);
                taskList.appendChild(li);
            }
        });
    };

    // Fonction pour sauvegarder les tâches dans le stockage local
    const saveTasks = () => {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    };

    // Ajouter une tâche au clic sur le bouton
    addTaskBtn.addEventListener('click', addTask);

    // Ajouter une tâche au retour à la ligne (Enter)
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTask();
        }
    });

    // Rediriger vers la page de suivi des tâches
    trackTasksBtn.addEventListener('click', () => {
        window.location.href = 'track.html';
    });

    // Charger les tâches au chargement de la page
    displayTasks();
});

// Code pour la page de suivi des tâches (track.html)
document.addEventListener('DOMContentLoaded', () => {
    const incompleteTasks = document.getElementById('incompleteTasks');
    const almostCompleteTasks = document.getElementById('almostCompleteTasks');
    const completeTasks = document.getElementById('completeTasks');

    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

    // Fonction pour afficher les tâches sur la page de suivi
    const displayTasks = () => {
        incompleteTasks.innerHTML = '';
        almostCompleteTasks.innerHTML = '';
        completeTasks.innerHTML = '';

        tasks.forEach((task, index) => {
            const li = document.createElement('li');
            li.className = `list-group-item ${task.status}`;
            li.textContent = task.name;
            li.dataset.index = index;

            if (task.status === 'incomplete') {
                incompleteTasks.appendChild(li);
                li.addEventListener('click', () => {
                    task.status = 'almost-complete';
                    saveTasks();
                    displayTasks();
                });
            } else if (task.status === 'almost-complete') {
                almostCompleteTasks.appendChild(li);
                li.addEventListener('click', () => {
                    task.status = 'complete';
                    saveTasks();
                    displayTasks();
                    alert(`Bravo! Vous avez complété la tâche: ${task.name}`);
                    removeTaskFromMainPage(task.name);
                });
            } else if (task.status === 'complete') {
                const deleteBtn = document.createElement('button');
                deleteBtn.textContent = 'Supprimer définitivement';
                deleteBtn.className = 'delete-btn btn btn-danger btn-sm';
                deleteBtn.addEventListener('click', () => {
                    tasks.splice(index, 1);
                    saveTasks();
                    displayTasks();
                });

                li.appendChild(deleteBtn);
                completeTasks.appendChild(li);
            }
        });
    };

    // Fonction pour sauvegarder les tâches dans le stockage local
    const saveTasks = () => {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    };

    // Fonction pour supprimer la tâche complétée de la page principale uniquement
    const removeTaskFromMainPage = (taskName) => {
        let mainPageTasks = JSON.parse(localStorage.getItem('tasks')) || [];
        // Supprimer la tâche de la page principale (index.html) uniquement si elle est complète
        const updatedTasks = mainPageTasks.map(task => {
            if (task.name === taskName && task.status === 'complete') {
                task.status = 'complete';
            }
            return task;
        });
        localStorage.setItem('tasks', JSON.stringify(updatedTasks));
    };

    // Charger les tâches au chargement de la page de suivi
    displayTasks();
});
