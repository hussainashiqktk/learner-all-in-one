function loadPlugin(pluginName) {
    if (pluginName !== 'diagram_quiz') return;

    const content = document.getElementById('content');
    content.innerHTML = `
        <style>
            .diagram-quiz-app {
                padding: 20px;
            }
            .quiz-container {
                position: relative;
                margin: 20px auto;
                max-width: 800px;
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
            }
            .answer-input {
                margin-top: 20px;
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
            }
            .quiz-card:hover {
                box-shadow: 0 0 10px rgba(0,0,0,0.1);
            }
            .quiz-title {
                font-weight: bold;
                margin-bottom: 5px;
            }
            .creator-canvas {
                position: relative;
                border: 1px solid #ddd;
                margin: 20px auto;
                max-width: 800px;
            }
            .creator-tools {
                margin: 10px 0;
            }
            .spot-form {
                margin-top: 20px;
                padding: 15px;
                background: #f5f5f5;
                border-radius: 5px;
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
                        <h4 id="quizTitle"></h4>
                        <div class="quiz-container">
                            <img id="quizImage" class="quiz-image" src="" alt="Quiz Diagram">
                            <div id="hiddenSpotsContainer"></div>
                        </div>
                        <div class="answer-input">
                            <div class="input-group mb-3">
                                <input type="text" id="answerInput" class="form-control" placeholder="Enter your answer">
                                <button class="btn btn-primary" id="submitAnswer">Submit</button>
                            </div>
                            <div id="answerFeedback"></div>
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
                    </div>
                    <div class="creator-canvas">
                        <img id="creatorImagePreview" style="max-width: 100%; display: none;">
                        <canvas id="creatorCanvas"></canvas>
                    </div>
                    <div id="spotFormsContainer"></div>
                    <button class="btn btn-success" id="saveQuiz">Save Quiz</button>
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

    const quizList = document.getElementById('quizList');
    const quizSelection = document.getElementById('quizSelection');
    const quizInterface = document.getElementById('quizInterface');
    const quizTitle = document.getElementById('quizTitle');
    const quizImage = document.getElementById('quizImage');
    const hiddenSpotsContainer = document.getElementById('hiddenSpotsContainer');
    const answerInput = document.getElementById('answerInput');
    const submitAnswer = document.getElementById('submitAnswer');
    const answerFeedback = document.getElementById('answerFeedback');
    const revealAll = document.getElementById('revealAll');
    const backToQuizzes = document.getElementById('backToQuizzes');
    const quizTitleInput = document.getElementById('quizTitleInput');
    const quizImageUpload = document.getElementById('quizImageUpload');
    const addSpot = document.getElementById('addSpot');
    const removeSpot = document.getElementById('removeSpot');
    const creatorImagePreview = document.getElementById('creatorImagePreview');
    const creatorCanvas = document.getElementById('creatorCanvas');
    const spotFormsContainer = document.getElementById('spotFormsContainer');
    const saveQuiz = document.getElementById('saveQuiz');

    // Initialize canvas
    canvasCtx = creatorCanvas.getContext('2d');
    creatorCanvas.width = 800;
    creatorCanvas.height = 600;

    // Load quizzes list
    loadQuizzes();

    // Event listeners
    submitAnswer.addEventListener('click', checkAnswer);
    revealAll.addEventListener('click', revealAllAnswers);
    backToQuizzes.addEventListener('click', () => {
        quizInterface.style.display = 'none';
        quizSelection.style.display = 'block';
    });
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
                `;
                quizCard.addEventListener('click', () => loadQuiz(quiz.id));
                quizList.appendChild(quizCard);
            });
        });
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
            
            // Wait for image to load before rendering spots
            quizImage.onload = function() {
                hiddenSpots = data.hidden_spots;
                currentSpotIndex = 0;
                renderHiddenSpots();
            };
            
            quizSelection.style.display = 'none';
            quizInterface.style.display = 'block';
            answerFeedback.innerHTML = '';
            answerInput.value = '';
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
            spotElement.addEventListener('click', () => {
                currentSpotIndex = index;
                answerInput.focus();
            });
            hiddenSpotsContainer.appendChild(spotElement);
        });
    }

    function checkAnswer() {
        const answer = answerInput.value.trim();
        if (!answer) return;

        fetch('/plugin/diagram_quiz', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `action=check_answer&quiz_id=${currentQuiz.id}&spot_index=${currentSpotIndex}&answer=${encodeURIComponent(answer)}`
        })
        .then(response => response.json())
        .then(data => {
            if (data.is_correct) {
                answerFeedback.innerHTML = `<div class="alert alert-success">Correct! The answer is: ${data.correct_answer}</div>`;
                // Move to next spot
                currentSpotIndex = (currentSpotIndex + 1) % hiddenSpots.length;
            } else {
                answerFeedback.innerHTML = `<div class="alert alert-danger">Incorrect. Try again!</div>`;
            }
            answerInput.value = '';
        });
    }

    function revealAllAnswers() {
        fetch('/plugin/diagram_quiz', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `action=reveal_all&quiz_id=${currentQuiz.id}`
        })
        .then(response => response.json())
        .then(data => {
            let feedback = '<h5>All Answers:</h5><ul>';
            data.hidden_spots.forEach((spot, index) => {
                feedback += `<li>Spot ${index + 1}: ${spot.answer}</li>`;
            });
            feedback += '</ul>';
            answerFeedback.innerHTML = feedback;
        });
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
                
                // Show preview (scaled down)
                creatorImagePreview.src = event.target.result;
                creatorImagePreview.style.display = 'block';
                creatorImagePreview.style.maxWidth = '100%';
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
        
        canvasCtx.fillStyle = 'pink';
        canvasCtx.fillRect(currentSpot.startX, currentSpot.startY, currentSpot.width, currentSpot.height);
        canvasCtx.strokeStyle = 'red';
        canvasCtx.strokeRect(currentSpot.startX, currentSpot.startY, currentSpot.width, currentSpot.height);
    }

    function handleCanvasMouseUp(e) {
        if (!currentSpot || !currentSpot.drawing) return;
        
        currentSpot.drawing = false;
        
        // Add spot form
        addSpotForm(currentSpot.startX, currentSpot.startY, currentSpot.width, currentSpot.height);
    }

    function addSpotForm(x, y, width, height) {
        const spotId = hiddenSpots.length;
        const spotForm = document.createElement('div');
        spotForm.className = 'spot-form';
        spotForm.innerHTML = `
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
        spotFormsContainer.appendChild(spotForm);
        
        // Add to hidden spots array (answer will be updated when saving)
        hiddenSpots.push({
            x: x,
            y: y,
            width: width,
            height: height,
            answer: ''
        });
    }

    function removeLastSpot() {
        if (hiddenSpots.length === 0) return;
        
        hiddenSpots.pop();
        spotFormsContainer.removeChild(spotFormsContainer.lastChild);
        
        // Redraw canvas
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
            quizTitleInput.value = '';
            quizImageUpload.value = '';
            creatorImagePreview.src = '';
            creatorImagePreview.style.display = 'none';
            spotFormsContainer.innerHTML = '';
            hiddenSpots = [];
            canvasCtx.clearRect(0, 0, creatorCanvas.width, creatorCanvas.height);
            
            // Reload quizzes list
            loadQuizzes();
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error creating quiz');
        });
    }
}