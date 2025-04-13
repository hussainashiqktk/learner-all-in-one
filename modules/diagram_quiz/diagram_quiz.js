function loadPlugin(pluginName) {
    if (pluginName !== 'diagram_quiz') return;

    const content = document.getElementById('page-content'); // Corrected ID
    if (!content) {
        console.error("Target element 'page-content' not found for diagram quiz module.");
        return;
    }
    content.innerHTML = `
        <style>
            .diagram-quiz-app {
                padding: 20px;
            }
            .quiz-container {
                position: relative;
                margin: 20px auto;
                max-width: 100%;
            }
            .quiz-image {
                max-width: 100%;
                border: 1px solid #ddd;
                display: block;
            }
            .hidden-spot {
                position: absolute;
                background-color: pink;
                cursor: pointer;
                border: 2px dashed red;
                transition: border-color 0.3s ease-out; /* Add transition for feedback */
            }
            .spot-answer-container {
                position: absolute;
                background: white;
                padding: 10px;
                border: 1px solid #ddd;
                border-radius: 5px;
                box-shadow: 0 2px 5px rgba(0,0,0,0.2);
                z-index: 10;
                display: none;
                min-width: 250px;
            }
            .spot-tools {
                display: flex;
                gap: 5px;
                margin-top: 5px;
            }
            .quiz-list {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                gap: 15px;
                margin: 20px 0;
            }
            .quiz-card {
                border: 1px solid #ddd;
                padding: 10px;
                border-radius: 5px;
                cursor: pointer;
                transition: all 0.3s;
                position: relative;
            }
            .quiz-card:hover {
                box-shadow: 0 0 10px rgba(0,0,0,0.1);
            }
            .quiz-card .delete-btn {
                position: absolute;
                top: 5px;
                right: 5px;
                background: red;
                color: white;
                border: none;
                border-radius: 50%;
                width: 20px;
                height: 20px;
                font-size: 12px;
                cursor: pointer;
            }
            .creator-canvas-container {
                position: relative;
                margin: 20px auto;
                max-width: 100%;
                display: inline-block;
            }
            .creator-tools {
                margin: 10px 0;
            }
            .spot-form {
                margin-top: 20px;
                padding: 15px;
                background: #f5f5f5;
                border-radius: 5px;
                position: relative;
            }
            .spot-form .delete-spot-btn {
                position: absolute;
                top: 5px;
                right: 5px;
                background: red;
                color: white;
                border: none;
                border-radius: 50%;
                width: 20px;
                height: 20px;
                font-size: 12px;
                cursor: pointer;
            }
            /* New styles for creator answer popups */
            .creator-answer-popup {
                position: absolute;
                background: white;
                padding: 10px;
                border: 1px solid #ddd;
                border-radius: 5px;
                box-shadow: 0 2px 5px rgba(0,0,0,0.2);
                z-index: 10;
                min-width: 200px;
            }
            .creator-answer-popup input {
                width: 100%;
                margin-bottom: 5px;
            }
        </style>
        <div class="diagram-quiz-app container-fluid">
            <ul class="nav nav-tabs mb-4" id="quizTabs" role="tablist">
                <li class="nav-item" role="presentation">
                    <button class="nav-link active" id="take-tab" data-bs-toggle="tab" data-bs-target="#take" type="button">Take Quiz</button>
                </li>
                <li class="nav-item" role="presentation">
                    <button class="nav-link" id="create-tab" data-bs-toggle="tab" data-bs-target="#create" type="button">Create Quiz</button>
                </li>
            </ul>

            <div class="tab-content">
                <div class="tab-pane fade show active" id="take" role="tabpanel">
                    <div id="quizSelection">
                        <h4>Available Quizzes</h4>
                        <div class="quiz-list" id="quizList"></div>
                    </div>
                    <div id="quizInterface" style="display: none;">
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <h4 id="quizTitle"></h4>
                            <button class="btn btn-sm btn-danger" id="deleteQuizBtn">Delete Quiz</button>
                        </div>
                        <div class="quiz-container">
                            <img id="quizImage" class="quiz-image" src="" alt="Quiz Diagram">
                            <div id="hiddenSpotsContainer"></div>
                        </div>
                        <div class="mt-3">
                            <button class="btn btn-secondary" id="revealAll">Reveal All Answers</button>
                            <button class="btn btn-outline-primary" id="backToQuizzes">Back to Quizzes</button>
                        </div>
                    </div>
                </div>

                <div class="tab-pane fade" id="create" role="tabpanel">
                    <h4>Create New Quiz</h4>
                    <div class="mb-3">
                        <label for="quizTitleInput" class="form-label">Quiz Title</label>
                        <input type="text" class="form-control" id="quizTitleInput">
                    </div>
                    <div class="mb-3">
                        <label for="quizImageUpload" class="form-label">Upload Diagram Image</label>
                        <input type="file" class="form-control" id="quizImageUpload" accept="image/*">
                    </div>
                    <div class="creator-tools">
                        <button class="btn btn-sm btn-primary" id="addSpot">Add Hidden Spot</button>
                        <button class="btn btn-sm btn-danger" id="removeSpot">Remove Last Spot</button>
                        <button class="btn btn-success" id="saveQuiz">Save Quiz</button>
                    </div>
                    <div class="creator-canvas-container">
                        <canvas id="creatorCanvas"></canvas>
                        <div id="creatorAnswerPopups"></div>
                    </div>
                    <div id="spotFormsContainer"></div>
                </div>
            </div>
        </div>
    `;

    initDiagramQuizApp();
}

function initDiagramQuizApp() {
    let currentQuiz = null;
    let currentSpotIndex = 0;
    let hiddenSpots = [];
    let creatorImage = null;
    let canvasCtx = null;
    let currentSpot = null;

    // DOM elements
    const quizList = document.getElementById('quizList');
    const quizSelection = document.getElementById('quizSelection');
    const quizInterface = document.getElementById('quizInterface');
    const quizTitle = document.getElementById('quizTitle');
    const quizImage = document.getElementById('quizImage');
    const hiddenSpotsContainer = document.getElementById('hiddenSpotsContainer');
    const revealAll = document.getElementById('revealAll');
    const backToQuizzes = document.getElementById('backToQuizzes');
    const deleteQuizBtn = document.getElementById('deleteQuizBtn');
    const quizTitleInput = document.getElementById('quizTitleInput');
    const quizImageUpload = document.getElementById('quizImageUpload');
    const addSpot = document.getElementById('addSpot');
    const removeSpot = document.getElementById('removeSpot');
    const creatorCanvas = document.getElementById('creatorCanvas');
    const creatorAnswerPopups = document.getElementById('creatorAnswerPopups');
    const spotFormsContainer = document.getElementById('spotFormsContainer');
    const saveQuiz = document.getElementById('saveQuiz');

    // Initialize canvas
    canvasCtx = creatorCanvas.getContext('2d');

    // Load quizzes list
    loadQuizzes();

    // Event listeners
    revealAll.addEventListener('click', revealAllAnswers);
    backToQuizzes.addEventListener('click', showQuizList);
    deleteQuizBtn.addEventListener('click', deleteCurrentQuiz);
    quizImageUpload.addEventListener('change', handleImageUpload);
    addSpot.addEventListener('click', startAddingSpot);
    removeSpot.addEventListener('click', removeLastSpot);
    saveQuiz.addEventListener('click', saveNewQuiz);
    creatorCanvas.addEventListener('mousedown', handleCanvasMouseDown);
    creatorCanvas.addEventListener('mousemove', handleCanvasMouseMove);
    creatorCanvas.addEventListener('mouseup', handleCanvasMouseUp);

    function loadQuizzes() {
        fetch('/plugin/diagram_quiz', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: 'action=get_quizzes'
        })
        .then(response => response.json())
        .then(data => {
            quizList.innerHTML = '';
            data.quizzes.forEach(quiz => {
                const quizCard = document.createElement('div');
                quizCard.className = 'quiz-card';
                quizCard.innerHTML = `
                    <div class="quiz-title">${quiz.title}</div>
                    <small>ID: ${quiz.id}</small>
                    <button class="delete-btn" data-id="${quiz.id}">×</button>
                `;
                quizCard.querySelector('.delete-btn').addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (confirm('Delete this quiz?')) {
                        deleteQuiz(quiz.id);
                    }
                });
                quizCard.addEventListener('click', () => loadQuiz(quiz.id));
                quizList.appendChild(quizCard);
            });
        });
    }

    function deleteQuiz(quizId) {
        fetch('/plugin/diagram_quiz', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `action=delete_quiz&quiz_id=${quizId}`
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                loadQuizzes();
                if (currentQuiz && currentQuiz.id === quizId) {
                    showQuizList();
                }
            }
        });
    }

    function deleteCurrentQuiz() {
        if (!currentQuiz) return;
        if (confirm('Delete this quiz?')) {
            deleteQuiz(currentQuiz.id);
        }
    }

    function loadQuiz(quizId) {
        fetch('/plugin/diagram_quiz', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `action=get_quiz&quiz_id=${quizId}`
        })
        .then(response => response.json())
        .then(data => {
            currentQuiz = data;
            quizTitle.textContent = data.title;
            quizImage.src = `data:image/png;base64,${data.image}`;
            
            quizImage.onload = function() {
                hiddenSpots = data.hidden_spots || [];
                currentSpotIndex = 0;
                renderHiddenSpots();
            };
            
            showQuizInterface();
        });
    }

    function renderHiddenSpots() {
        hiddenSpotsContainer.innerHTML = '';
        const imgRect = quizImage.getBoundingClientRect();
        const imgWidth = quizImage.naturalWidth;
        const imgHeight = quizImage.naturalHeight;
        const scaleX = imgRect.width / imgWidth;
        const scaleY = imgRect.height / imgHeight;
        
        hiddenSpots.forEach((spot, index) => {
            const spotElement = document.createElement('div');
            spotElement.className = 'hidden-spot';
            spotElement.style.left = `${spot.x * scaleX}px`;
            spotElement.style.top = `${spot.y * scaleY}px`;
            spotElement.style.width = `${spot.width * scaleX}px`;
            spotElement.style.height = `${spot.height * scaleY}px`;
            spotElement.dataset.index = index;
            
            // Create answer container for each spot
            const answerContainer = document.createElement('div');
            answerContainer.className = 'spot-answer-container';
            answerContainer.id = `answer-container-${index}`;
            answerContainer.innerHTML = `
                <div class="input-group mb-2">
                    <input type="text" class="form-control spot-answer-input" placeholder="Enter your answer">
                    <button class="btn btn-primary spot-submit-answer">Submit</button>
                </div>
                <div class="spot-feedback"></div>
                <div class="spot-tools">
                    <button class="btn btn-sm btn-secondary reveal-spot">Reveal</button>
                </div>
            `;
            
            spotElement.appendChild(answerContainer);
            
            spotElement.addEventListener('click', (e) => {
                e.stopPropagation();
                currentSpotIndex = index;
                
                // Hide all other answer containers
                document.querySelectorAll('.spot-answer-container').forEach(container => {
                    container.style.display = 'none';
                });
                
                // Show this spot's answer container
                answerContainer.style.display = 'block';
                
                // Position container
                const spotRect = spotElement.getBoundingClientRect();
                const containerRect = answerContainer.getBoundingClientRect();
                const quizRect = quizImage.getBoundingClientRect();
                
                // Position the container directly above the spot
                let left = spotRect.left;
                let top = spotRect.top - containerRect.height - 10; // Position above the spot
                
                // Ensure the container doesn't go off-screen
                if (top < quizRect.top) {
                    top = spotRect.bottom + 10; // If it goes off-screen, position below
                }

                if (left + containerRect.width > quizRect.right) {
                    left = quizRect.right - containerRect.width - 10;
                }
                
                answerContainer.style.left = `${left - spotRect.left}px`;
                answerContainer.style.top = `${top - spotRect.top}px`;
                
                // Focus input
                answerContainer.querySelector('.spot-answer-input').focus();
            });
            
            // Event listeners for this spot's answer container
            answerContainer.querySelector('.spot-submit-answer').addEventListener('click', () => {
                const answer = answerContainer.querySelector('.spot-answer-input').value.trim();
                if (!answer) return;
                
                fetch('/plugin/diagram_quiz', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: `action=check_answer&quiz_id=${currentQuiz.id}&spot_index=${index}&answer=${encodeURIComponent(answer)}`
                })
                .then(response => response.json())
                .then(data => {
                    const feedbackDiv = answerContainer.querySelector('.spot-feedback');
                    const spotElement = hiddenSpotsContainer.querySelector(`.hidden-spot[data-index="${index}"]`); // Get the spot element

                    if (data.is_correct) {
                        feedbackDiv.innerHTML = `<div class="alert alert-success">Correct! The answer is: ${data.correct_answer}</div>`;
                        if (spotElement) {
                            spotElement.style.borderColor = 'green'; // Correct feedback
                        }
                    } else {
                        feedbackDiv.innerHTML = `<div class="alert alert-danger">Incorrect. Try again!</div>`;
                        if (spotElement) {
                            spotElement.style.borderColor = 'red'; // Incorrect feedback
                        }
                    }
                    answerContainer.querySelector('.spot-answer-input').value = '';

                    // Reset border color after a delay
                    if (spotElement) {
                        setTimeout(() => {
                            spotElement.style.borderColor = 'red'; // Back to default dashed red
                        }, 1000); // Reset after 1 second
                    }
                });
            });

            answerContainer.querySelector('.reveal-spot').addEventListener('click', () => {
                spotElement.style.display = 'none';
                const feedbackDiv = answerContainer.querySelector('.spot-feedback');
                feedbackDiv.innerHTML = `<div class="alert alert-info">Answer: ${hiddenSpots[index].answer}</div>`;
            });
            
            hiddenSpotsContainer.appendChild(spotElement);
        });
    }

    function revealAllAnswers() {
        Array.from(hiddenSpotsContainer.children).forEach((spot, index) => {
            spot.style.display = 'none';
            const feedbackDiv = spot.querySelector('.spot-feedback');
            if (feedbackDiv) {
                feedbackDiv.innerHTML = `<div class="alert alert-info">Answer: ${hiddenSpots[index].answer}</div>`;
            }
        });
    }

    function showQuizList() {
        quizSelection.style.display = 'block';
        quizInterface.style.display = 'none';
        currentQuiz = null;
    }

    function showQuizInterface() {
        quizSelection.style.display = 'none';
        quizInterface.style.display = 'block';
    }

    function handleImageUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(event) {
            creatorImage = new Image();
            creatorImage.onload = function() {
                // Set canvas to exact image dimensions
                creatorCanvas.width = creatorImage.naturalWidth;
                creatorCanvas.height = creatorImage.naturalHeight;
                
                // Draw image on canvas
                canvasCtx.drawImage(creatorImage, 0, 0, creatorCanvas.width, creatorCanvas.height);
            };
            creatorImage.src = event.target.result;
        };
        reader.readAsDataURL(file);
    }

    function startAddingSpot() {
        if (!creatorImage) {
            alert('Please upload an image first');
            return;
        }
        currentSpot = {
            startX: 0,
            startY: 0,
            width: 0,
            height: 0,
            drawing: false
        };
    }

    function handleCanvasMouseDown(e) {
        if (!currentSpot) return;
        
        const rect = creatorCanvas.getBoundingClientRect();
        const scaleX = creatorCanvas.width / rect.width;
        const scaleY = creatorCanvas.height / rect.height;
        
        currentSpot.startX = (e.clientX - rect.left) * scaleX;
        currentSpot.startY = (e.clientY - rect.top) * scaleY;
        currentSpot.drawing = true;
    }

    function handleCanvasMouseMove(e) {
        if (!currentSpot || !currentSpot.drawing) return;
        
        const rect = creatorCanvas.getBoundingClientRect();
        const scaleX = creatorCanvas.width / rect.width;
        const scaleY = creatorCanvas.height / rect.height;
        
        const mouseX = (e.clientX - rect.left) * scaleX;
        const mouseY = (e.clientY - rect.top) * scaleY;
        
        // Redraw image
        canvasCtx.drawImage(creatorImage, 0, 0);
        
        // Draw all existing spots
        hiddenSpots.forEach(spot => {
            canvasCtx.fillStyle = 'pink';
            canvasCtx.fillRect(spot.x, spot.y, spot.width, spot.height);
            canvasCtx.strokeStyle = 'red';
            canvasCtx.strokeRect(spot.x, spot.y, spot.width, spot.height);
        });
        
        // Draw current spot being created
        currentSpot.width = mouseX - currentSpot.startX;
        currentSpot.height = mouseY - currentSpot.startY;
        
        canvasCtx.fillStyle = 'rgba(255, 192, 203, 0.7)';
        canvasCtx.fillRect(currentSpot.startX, currentSpot.startY, currentSpot.width, currentSpot.height);
        canvasCtx.strokeStyle = 'red';
        canvasCtx.strokeRect(currentSpot.startX, currentSpot.startY, currentSpot.width, currentSpot.height);
    }

    function handleCanvasMouseUp(e) {
        if (!currentSpot || !currentSpot.drawing) return;
        
        currentSpot.drawing = false;
        
        // Ensure width and height are positive
        const x = currentSpot.width < 0 ? currentSpot.startX + currentSpot.width : currentSpot.startX;
        const y = currentSpot.height < 0 ? currentSpot.startY + currentSpot.height : currentSpot.startY;
        const width = Math.abs(currentSpot.width);
        const height = Math.abs(currentSpot.height);
        
        // Only add spot if it has reasonable size
        if (width > 10 && height > 10) {
            addSpotForm(x, y, width, height);
            showAnswerPopup(x, y, width, height, hiddenSpots.length - 1);
        }
    }

function showAnswerPopup(x, y, width, height, spotIndex) {
    // Create the popup element
    const popup = document.createElement('div');
    popup.className = 'creator-answer-popup';
    popup.dataset.spotIndex = spotIndex;
    
    // Position the popup near the spot
    const rect = creatorCanvas.getBoundingClientRect();
    const scaleX = rect.width / creatorCanvas.width;
    const scaleY = rect.height / creatorCanvas.height;
    
    popup.style.left = `${x + width}px`;
    popup.style.top = `${y - height - 10}px`;
    
    popup.innerHTML = `
        <input type="text" class="form-control spot-answer-input" placeholder="Enter answer for this spot">
        <button class="btn btn-sm btn-primary save-spot-answer">Save</button>
    `;
    
    popup.querySelector('.save-spot-answer').addEventListener('click', () => {
        const answer = popup.querySelector('.spot-answer-input').value.trim();
        if (answer) {
            hiddenSpots[spotIndex].answer = answer;
            creatorAnswerPopups.removeChild(popup);
            updateSpotFormAnswer(spotIndex, answer);
        }
    });
    
    creatorAnswerPopups.appendChild(popup);
    
    // Focus the input
    popup.querySelector('.spot-answer-input').focus();
}

    function updateSpotFormAnswer(spotIndex, answer) {
        const spotForms = spotFormsContainer.querySelectorAll('.spot-form');
        if (spotForms[spotIndex]) {
            spotForms[spotIndex].querySelector('.spot-answer').value = answer;
        }
    }

    function addSpotForm(x, y, width, height) {
        const spotId = hiddenSpots.length;
        const spotForm = document.createElement('div');
        spotForm.className = 'spot-form';
        spotForm.innerHTML = `
            <button class="delete-spot-btn">×</button>
            <h5>Hidden Spot #${spotId + 1}</h5>
            <div class="mb-3">
                <label class="form-label">Position: (${Math.round(x)}, ${Math.round(y)}) Size: ${Math.round(width)}x${Math.round(height)}</label>
                <input type="hidden" class="spot-x" value="${x}">
                <input type="hidden" class="spot-y" value="${y}">
                <input type="hidden" class="spot-width" value="${width}">
                <input type="hidden" class="spot-height" value="${height}">
            </div>
            <div class="mb-3">
                <label class="form-label">Correct Answer</label>
                <input type="text" class="form-control spot-answer" placeholder="Enter correct answer">
            </div>
        `;
        
        spotForm.querySelector('.delete-spot-btn').addEventListener('click', () => {
            removeSpotForm(spotForm, spotId);
        });
        
        spotFormsContainer.appendChild(spotForm);
        
        // Add to hidden spots array
        hiddenSpots.push({
            x: x,
            y: y,
            width: width,
            height: height,
            answer: ''
        });
    }

    function removeSpotForm(spotForm, spotId) {
        spotFormsContainer.removeChild(spotForm);
        hiddenSpots.splice(spotId, 1);

        // Redraw canvas
        redrawCreatorCanvas();
        
        // Reindex remaining forms
        const forms = spotFormsContainer.querySelectorAll('.spot-form');
        forms.forEach((form, index) => {
            form.querySelector('h5').textContent = `Hidden Spot #${index + 1}`;
        });
    }

    function removeLastSpot() {
        if (hiddenSpots.length === 0) return;
        const lastForm = spotFormsContainer.lastChild;
        if (lastForm) {
            spotFormsContainer.removeChild(lastForm);
        }
        hiddenSpots.pop();
        redrawCreatorCanvas();
    }

    function redrawCreatorCanvas() {
        if (!creatorImage) return;
        
        canvasCtx.drawImage(creatorImage, 0, 0);
        hiddenSpots.forEach(spot => {
            canvasCtx.fillStyle = 'pink';
            canvasCtx.fillRect(spot.x, spot.y, spot.width, spot.height);
            canvasCtx.strokeStyle = 'red';
            canvasCtx.strokeRect(spot.x, spot.y, spot.width, spot.height);
        });
    }

    function saveNewQuiz() {
        const title = quizTitleInput.value.trim();
        if (!title || !creatorImage || hiddenSpots.length === 0) {
            alert('Please provide title, image and at least one hidden spot');
            return;
        }
        
        // Update answers from forms
        const spotForms = spotFormsContainer.querySelectorAll('.spot-form');
        spotForms.forEach((form, index) => {
            const answer = form.querySelector('.spot-answer').value.trim();
            if (!answer) {
                alert(`Please provide answer for spot #${index + 1}`);
                throw new Error('Missing answer');
            }
            hiddenSpots[index].answer = answer;
        });
        
        const formData = new FormData();
        formData.append('action', 'create_quiz');
        formData.append('title', title);
        formData.append('image', quizImageUpload.files[0]);
        formData.append('hidden_spots', JSON.stringify(hiddenSpots));
        
        fetch('/plugin/diagram_quiz', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            alert('Quiz created successfully!');
            // Reset form
            resetCreatorForm();
            // Reload quizzes list
            loadQuizzes();
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error creating quiz');
        });
    }

    function resetCreatorForm() {
        quizTitleInput.value = '';
        quizImageUpload.value = '';
        spotFormsContainer.innerHTML = '';
        creatorAnswerPopups.innerHTML = '';
        hiddenSpots = [];
        creatorCanvas.width = 800;
        creatorCanvas.height = 600;
        canvasCtx.clearRect(0, 0, creatorCanvas.width, creatorCanvas.height);
        creatorImage = null;
    }

    // Handle clicks outside the answer containers to hide them
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.spot-answer-container') && !e.target.closest('.hidden-spot')) {
            document.querySelectorAll('.spot-answer-container').forEach(container => {
                container.style.display = 'none';
            });
        }
    });
}
