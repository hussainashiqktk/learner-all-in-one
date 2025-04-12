function loadPlugin(pluginName) {
    if (pluginName !== 'flashcard') return;

    const content = document.getElementById('content');
    content.innerHTML = `
        <div class="flashcard-app container-fluid">
            <ul class="nav nav-tabs mb-4" id="flashcardTabs" role="tablist">
                <li class="nav-item" role="presentation">
                    <button class="nav-link active" id="study-tab" data-bs-toggle="tab" data-bs-target="#study" type="button">Study</button>
                </li>
                <li class="nav-item" role="presentation">
                    <button class="nav-link" id="create-tab" data-bs-toggle="tab" data-bs-target="#create" type="button">Create</button>
                </li>
                <li class="nav-item" role="presentation">
                    <button class="nav-link" id="stats-tab" data-bs-toggle="tab" data-bs-target="#stats" type="button">Statistics</button>
                </li>
                <li class="nav-item" role="presentation">
                    <button class="nav-link" id="import-export-tab" data-bs-toggle="tab" data-bs-target="#import-export" type="button">Import/Export</button>
                </li>
            </ul>

            <div class="tab-content">
                <div class="tab-pane fade show active" id="study" role="tabpanel">
                    <div class="study-container">
                        <div class="row">
                            <div class="col-md-8 mx-auto">
                                <div class="card mb-4">
                                    <div class="card-header d-flex justify-content-between align-items-center">
                                        <h5 class="mb-0">Review Cards</h5>
                                        <div>
                                            <select id="categoryFilter" class="form-select form-select-sm" style="width: auto; display: inline-block;">
                                                <option value="all">All Categories</option>
                                            </select>
                                            <span id="dueCount" class="badge bg-primary ms-2">0 due</span>
                                        </div>
                                    </div>
                                    <div class="card-body text-center">
                                        <div id="flashcard" class="flashcard-card mb-4">
                                            <div class="card-inner">
                                                <div class="card-front">
                                                    <div class="card-body d-flex flex-column justify-content-between h-100">
                                                        <div id="cardTextFront" class="card-text flex-grow-1 d-flex align-items-center justify-content-center m-0">Loading cards...</div>
                                                        <div id="cardTagsFront" class="tags-container"></div>
                                                    </div>
                                                </div>
                                                <div class="card-back">
                                                    <div class="card-body d-flex flex-column justify-content-between h-100">
                                                        <div id="cardTextBack" class="card-text flex-grow-1 d-flex align-items-center justify-content-center m-0">Loading cards...</div>
                                                        <div id="cardTagsBack" class="tags-container"></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="difficulty-buttons mb-3">
                                            <small class="text-muted">How well did you know this?</small>
                                            <div class="btn-group w-100">
                                                <button class="btn btn-outline-danger difficulty-btn" data-score="0">0</button>
                                                <button class="btn btn-outline-warning difficulty-btn" data-score="1">1</button>
                                                <button class="btn btn-outline-secondary difficulty-btn" data-score="2">2</button>
                                                <button class="btn btn-outline-info difficulty-btn" data-score="3">3</button>
                                                <button class="btn btn-outline-success difficulty-btn" data-score="4">4</button>
                                                <button class="btn btn-outline-primary difficulty-btn" data-score="5">5</button>
                                            </div>
                                        </div>
                                        <div class="navigation-buttons">
                                            <button id="prevBtn" class="btn btn-secondary me-2">Previous Card</button>
                                            <button id="flipBtn" class="btn btn-info me-2">Flip Card</button>
                                            <button id="nextBtn" class="btn btn-primary">Next Card</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="tab-pane fade" id="create" role="tabpanel">
                    <div class="create-container">
                        <div class="row">
                            <div class="col-md-8 mx-auto">
                                <div class="card">
                                    <div class="card-header">
                                        <h5 class="mb-0">Create New Flashcard</h5>
                                    </div>
                                    <div class="card-body">
                                        <form id="flashcardForm">
                                            <div class="mb-3">
                                                <label for="front" class="form-label">Front (Question, supports Markdown)</label>
                                                <textarea class="form-control" id="front" name="front" rows="3" required></textarea>
                                            </div>
                                            <div class="mb-3">
                                                <label for="back" class="form-label">Back (Answer, supports Markdown)</label>
                                                <textarea class="form-control" id="back" name="back" rows="3" required></textarea>
                                            </div>
                                            <div class="row">
                                                <div class="col-md-6 mb-3">
                                                    <label for="category" class="form-label">Category</label>
                                                    <select class="form-select" id="category" name="category">
                                                        <option value="">Select a category</option>
                                                        <option value="new">Add New Category</option>
                                                    </select>
                                                    <input type="text" class="form-control mt-2" id="newCategory" name="newCategory" placeholder="Enter new category" style="display: none;">
                                                </div>
                                                <div class="col-md-6 mb-3">
                                                    <label for="tags" class="form-label">Tags (comma separated)</label>
                                                    <input type="text" class="form-control" id="tags" name="tags">
                                                </div>
                                            </div>
                                            <input type="hidden" name="action" value="create">
                                            <button type="submit" class="btn btn-primary">Create Flashcard</button>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="tab-pane fade" id="stats" role="tabpanel">
                    <div class="stats-container">
                        <div class="row">
                            <div class="col-md-8 mx-auto">
                                <div class="card">
                                    <div class="card-header">
                                        <h5 class="mb-0">Your Learning Statistics</h5>
                                    </div>
                                    <div class="card-body">
                                        <div class="row">
                                            <div class="col-md-6">
                                                <div class="card mb-3">
                                                    <div class="card-body">
                                                        <h6 class="card-title">Study Sessions</h6>
                                                        <h2 id="sessionCount" class="display-4">0</h2>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="col-md-6">
                                                <div class="card mb-3">
                                                    <div class="card-body">
                                                        <h6 class="card-title">Cards Mastered</h6>
                                                        <h2 id="cardsLearned" class="display-4">0</h2>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="tab-pane fade" id="import-export" role="tabpanel">
                    <div class="import-export-container">
                        <div class="row">
                            <div class="col-md-8 mx-auto">
                                <div class="card">
                                    <div class="card-header">
                                        <h5 class="mb-0">Import & Export Flashcards</h5>
                                    </div>
                                    <div class="card-body">
                                        <div class="mb-4">
                                            <h6>Export Flashcards</h6>
                                            <button id="exportBtn" class="btn btn-success">Export All Flashcards</button>
                                            <small class="text-muted d-block mt-1">Download a JSON file of all your flashcards</small>
                                        </div>
                                        <div>
                                            <h6>Import Flashcards</h6>
                                            <form id="importForm">
                                                <div class="mb-3">
                                                    <input class="form-control" type="file" id="importFile" accept=".json">
                                                </div>
                                                <button type="submit" class="btn btn-primary">Import Flashcards</button>
                                                <small class="text-muted d-block mt-1">Warning: This will overwrite your current flashcards</small>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Load marked.js dynamically
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/marked/marked.min.js';
    script.onload = initFlashcardApp;
    document.head.appendChild(script);
}

function initFlashcardApp() {
    // Check if marked is loaded
    if (typeof marked === 'undefined') {
        console.error('marked.js is not loaded');
        return;
    }

    let cards = [];
    let currentCardIndex = 0;
    let isFlipped = false;
    let categories = [];
    let statistics = {};

    const flashcardElement = document.getElementById('flashcard');
    const cardTextFront = document.getElementById('cardTextFront');
    const cardTextBack = document.getElementById('cardTextBack');
    const cardTagsFront = document.getElementById('cardTagsFront');
    const cardTagsBack = document.getElementById('cardTagsBack');
    const flipBtn = document.getElementById('flipBtn');
    const nextBtn = document.getElementById('nextBtn');
    const prevBtn = document.getElementById('prevBtn');
    const difficultyBtns = document.querySelectorAll('.difficulty-btn');
    const categoryFilter = document.getElementById('categoryFilter');
    const dueCount = document.getElementById('dueCount');
    const categorySelect = document.getElementById('category');
    const newCategoryInput = document.getElementById('newCategory');
    const flashcardForm = document.getElementById('flashcardForm');
    const sessionCount = document.getElementById('sessionCount');
    const cardsLearned = document.getElementById('cardsLearned');
    const exportBtn = document.getElementById('exportBtn');
    const importForm = document.getElementById('importForm');
    const importFile = document.getElementById('importFile');

    loadData();

    flashcardElement.addEventListener('click', flipCard);
    flipBtn.addEventListener('click', flipCard);
    nextBtn.addEventListener('click', showNextCard);
    prevBtn.addEventListener('click', showPreviousCard);
    difficultyBtns.forEach(btn => {
        btn.addEventListener('click', () => rateCard(parseInt(btn.dataset.score)));
    });
    categoryFilter.addEventListener('change', filterCards);
    flashcardForm.addEventListener('submit', handleFormSubmit);
    exportBtn.addEventListener('click', exportFlashcards);
    importForm.addEventListener('submit', handleImport);

    categorySelect.addEventListener('change', () => {
        if (categorySelect.value === 'new') {
            newCategoryInput.style.display = 'block';
            newCategoryInput.focus();
        } else {
            newCategoryInput.style.display = 'none';
        }
    });

    async function loadData() {
        try {
            const response = await fetch('/plugin/flashcard', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: 'action=get_due_cards'
            });
            if (!response.ok) throw new Error('Failed to fetch cards');
            const data = await response.json();
            cards = data.cards || [];
            categories = data.categories || [];
            statistics = data.statistics || {};
            updateUI();
            populateCategoryFilters();
            updateStatistics();
            if (cards.length > 0) {
                displayCurrentCard();
            } else {
                cardTextFront.innerHTML = 'No cards available.';
                cardTextBack.innerHTML = 'Create some cards!';
            }
        } catch (error) {
            console.error('Error loading flashcards:', error);
            showMessage('Error loading flashcards', 'danger');
        }
    }

    function updateUI() {
        dueCount.textContent = `${cards.length} cards`;
    }

    function populateCategoryFilters() {
        categoryFilter.innerHTML = '<option value="all">All Categories</option>';
        categorySelect.innerHTML = '<option value="">Select a category</option><option value="new">Add New Category</option>';
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categoryFilter.appendChild(option.cloneNode(true));
            categorySelect.appendChild(option);
        });
        const lastCategory = localStorage.getItem('lastFlashcardCategory');
        if (lastCategory && categories.includes(lastCategory)) {
            categorySelect.value = lastCategory;
        }
    }

    function displayCurrentCard() {
        if (cards.length === 0) return;
        const card = cards[currentCardIndex];
        // Render Markdown using marked.js
        cardTextFront.innerHTML = marked.parse(card.front);
        cardTextBack.innerHTML = marked.parse(card.back);
        [cardTagsFront, cardTagsBack].forEach(tagsElement => {
            tagsElement.innerHTML = '';
            if (card.tags && card.tags.length > 0) {
                card.tags.forEach(tag => {
                    const tagElement = document.createElement('span');
                    tagElement.className = 'badge bg-secondary me-1';
                    tagElement.textContent = tag;
                    tagsElement.appendChild(tagElement);
                });
            }
            const categoryElement = document.createElement('span');
            categoryElement.className = 'badge bg-primary';
            categoryElement.textContent = card.category;
            tagsElement.appendChild(categoryElement);
        });
        flashcardElement.classList.remove('flipped');
    }

    function flipCard() {
        if (cards.length === 0) return;
        isFlipped = !isFlipped;
        flashcardElement.classList.toggle('flipped');
    }

    function showNextCard() {
        if (cards.length === 0) return;
        currentCardIndex = (currentCardIndex + 1) % cards.length;
        isFlipped = false;
        displayCurrentCard();
    }

    function showPreviousCard() {
        if (cards.length === 0) return;
        currentCardIndex = (currentCardIndex - 1 + cards.length) % cards.length;
        isFlipped = false;
        displayCurrentCard();
    }

    async function rateCard(score) {
        if (cards.length === 0) return;
        const cardId = cards[currentCardIndex].id;
        try {
            const response = await fetch('/plugin/flashcard', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                    'action': 'review',
                    'card_id': cardId,
                    'score': score
                })
            });
            if (response.ok) {
                showNextCard();
                loadData();
            }
        } catch (error) {
            console.error('Error rating card:', error);
            showMessage('Error saving your rating', 'danger');
        }
    }

    function filterCards() {
        const selectedCategory = categoryFilter.value;
        if (selectedCategory === 'all') {
            loadData();
        } else {
            fetch('/plugin/flashcard', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: 'action=get_due_cards'
            })
            .then(response => response.json())
            .then(data => {
                cards = data.cards.filter(card => card.category === selectedCategory);
                currentCardIndex = 0;
                isFlipped = false;
                updateUI();
                if (cards.length > 0) {
                    displayCurrentCard();
                } else {
                    cardTextFront.innerHTML = `No cards in ${selectedCategory}.`;
                    cardTextBack.innerHTML = 'Create some cards!';
                }
            });
        }
    }

    async function handleFormSubmit(e) {
        e.preventDefault();
        const formData = new FormData(flashcardForm);
        const category = formData.get('category');
        const newCategory = formData.get('newCategory');

        if (category === 'new' && newCategory.trim()) {
            formData.set('category', newCategory.trim());
        }
        const selectedCategory = formData.get('category');
        if (selectedCategory) {
            localStorage.setItem('lastFlashcardCategory', selectedCategory);
        }

        try {
            const response = await fetch('/plugin/flashcard', {
                method: 'POST',
                body: formData
            });
            if (!response.ok) {
                const text = await response.text();
                throw new Error(`Server error: ${text}`);
            }
            const data = await response.json();
            showMessage('Flashcard created successfully!', 'success');
            flashcardForm.reset();
            newCategoryInput.style.display = 'none';
            categorySelect.value = '';
            loadData();
        } catch (error) {
            console.error('Error:', error);
            showMessage(`Error creating flashcard: ${error.message}`, 'danger');
        }
    }

    function updateStatistics() {
        sessionCount.textContent = statistics.total_study_sessions || '0';
        cardsLearned.textContent = statistics.cards_learned || '0';
    }

    function exportFlashcards() {
        fetch('/plugin/flashcard', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: 'action=export'
        })
        .then(response => response.json())
        .then(data => {
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `flashcards_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        });
    }

    function handleImport(e) {
        e.preventDefault();
        if (!importFile.files.length) {
            showMessage('Please select a file to import', 'warning');
            return;
        }
        const file = importFile.files[0];
        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const data = JSON.parse(event.target.result);
                const formData = new FormData();
                formData.append('action', 'import');
                formData.append('file', new Blob([JSON.stringify(data)], { type: 'application/json' }), file.name);
                const response = await fetch('/plugin/flashcard', {
                    method: 'POST',
                    body: formData
                });
                if (response.ok) {
                    showMessage('Flashcards imported successfully!', 'success');
                    loadData();
                } else {
                    const error = await response.json();
                    showMessage(error.error || 'Error importing flashcards', 'danger');
                }
            } catch (error) {
                console.error('Error importing:', error);
                showMessage('Invalid file format', 'danger');
            }
        };
        reader.readAsText(file);
    }

    function showMessage(message, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `alert alert-${type} alert-dismissible fade show`;
        messageDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        const container = document.querySelector('.flashcard-app');
        container.prepend(messageDiv);
        setTimeout(() => {
            messageDiv.classList.remove('show');
            setTimeout(() => messageDiv.remove(), 150);
        }, 3000);
    }
}