// ============================================
// DETAILS PAGE MANAGER - MELHORADO 🚀
// ============================================

class DetailsPageManager {
    constructor() {
        this.currentItem = null;
        this.allItems = [];
        this.init();
    }

    async init() {
        // Create purple particles (NÃO MEXER!)
        this.createParticles();
        
        // Get URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        let type = urlParams.get('type');
        let category = urlParams.get('category');
        let id = urlParams.get('id');

        console.log('Details Page - URL Params:', { type, category, id });

        // Se não há parâmetros na URL, tenta carregar do localStorage
        if (!type || !category || !id) {
            console.log('No URL params, trying localStorage...');
            const savedItem = this.getSavedItem();
            
            if (savedItem) {
                type = savedItem.type;
                category = savedItem.category;
                id = savedItem.id;
                console.log('Loaded from localStorage:', savedItem);
            } else {
                console.error('No URL parameters and no saved item');
                this.showError();
                return;
            }
        }

        // Guardar no localStorage antes de carregar
        this.saveCurrentItem(type, category, id);

        // Load item data
        await this.loadItemData(type, category, id);
    }

    // Guardar item atual no localStorage
    saveCurrentItem(type, category, id) {
        const itemData = {
            type: type,
            category: category,
            id: id,
            timestamp: Date.now()
        };
        
        try {
            localStorage.setItem('currentDetailsItem', JSON.stringify(itemData));
            console.log('Saved to localStorage:', itemData);
        } catch (error) {
            console.error('Error saving to localStorage:', error);
        }
    }

    // Recuperar item guardado do localStorage
    getSavedItem() {
        try {
            const saved = localStorage.getItem('currentDetailsItem');
            if (saved) {
                return JSON.parse(saved);
            }
        } catch (error) {
            console.error('Error reading from localStorage:', error);
        }
        return null;
    }

    // Create animated purple particles (NÃO MEXER!)
    createParticles() {
        const container = document.getElementById('detailsParticlesContainer');
        if (!container) return;

        const particleCount = 60;
        const colors = [
            'rgba(102, 126, 234, 0.4)',
            'rgba(139, 92, 246, 0.4)',
            'rgba(118, 75, 162, 0.4)',
            'rgba(124, 58, 237, 0.4)'
        ];

        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'details-particle';
            
            const size = Math.random() * 5 + 3;
            particle.style.width = size + 'px';
            particle.style.height = size + 'px';
            
            const color = colors[Math.floor(Math.random() * colors.length)];
            particle.style.background = color;
            particle.style.boxShadow = `0 0 ${size * 2}px ${color}`;
            
            particle.style.left = Math.random() * 100 + '%';
            particle.style.top = Math.random() * 100 + '%';
            
            const duration = Math.random() * 10 + 15;
            const delay = Math.random() * 5;
            particle.style.animationDuration = duration + 's';
            particle.style.animationDelay = delay + 's';
            
            container.appendChild(particle);
        }
    }

    // Get correct JSON path
    getJsonPath(category, type) {
        const paths = {
            'economy_films': 'json/data_film_econ.json',
            'economy_shows': 'json/data_shows_econ.json',
            'economy_books': 'json/data_books_econ.json',
            'environment_films': 'json/data_film_envrn.json',
            'environment_shows': 'json/data_shows_envrn.json',
            'environment_books': 'json/data_books_envrn.json',
            'law_films': 'json/data_film_law.json',
            'law_shows': 'json/data_shows_law.json',
            'law_books': 'json/data_books_law.json'
        };
        
        const key = `${category}_${type}`;
        return paths[key] || 'json/data_film_econ.json';
    }

    // Load item data from JSON
    async loadItemData(type, category, id) {
        try {
            const jsonPath = this.getJsonPath(category, type);
            console.log('Loading from:', jsonPath);
            
            const response = await fetch(jsonPath);
            if (!response.ok) throw new Error('Failed to load data');
            
            const data = await response.json();
            this.allItems = data;
            
            const item = data.find(item => item.id == id);
            
            if (!item) {
                console.error('Item not found with ID:', id);
                this.showError();
                return;
            }

            // Ensure item has type and category
            item.type = type;
            item.category = category;

            console.log('Item loaded:', item);

            this.currentItem = item;
            this.displayItem(item);
            this.loadRelatedItems(type, category, id);
            
            // Limpar URL para ficar clean (remover parâmetros)
            this.cleanURL();
            
        } catch (error) {
            console.error('Error loading item:', error);
            this.showError();
        }
    }

    // Limpar URL - remover parâmetros para ficar só details.html
    cleanURL() {
        if (window.history && window.history.replaceState) {
            const cleanUrl = window.location.pathname;
            window.history.replaceState({}, document.title, cleanUrl);
            console.log('URL cleaned:', cleanUrl);
        }
    }

    // Display item details
    displayItem(item) {
        console.log('Displaying item:', item);
        
        // Hide loading, show content
        document.getElementById('loadingState').style.display = 'none';
        document.getElementById('detailsContent').classList.remove('hidden');

        // Update breadcrumbs
        this.updateBreadcrumbs(item);

        // Set poster image
        const posterImage = document.getElementById('item-image');
        if (posterImage) {
            posterImage.src = item.image || 'imgs/placeholder.jpg';
            posterImage.alt = item.title;
        }

        // Set category badge
        this.setCategoryBadge(item);

        // Set title
        const title = document.getElementById('item-title');
        if (title) title.textContent = item.title;

        // Update page title
        document.title = `${item.title} | Tec'N'Cool`;

        // Set meta information
        this.setMetaInfo(item);

        // Set synopsis
        const synopsis = document.getElementById('item-synopsis');
        if (synopsis) {
            // SHOWS usam "storyline", FILMS e BOOKS usam "synopsis"
            const synopsisText = item.storyline || item.synopsis;
            if (synopsisText) {
                synopsis.textContent = synopsisText;
            } else {
                synopsis.textContent = 'No synopsis available.';
            }
        }

        // Set action buttons
        this.setActionButtons(item);

        // Set type-specific details
        if (item.type === 'films' || item.type === 'shows') {
            this.setFilmShowDetails(item);
        } else if (item.type === 'books') {
            this.setBookDetails(item);
        }
        
        console.log('Item display completed');
    }

    // Update breadcrumbs
    updateBreadcrumbs(item) {
        const breadcrumbCategory = document.getElementById('breadcrumb-category');
        const breadcrumbItem = document.getElementById('breadcrumb-item');

        if (breadcrumbCategory) {
            const categoryName = this.getCategoryName(item.category);
            breadcrumbCategory.textContent = categoryName;
            breadcrumbCategory.href = `catalog.html?type=all&category=${item.category}`;
        }

        if (breadcrumbItem) {
            breadcrumbItem.textContent = item.title;
        }
    }

    // Get category display name
    getCategoryName(category) {
        const names = {
            'economy': 'Economy & Culture',
            'environment': 'Environment & Culture',
            'law': 'Law & Culture'
        };
        return names[category] || 'Catalog';
    }

    // Set category badge
    setCategoryBadge(item) {
        const badge = document.getElementById('categoryBadge');
        if (!badge) return;

        const icons = {
            'economy': '<i class="fa-solid fa-briefcase"></i>',
            'environment': '<i class="fa-solid fa-earth-americas"></i>',
            'law': '<i class="fa-solid fa-scale-balanced"></i>'
        };

        const names = {
            'economy': 'Economy & Culture',
            'environment': 'Environment & Culture',
            'law': 'Law & Culture'
        };

        const icon = badge.querySelector('.badge-icon');
        const text = badge.querySelector('.badge-text');

        if (icon) icon.innerHTML = icons[item.category] || '<i class="fa-solid fa-book"></i>';
        if (text) text.textContent = names[item.category] || 'Culture';
    }

    // Set meta information
    setMetaInfo(item) {
        const metaYear = document.getElementById('metaYear');
        const metaType = document.getElementById('metaType');
        const metaGenre = document.getElementById('metaGenre');

        // ==============================================
        // YEAR - DIFERENTE PARA BOOKS!
        // ==============================================
        if (metaYear) {
            let year = '';
            
            // BOOKS usam "publication_year" (string "2017")
            if (item.type === 'books') {
                year = item.publication_year || '';
                
                // Se publication_year não existir, tenta publication_date
                if (!year && item.publication_date) {
                    if (typeof item.publication_date === 'string') {
                        const date = new Date(item.publication_date);
                        year = date.getFullYear();
                        if (isNaN(year)) {
                            const yearMatch = item.publication_date.match(/\d{4}/);
                            if (yearMatch) year = yearMatch[0];
                        }
                    } else {
                        year = item.publication_date;
                    }
                }
            } 
            // FILMS e SHOWS usam "release_date"
            else {
                const dateField = item.release_date;
                if (dateField) {
                    if (typeof dateField === 'string') {
                        const date = new Date(dateField);
                        year = date.getFullYear();
                        if (isNaN(year)) {
                            const yearMatch = dateField.match(/\d{4}/);
                            if (yearMatch) year = yearMatch[0];
                        }
                    } else {
                        year = dateField;
                    }
                }
            }
            
            metaYear.textContent = year || 'N/A';
        }

        // Type
        if (metaType) {
            const typeIcons = {
                'films': '<i class="fa-solid fa-film"></i> Film',
                'shows': '<i class="fa-solid fa-tv"></i> Series',
                'books': '<i class="fa-solid fa-book"></i> Book'
            };
            metaType.innerHTML = typeIcons[item.type] || item.type;
        }

        // Genre
        if (metaGenre) {
            if (Array.isArray(item.genre)) {
                metaGenre.textContent = item.genre.join(', ');
            } else if (item.genre) {
                metaGenre.textContent = item.genre;
            } else {
                // Para books sem genre, não mostrar nada ou mostrar "Fiction"
                metaGenre.textContent = '';
                // Esconder o divider antes se não há genre
                const metaRow = document.getElementById('metaRow');
                if (metaRow && !item.genre) {
                    const dividers = metaRow.querySelectorAll('.meta-divider');
                    if (dividers[1]) dividers[1].style.display = 'none';
                }
            }
        }
    }

    // Set action buttons
    setActionButtons(item) {
        // Trailer button (for films/shows)
        const trailerBtn = document.getElementById('item-trailer');
        if (trailerBtn) {
            if (item.trailer && (item.type === 'films' || item.type === 'shows')) {
                trailerBtn.href = item.trailer;
                trailerBtn.classList.remove('hidden');
            } else {
                trailerBtn.classList.add('hidden');
            }
        }

        // More info button (for books)
        const moreInfoBtn = document.getElementById('item-more-info');
        if (moreInfoBtn) {
            if (item.more_info && item.type === 'books') {
                moreInfoBtn.href = item.more_info;
                moreInfoBtn.classList.remove('hidden');
            } else {
                moreInfoBtn.classList.add('hidden');
            }
        }
    }

    // Set film/show details - MAPEAMENTO CORRETO DOS CAMPOS JSON!
    setFilmShowDetails(item) {
        const container = document.getElementById('filmShowDetails');
        if (!container) return;

        container.classList.remove('hidden');

        console.log('Setting film/show details:', item);

        // ==============================================
        // DIRECTOR/CREATOR
        // Films usam: "director"
        // Shows usam: "creator"
        // ==============================================
        const directorElement = document.getElementById('item-director');
        if (directorElement) {
            const directorValue = item.creator || item.director || item.directors;
            directorElement.textContent = directorValue || 'N/A';
        }

        // ==============================================
        // CAST (sempre array nos JSONs)
        // ==============================================
        const castElement = document.getElementById('item-cast');
        if (castElement) {
            if (Array.isArray(item.cast)) {
                castElement.textContent = item.cast.join(', ');
            } else if (item.actors) {
                castElement.textContent = item.actors;
            } else {
                castElement.textContent = 'N/A';
            }
        }

        // ==============================================
        // PRODUCTION (igual para films e shows)
        // ==============================================
        const productionElement = document.getElementById('item-production');
        if (productionElement) {
            const prodValue = item.production || item.production_house;
            productionElement.textContent = (prodValue && prodValue !== '-' && prodValue !== '') ? prodValue : 'N/A';
        }

        // ==============================================
        // RELEASE DATE (igual para films e shows)
        // ==============================================
        const releaseElement = document.getElementById('item-release');
        if (releaseElement) {
            if (item.release_date) {
                const date = new Date(item.release_date);
                if (!isNaN(date.getTime())) {
                    releaseElement.textContent = date.toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                    });
                } else {
                    releaseElement.textContent = item.release_date;
                }
            } else {
                releaseElement.textContent = 'N/A';
            }
        }

        // ==============================================
        // GENRE (sempre array nos JSONs)
        // ==============================================
        const genreElement = document.getElementById('item-genre');
        if (genreElement) {
            if (Array.isArray(item.genre)) {
                genreElement.textContent = item.genre.join(', ');
            } else if (item.genre) {
                genreElement.textContent = item.genre;
            } else {
                genreElement.textContent = 'N/A';
            }
        }

        // ==============================================
        // DISTRIBUTION (só para films)
        // ==============================================
        const distributionElement = document.getElementById('item-distribution');
        if (distributionElement) {
            const distValue = item.distribution || item.distributor;
            distributionElement.textContent = (distValue && distValue !== '-' && distValue !== '') ? distValue : 'N/A';
        }

        // ==============================================
        // SCREENWRITING/EXECUTIVE PRODUCERS
        // Films usam: "screenwriting"
        // Shows usam: "executive_producers"
        // ==============================================
        const screenwritingElement = document.getElementById('item-screenwriting');
        if (screenwritingElement) {
            const value = item.screenwriting || item.screenplay || item.writer || item.executive_producers;
            screenwritingElement.textContent = (value && value !== '-' && value !== '') ? value : 'N/A';
        }
    }

    // Set book details - MAPEAMENTO CORRETO DOS CAMPOS JSON!
    setBookDetails(item) {
        const container = document.getElementById('bookDetails');
        if (!container) return;

        container.classList.remove('hidden');

        console.log('Setting book details:', item);

        // ==============================================
        // AUTHOR (campo "author" no JSON)
        // ==============================================
        const authorElement = document.getElementById('item-author');
        if (authorElement) {
            authorElement.textContent = item.author || 'N/A';
        }

        // ==============================================
        // PUBLISHER (campo "publisher" no JSON)
        // ==============================================
        const publisherElement = document.getElementById('item-publisher');
        if (publisherElement) {
            publisherElement.textContent = item.publisher || 'N/A';
        }

        // ==============================================
        // PUBLICATION YEAR
        // JSON usa: "publication_year" (string "2017")
        // NÃO usa "publication_date"!
        // ==============================================
        const pubYearElement = document.getElementById('item-publication-year');
        if (pubYearElement) {
            // Tenta publication_year primeiro, depois publication_date como fallback
            const yearValue = item.publication_year || item.publication_date;
            
            if (yearValue) {
                // Se é uma string tipo "2017", usa diretamente
                if (typeof yearValue === 'string' && yearValue.match(/^\d{4}$/)) {
                    pubYearElement.textContent = yearValue;
                } 
                // Se é uma data completa, extrai o ano
                else if (typeof yearValue === 'string') {
                    const date = new Date(yearValue);
                    const year = date.getFullYear();
                    pubYearElement.textContent = isNaN(year) ? yearValue : year;
                } 
                // Se é um número
                else {
                    pubYearElement.textContent = yearValue;
                }
            } else {
                pubYearElement.textContent = 'N/A';
            }
        }

        // ==============================================
        // LANGUAGE
        // JSON usa: "original_language" (não "language"!)
        // ==============================================
        const languageElement = document.getElementById('item-language');
        if (languageElement) {
            languageElement.textContent = item.original_language || item.language || 'N/A';
        }

        // ==============================================
        // ISBN
        // JSON usa: "ISBN" (UPPERCASE, não "isbn"!)
        // ==============================================
        const isbnElement = document.getElementById('item-isbn');
        if (isbnElement) {
            isbnElement.textContent = item.ISBN || item.isbn || 'N/A';
        }
    }

    // Load related items
    async loadRelatedItems(type, category, currentId) {
        const relatedContainer = document.getElementById('relatedItems');
        if (!relatedContainer) return;

        // Filter related items (5 items)
        const relatedItems = this.allItems
            .filter(item => item.id != currentId)
            .sort(() => 0.5 - Math.random())
            .slice(0, 5);

        if (relatedItems.length === 0) {
            document.getElementById('relatedSection').style.display = 'none';
            return;
        }

        relatedContainer.innerHTML = '';

        relatedItems.forEach(item => {
            const relatedDiv = document.createElement('div');
            relatedDiv.className = 'related-item';

            const img = document.createElement('img');
            img.src = item.image || 'imgs/placeholder.jpg';
            img.alt = item.title;
            img.loading = 'lazy';

            const title = document.createElement('div');
            title.className = 'related-item-title';
            title.textContent = item.title;

            relatedDiv.appendChild(img);
            relatedDiv.appendChild(title);

            relatedDiv.addEventListener('click', () => {
                window.location.href = `details.html?type=${type}&category=${category}&id=${item.id}`;
            });

            relatedContainer.appendChild(relatedDiv);
        });
    }

    // Show error state
    showError() {
        document.getElementById('loadingState').style.display = 'none';
        document.getElementById('errorState').classList.remove('hidden');
    }
}

// ============================================
// SHARE FUNCTIONALITY
// ============================================

function shareItem(platform) {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(document.getElementById('item-title')?.textContent || 'Check this out!');
    
    let shareUrl = '';
    
    switch(platform) {
        case 'facebook':
            shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
            break;
        case 'twitter':
            shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${title}`;
            break;
        case 'linkedin':
            shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
            break;
    }
    
    if (shareUrl) {
        window.open(shareUrl, '_blank', 'width=600,height=400');
    }
}

function copyLink() {
    const url = window.location.href;
    
    if (navigator.clipboard) {
        navigator.clipboard.writeText(url).then(() => {
            showCopyNotification();
        }).catch(err => {
            console.error('Failed to copy:', err);
        });
    } else {
        // Fallback
        const textArea = document.createElement('textarea');
        textArea.value = url;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.select();
        
        try {
            document.execCommand('copy');
            showCopyNotification();
        } catch (err) {
            console.error('Failed to copy:', err);
        }
        
        document.body.removeChild(textArea);
    }
}

function showCopyNotification() {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        color: white;
        padding: 16px 24px;
        border-radius: 12px;
        font-weight: 600;
        box-shadow: 0 10px 30px rgba(16, 185, 129, 0.4);
        z-index: 3000;
        animation: slideIn 0.3s ease-out;
    `;
    notification.textContent = '✓ Link copied to clipboard!';
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 2000);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// ============================================
// INITIALIZE
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    new DetailsPageManager();
});