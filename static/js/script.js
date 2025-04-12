window.loadPlugin = function(pluginName) {
    console.log(`No plugin loaded for ${pluginName}`);
};

document.addEventListener('DOMContentLoaded', function() {
    const searchBar = document.getElementById('searchBar');
    searchBar.addEventListener('keyup', function(e) {
        const searchTerm = e.target.value.toLowerCase();
        const modules = document.querySelectorAll('.nav-item');
        modules.forEach(function(module) {
            const moduleName = module.textContent.toLowerCase();
            if (moduleName.includes(searchTerm)) {
                module.style.display = 'block';
            } else {
                module.style.display = 'none';
            }
        });

        // Search functionality for home page cards
        const cards = document.querySelectorAll('.card');
        cards.forEach(function(card) {
            const cardTitle = card.querySelector('.card-title').textContent.toLowerCase();
            if (cardTitle.includes(searchTerm)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    });
});
