// Gestion des traductions
const i18n = {
    currentLang: 'fr',
    translations: {},
    
    // Initialiser le système de traduction
    init: function() {
        // Charger la langue par défaut (français)
        this.loadTranslations('fr');
        
        // Configurer le sélecteur de langue
        const langSelect = document.getElementById('language-select');
        if (langSelect) {
            langSelect.addEventListener('change', (e) => {
                this.setLanguage(e.target.value);
            });
        }
    },
    
    // Charger les traductions pour une langue spécifique
    loadTranslations: function(lang) {
        fetch(`locales/${lang}/translations.json`)
            .then(response => response.json())
            .then(data => {
                this.translations[lang] = data;
                if (lang === this.currentLang) {
                    this.updatePageContent();
                }
            })
            .catch(error => {
                console.error(`Erreur lors du chargement des traductions pour ${lang}:`, error);
                // Fallback vers le français si la langue demandée n'est pas disponible
                if (lang !== 'fr') {
                    this.loadTranslations('fr');
                }
            });
    },
    
    // Définir la langue active
    setLanguage: function(lang) {
        this.currentLang = lang;
        
        // Charger les traductions si elles ne sont pas déjà chargées
        if (!this.translations[lang]) {
            this.loadTranslations(lang);
        } else {
            this.updatePageContent();
        }
        
        // Sauvegarder la préférence de langue
        localStorage.setItem('preferredLanguage', lang);
    },
    
    // Mettre à jour le contenu de la page avec les traductions
    updatePageContent: function() {
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(el => {
            const key = el.getAttribute('data-i18n');
            const translation = this.getTranslation(key);
            
            if (translation) {
                // Si l'élément est un input avec un placeholder
                if (el.tagName === 'INPUT' && el.hasAttribute('placeholder')) {
                    el.placeholder = translation;
                } 
                // Si c'est un élément avec un attribut title
                else if (el.hasAttribute('title')) {
                    el.title = translation;
                }
                // Pour les autres éléments, mettre à jour le contenu
                else {
                    el.innerHTML = translation;
                }
            }
        });
    },
    
    // Obtenir une traduction par sa clé
    getTranslation: function(key) {
        const keys = key.split('.');
        let translation = this.translations[this.currentLang];
        
        // Parcourir l'arborescence des clés
        for (const k of keys) {
            if (translation && translation[k]) {
                translation = translation[k];
            } else {
                return null;
            }
        }
        
        return translation;
    },
    
    // Traduire une chaîne spécifique
    translate: function(key) {
        return this.getTranslation(key) || key;
    }
};

// Initialiser le système de traduction au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    // Vérifier s'il y a une préférence de langue sauvegardée
    const savedLang = localStorage.getItem('preferredLanguage');
    if (savedLang) {
        i18n.currentLang = savedLang;
        document.getElementById('language-select').value = savedLang;
    }
    
    i18n.init();
});
