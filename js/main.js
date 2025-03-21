// Script principal
document.addEventListener('DOMContentLoaded', () => {
    // Initialiser les dropdowns pour mobile
    initMobileDropdowns();
    
    // Ajouter des écouteurs d'événements pour les interactions
    setupEventListeners();
});

// Initialiser les dropdowns pour mobile
function initMobileDropdowns() {
    const dropdowns = document.querySelectorAll('.dropdown');
    
    dropdowns.forEach(dropdown => {
        const link = dropdown.querySelector('a');
        
        // Sur mobile, transformer le clic sur le lien en toggle du dropdown
        link.addEventListener('click', (e) => {
            // Vérifier si on est sur mobile (max-width: 768px)
            if (window.innerWidth <= 768) {
                e.preventDefault();
                dropdown.classList.toggle('active');
                
                // Fermer les autres dropdowns
                dropdowns.forEach(other => {
                    if (other !== dropdown) {
                        other.classList.remove('active');
                    }
                });
            }
        });
    });
    
    // Fermer les dropdowns quand on clique ailleurs
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.dropdown')) {
            dropdowns.forEach(dropdown => {
                dropdown.classList.remove('active');
            });
        }
    });
}

// Configurer les écouteurs d'événements
function setupEventListeners() {
    // Écouter les changements de taille d'écran pour réinitialiser les dropdowns
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            document.querySelectorAll('.dropdown').forEach(dropdown => {
                dropdown.classList.remove('active');
            });
        }
    });
    
    // Ajouter des écouteurs pour les filtres si présents
    const filterForm = document.getElementById('filter-form');
    if (filterForm) {
        filterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            applyFilters();
        });
    }
}

// Appliquer les filtres sur les pages de versets
function applyFilters() {
    const termFilter = document.getElementById('term-filter').value.toLowerCase();
    const verseCards = document.querySelectorAll('.verse-card');
    
    verseCards.forEach(card => {
        const term = card.querySelector('.verse-term').textContent.toLowerCase();
        
        if (termFilter === '' || term.includes(termFilter)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Fonction pour naviguer vers un livre spécifique
function navigateToBook(bookName, category) {
    const normalizedBook = bookName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    window.location.href = `pages/${category}/${normalizedBook}.html`;
}

// Fonction pour afficher un message de chargement
function showLoading(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = '<div class="loading">Chargement...</div>';
    }
}

// Fonction pour masquer un message de chargement
function hideLoading(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        const loading = element.querySelector('.loading');
        if (loading) {
            loading.remove();
        }
    }
}

// Fonction pour mettre en évidence les termes recherchés
function highlightTerms(text, term) {
    if (!term) return text;
    
    const regex = new RegExp(`(${term})`, 'gi');
    return text.replace(regex, '<span class="highlight">$1</span>');
}

// Fonction pour créer un fil d'Ariane
function createBreadcrumbs(path) {
    const parts = path.split('/');
    let html = '<div class="breadcrumbs">';
    html += `<a href="/">${i18n.translate('nav.home')}</a>`;
    
    let currentPath = '';
    for (let i = 0; i < parts.length; i++) {
        if (parts[i]) {
            currentPath += '/' + parts[i];
            const label = i18n.translate(`breadcrumbs.${parts[i]}`) || parts[i];
            
            if (i === parts.length - 1) {
                html += `<span>&gt;</span> ${label}`;
            } else {
                html += `<span>&gt;</span> <a href="${currentPath}">${label}</a>`;
            }
        }
    }
    
    html += '</div>';
    return html;
}
