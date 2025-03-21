// Chargement et gestion des données
const dataLoader = {
    // Données chargées
    data: {
        classification: null,
        analyses: null
    },
    
    // Initialiser le chargement des données
    init: function() {
        // Charger les données de classification (versets par livre)
        this.loadClassification();
        
        // Charger les données d'analyses
        this.loadAnalyses();
    },
    
    // Charger la classification des versets par livre
    loadClassification: function() {
        fetch('data/classification.json')
            .then(response => response.json())
            .then(data => {
                this.data.classification = data;
                this.initFeaturedVerses();
                this.updateStats();
            })
            .catch(error => {
                console.error('Erreur lors du chargement de la classification:', error);
            });
    },
    
    // Charger les analyses
    loadAnalyses: function() {
        fetch('data/all_analyses.json')
            .then(response => response.json())
            .then(data => {
                this.data.analyses = data;
            })
            .catch(error => {
                console.error('Erreur lors du chargement des analyses:', error);
            });
    },
    
    // Initialiser les versets mis en avant sur la page d'accueil
    initFeaturedVerses: function() {
        const container = document.getElementById('featured-verses-container');
        if (!container || !this.data.classification) return;
        
        // Sélectionner quelques versets représentatifs
        const featuredVerses = this.getRandomVerses(6);
        
        // Vider le conteneur
        container.innerHTML = '';
        
        // Ajouter les versets au conteneur
        featuredVerses.forEach(verse => {
            const verseCard = this.createVerseCard(verse);
            container.appendChild(verseCard);
        });
    },
    
    // Obtenir des versets aléatoires de différents livres
    getRandomVerses: function(count) {
        if (!this.data.classification) return [];
        
        const allVerses = [];
        
        // Collecter tous les versets
        for (const category in this.data.classification) {
            for (const book in this.data.classification[category]) {
                this.data.classification[category][book].forEach(verse => {
                    allVerses.push(verse);
                });
            }
        }
        
        // Mélanger les versets
        const shuffled = [...allVerses].sort(() => 0.5 - Math.random());
        
        // Retourner le nombre demandé ou tous si moins disponibles
        return shuffled.slice(0, Math.min(count, shuffled.length));
    },
    
    // Créer une carte de verset pour l'affichage
    createVerseCard: function(verse) {
        const card = document.createElement('div');
        card.className = 'verse-card';
        
        const header = document.createElement('div');
        header.className = 'verse-card-header';
        header.innerHTML = `<h3>${verse.Référence}</h3>`;
        
        const body = document.createElement('div');
        body.className = 'verse-card-body';
        
        // Texte du verset (version française soutenue)
        const verseText = document.createElement('p');
        verseText.className = 'verse-text';
        verseText.textContent = verse['Traduction française soutenue'];
        
        // Terme grec
        const term = document.createElement('p');
        term.className = 'verse-term';
        term.textContent = verse['Terme grec'];
        
        // Analyse courte (tronquée)
        const analysis = document.createElement('p');
        analysis.className = 'verse-analysis';
        const fullAnalysis = verse['Analyse'] || '';
        analysis.textContent = fullAnalysis.length > 150 
            ? fullAnalysis.substring(0, 150) + '...' 
            : fullAnalysis;
        
        // Lien vers la page détaillée
        const link = document.createElement('a');
        link.className = 'btn mt-1';
        link.href = this.getVerseDetailUrl(verse);
        link.textContent = i18n.translate('verse.view_details');
        link.setAttribute('data-i18n', 'verse.view_details');
        
        // Assembler la carte
        body.appendChild(verseText);
        body.appendChild(term);
        body.appendChild(analysis);
        body.appendChild(link);
        
        card.appendChild(header);
        card.appendChild(body);
        
        return card;
    },
    
    // Obtenir l'URL de la page détaillée d'un verset
    getVerseDetailUrl: function(verse) {
        const book = verse.Livre.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const reference = verse.Référence.replace(/\s+/g, '_').toLowerCase();
        
        // Déterminer la catégorie (évangile, épître, autre)
        let category = 'epitres'; // par défaut
        
        const evangiles = ['matthieu', 'marc', 'luc', 'jean'];
        if (evangiles.includes(book)) {
            category = 'evangiles';
        }
        
        return `pages/${category}/${book}.html#${reference}`;
    },
    
    // Mettre à jour les statistiques sur la page d'accueil
    updateStats: function() {
        if (!this.data.classification) return;
        
        // Compter le nombre total de versets
        let totalVerses = 0;
        let gospelVerses = 0;
        let epistleVerses = 0;
        let bookCount = 0;
        
        for (const category in this.data.classification) {
            const books = Object.keys(this.data.classification[category]);
            bookCount += books.length;
            
            for (const book of books) {
                const verses = this.data.classification[category][book];
                totalVerses += verses.length;
                
                if (category === 'Évangiles') {
                    gospelVerses += verses.length;
                } else if (category === 'Épîtres') {
                    epistleVerses += verses.length;
                }
            }
        }
        
        // Mettre à jour les éléments HTML
        const totalOccurrencesEl = document.getElementById('total-occurrences');
        const totalBooksEl = document.getElementById('total-books');
        const gospelOccurrencesEl = document.getElementById('gospel-occurrences');
        const epistleOccurrencesEl = document.getElementById('epistle-occurrences');
        
        if (totalOccurrencesEl) totalOccurrencesEl.textContent = totalVerses;
        if (totalBooksEl) totalBooksEl.textContent = bookCount;
        if (gospelOccurrencesEl) gospelOccurrencesEl.textContent = gospelVerses;
        if (epistleOccurrencesEl) epistleOccurrencesEl.textContent = epistleVerses;
    },
    
    // Obtenir les versets d'un livre spécifique
    getBookVerses: function(bookName) {
        if (!this.data.classification) return [];
        
        for (const category in this.data.classification) {
            for (const book in this.data.classification[category]) {
                if (book.toLowerCase() === bookName.toLowerCase()) {
                    return this.data.classification[category][book];
                }
            }
        }
        
        return [];
    },
    
    // Obtenir les données d'une analyse spécifique
    getAnalysis: function(analysisName) {
        if (!this.data.analyses) return null;
        
        for (const analysis in this.data.analyses) {
            if (analysis.toLowerCase().includes(analysisName.toLowerCase())) {
                return this.data.analyses[analysis];
            }
        }
        
        return null;
    }
};

// Initialiser le chargeur de données au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    dataLoader.init();
});
