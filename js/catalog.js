// ============================================
// CATALOG MANAGER - WITH SCROLL ANIMATIONS
// ============================================
class CatalogManager {
    constructor() {
        this.allItems = [];
        this.filteredItems = [];
        this.currentPage = 1;
        this.itemsPerPage = 20;
        this.storageKeys = {
            category: 'tecncool_catalog_category',
            type: 'tecncool_catalog_type'
        };
        this.observer = null;
        this.init();
    }

    init() {
        this.createParticles();
        this.checkUrlParams();
        this.loadSavedFilters();
        this.setupEventListeners();
        this.setupScrollObserver();
        this.loadAllData();
    }

    // Setup Intersection Observer for scroll animations
    setupScrollObserver() {
        const options = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    // Add staggered delay for smoother animation
                    setTimeout(() => {
                        entry.target.classList.add('visible');
                    }, index * 50); // 50ms delay between each card
                    
                    this.observer.unobserve(entry.target);
                }
            });
        }, options);
    }

    // Observe cards for scroll animation
    observeCards() {
        const cards = document.querySelectorAll('.catalog-item:not(.visible)');
        cards.forEach(card => {
            this.observer.observe(card);
        });
    }

    // Create animated particles
    createParticles() {
        const container = document.getElementById('catalogParticlesContainer');
        if (!container) return;

        const particleCount = 60;

        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'catalog-particle';
            
            const size = Math.random() * 5 + 3;
            particle.style.width = size + 'px';
            particle.style.height = size + 'px';
            
            const colors = [
                'rgba(102, 126, 234, 0.4)',
                'rgba(139, 92, 246, 0.4)',
                'rgba(118, 75, 162, 0.4)',
                'rgba(124, 58, 237, 0.4)'
            ];
            particle.style.background = colors[Math.floor(Math.random() * colors.length)];
            particle.style.boxShadow = `0 0 ${size * 2}px ${colors[Math.floor(Math.random() * colors.length)]}`;
            
            particle.style.left = Math.random() * 100 + '%';
            particle.style.top = Math.random() * 100 + '%';
            
            const duration = Math.random() * 10 + 15;
            const delay = Math.random() * 5;
            particle.style.animationDuration = duration + 's';
            particle.style.animationDelay = delay + 's';
            
            container.appendChild(particle);
        }
    }

    // Check URL parameters and save to localStorage, then clean URL
    checkUrlParams() {
        const urlParams = new URLSearchParams(window.location.search);
        const urlCategory = urlParams.get('category');
        const urlType = urlParams.get('type');
        
        if (urlCategory || urlType) {
            if (urlCategory) {
                localStorage.setItem(this.storageKeys.category, urlCategory);
            }
            if (urlType) {
                localStorage.setItem(this.storageKeys.type, urlType);
            }
            
            const cleanUrl = window.location.pathname;
            window.history.replaceState({}, document.title, cleanUrl);
        }
    }

    // Load saved filters from localStorage
    loadSavedFilters() {
        const savedCategory = localStorage.getItem(this.storageKeys.category) || 'all';
        const savedType = localStorage.getItem(this.storageKeys.type) || 'all';
        
        const categorySelect = document.getElementById('categorySelect');
        const typeSelect = document.getElementById('typeSelect');
        
        if (categorySelect) {
            categorySelect.value = savedCategory;
        }
        
        if (typeSelect) {
            typeSelect.value = savedType;
        }
    }

    // Save filters to localStorage
    saveFilters() {
        const category = document.getElementById('categorySelect')?.value || 'all';
        const type = document.getElementById('typeSelect')?.value || 'all';
        
        localStorage.setItem(this.storageKeys.category, category);
        localStorage.setItem(this.storageKeys.type, type);
    }

    // Setup event listeners
    setupEventListeners() {
        const categorySelect = document.getElementById('categorySelect');
        const typeSelect = document.getElementById('typeSelect');
        
        if (categorySelect) {
            categorySelect.addEventListener('change', () => {
                this.saveFilters();
                this.currentPage = 1;
                this.applyFilters();
            });
        }
        
        if (typeSelect) {
            typeSelect.addEventListener('change', () => {
                this.saveFilters();
                this.currentPage = 1;
                this.applyFilters();
            });
        }

        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', () => {
                this.currentPage = 1;
                this.applyFilters();
            });
        }

        ['genreFilter', 'yearFilter', 'sortFilter'].forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('change', () => {
                    this.currentPage = 1;
                    this.applyFilters();
                });
            }
        });

        const clearBtn = document.getElementById('clearFiltersBtn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearFilters());
        }

        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.goToPreviousPage());
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.goToNextPage());
        }

        const pageJumpBtn = document.getElementById('pageJumpBtn');
        const pageJumpInput = document.getElementById('pageJumpInput');
        
        if (pageJumpBtn && pageJumpInput) {
            pageJumpBtn.addEventListener('click', () => this.jumpToPage());
            
            pageJumpInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.jumpToPage();
                }
            });
        }
    }

    // Jump to specific page
    jumpToPage() {
        const pageJumpInput = document.getElementById('pageJumpInput');
        if (!pageJumpInput) return;

        const pageNumber = parseInt(pageJumpInput.value);
        const totalPages = Math.ceil(this.filteredItems.length / this.itemsPerPage);

        if (isNaN(pageNumber) || pageNumber < 1 || pageNumber > totalPages) {
            return;
        }

        this.currentPage = pageNumber;
        this.renderPage();
        pageJumpInput.value = '';
    }

    // Load all data from JSON files
    async loadAllData() {
        const gallery = document.getElementById('itemGallery');
        gallery.innerHTML = '<div class="loading-wrapper"><div class="spinner"></div><p>Loading content...</p></div>';
        
        try {
            const categories = [
                { name: 'economy', code: 'econ' },
                { name: 'environment', code: 'envrn' },
                { name: 'law', code: 'law' }
            ];
            
            const types = [
                { name: 'books', prefix: 'data_books_' },
                { name: 'films', prefix: 'data_film_' },
                { name: 'shows', prefix: 'data_shows_' }
            ];
            
            const loadPromises = [];
            
            for (const category of categories) {
                for (const type of types) {
                    const fileName = `json/${type.prefix}${category.code}.json`;
                    loadPromises.push(
                        this.loadFile(fileName, category.name, type.name)
                    );
                }
            }
            
            await Promise.all(loadPromises);
            
            this.populateFilters();
            this.applyFilters();
            
        } catch (error) {
            console.error('Error loading data:', error);
            gallery.innerHTML = '<div class="loading-wrapper"><p style="color: #ef4444;">Error loading content. Please try again.</p></div>';
        }
    }

    // Load individual file
    async loadFile(fileName, category, type) {
        try {
            const response = await fetch(fileName);
            
            if (!response.ok) {
                console.warn(`Could not load ${fileName} - Status: ${response.status}`);
                return;
            }
            
            const data = await response.json();
            
            if (Array.isArray(data) && data.length > 0) {
                data.forEach(item => {
                    item.category = category;
                    item.type = type;
                    this.allItems.push(item);
                });
            }
        } catch (error) {
            console.error(`Error loading ${fileName}:`, error);
        }
    }

    // Populate filter dropdowns
    populateFilters() {
        this.populateGenreFilter();
        this.populateYearFilter();
    }

    populateGenreFilter() {
        const genreFilter = document.getElementById('genreFilter');
        if (!genreFilter) return;

        const genres = new Set();
        this.allItems.forEach(item => {
            if (item.genre) {
                if (Array.isArray(item.genre)) {
                    item.genre.forEach(g => genres.add(g));
                } else {
                    genres.add(item.genre);
                }
            }
        });

        const sorted = Array.from(genres).sort();
        sorted.forEach(genre => {
            const option = document.createElement('option');
            option.value = genre;
            option.textContent = genre;
            genreFilter.appendChild(option);
        });
    }

    populateYearFilter() {
        const yearFilter = document.getElementById('yearFilter');
        if (!yearFilter) return;

        const years = new Set();
        
        this.allItems.forEach(item => {
            const dateField = item.type === 'books' ? 'publication_date' : 'release_date';
            if (item[dateField]) {
                let year;
                
                if (typeof item[dateField] === 'string') {
                    const date = new Date(item[dateField]);
                    year = date.getFullYear();
                    
                    if (isNaN(year)) {
                        const yearMatch = item[dateField].match(/\d{4}/);
                        if (yearMatch) {
                            year = parseInt(yearMatch[0]);
                        }
                    }
                } else if (typeof item[dateField] === 'number') {
                    year = item[dateField];
                }
                
                const currentYear = new Date().getFullYear();
                if (year && year >= 1900 && year <= currentYear + 5) {
                    years.add(year);
                }
            }
        });

        const sorted = Array.from(years).sort((a, b) => b - a);
        sorted.forEach(year => {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            yearFilter.appendChild(option);
        });
    }

    // Apply all filters
    applyFilters() {
        let filtered = [...this.allItems];

        const category = document.getElementById('categorySelect')?.value || 'all';
        if (category && category !== 'all') {
            filtered = filtered.filter(item => item.category === category);
        }

        const type = document.getElementById('typeSelect')?.value || 'all';
        if (type && type !== 'all') {
            filtered = filtered.filter(item => item.type === type);
        }

        const searchTerm = document.getElementById('searchInput')?.value.toLowerCase().trim();
        if (searchTerm) {
            filtered = filtered.filter(item => {
                const searchFields = [
                    item.title,
                    item.director,
                    item.author,
                    item.cast ? (Array.isArray(item.cast) ? item.cast.join(' ') : item.cast) : '',
                    item.genre ? (Array.isArray(item.genre) ? item.genre.join(' ') : item.genre) : '',
                ].filter(Boolean).join(' ').toLowerCase();
                
                return searchFields.includes(searchTerm);
            });
        }

        const genre = document.getElementById('genreFilter')?.value;
        if (genre) {
            filtered = filtered.filter(item => {
                if (!item.genre) return false;
                if (Array.isArray(item.genre)) {
                    return item.genre.includes(genre);
                }
                return item.genre === genre;
            });
        }

        const year = document.getElementById('yearFilter')?.value;
        if (year) {
            filtered = filtered.filter(item => {
                const dateField = item.type === 'books' ? 'publication_date' : 'release_date';
                if (!item[dateField]) return false;
                
                let itemYear;
                if (typeof item[dateField] === 'string') {
                    const date = new Date(item[dateField]);
                    itemYear = date.getFullYear();
                    
                    if (isNaN(itemYear)) {
                        const yearMatch = item[dateField].match(/\d{4}/);
                        if (yearMatch) {
                            itemYear = parseInt(yearMatch[0]);
                        }
                    }
                } else if (typeof item[dateField] === 'number') {
                    itemYear = item[dateField];
                }
                
                return itemYear && itemYear.toString() === year;
            });
        }

        const sortOrder = document.getElementById('sortFilter')?.value || 'titleAsc';
        
        filtered.sort((a, b) => {
            const dateFieldA = a.type === 'books' ? 'publication_date' : 'release_date';
            const dateFieldB = b.type === 'books' ? 'publication_date' : 'release_date';
            
            switch (sortOrder) {
                case 'titleAsc':
                    return a.title.localeCompare(b.title);
                case 'titleDesc':
                    return b.title.localeCompare(a.title);
                case 'dateAsc':
                    return new Date(a[dateFieldA]) - new Date(b[dateFieldB]);
                case 'dateDesc':
                    return new Date(b[dateFieldB]) - new Date(a[dateFieldA]);
                default:
                    return 0;
            }
        });

        this.filteredItems = filtered;
        this.renderPage();
    }

    // Render current page
    renderPage() {
        const totalItems = this.filteredItems.length;
        const totalPages = Math.ceil(totalItems / this.itemsPerPage);
        
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = Math.min(startIndex + this.itemsPerPage, totalItems);
        
        const pageItems = this.filteredItems.slice(startIndex, endIndex);
        
        this.renderItems(pageItems);
        this.updatePagination(totalPages);
        this.updateResultsCount(totalItems, startIndex, endIndex);
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Render items
    renderItems(items) {
        const gallery = document.getElementById('itemGallery');
        const noResults = document.getElementById('noResults');
        
        if (!gallery) return;

        if (items.length === 0) {
            gallery.innerHTML = '';
            if (noResults) noResults.style.display = 'block';
            return;
        }

        if (noResults) noResults.style.display = 'none';

        gallery.innerHTML = '';
        
        items.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'catalog-item';

            const imageWrapper = document.createElement('div');
            imageWrapper.className = 'catalog-item-image-wrapper';

            const img = document.createElement('img');
            img.src = item.image || 'imgs/placeholder.jpg';
            img.alt = item.title;
            img.className = 'catalog-item-img';
            img.loading = 'lazy';

            imageWrapper.appendChild(img);

            const info = document.createElement('div');
            info.className = 'catalog-item-info';

            const title = document.createElement('h3');
            title.className = 'catalog-item-title';
            title.textContent = item.title;

            const meta = document.createElement('p');
            meta.className = 'catalog-item-meta';
            
            const dateField = item.type === 'books' ? 'publication_date' : 'release_date';
            let year = '';
            
            if (item[dateField]) {
                if (typeof item[dateField] === 'string') {
                    const date = new Date(item[dateField]);
                    year = date.getFullYear();
                    
                    if (isNaN(year)) {
                        const yearMatch = item[dateField].match(/\d{4}/);
                        if (yearMatch) {
                            year = parseInt(yearMatch[0]);
                        }
                    }
                } else if (typeof item[dateField] === 'number') {
                    year = item[dateField];
                }
            }
            
            const typeIcons = {
                'films': '<i class="fa-solid fa-film"></i>',
                'shows': '<i class="fa-solid fa-tv"></i>',
                'books': '<i class="fa-solid fa-book"></i>'
            };
            const icon = typeIcons[item.type] || '';
            const typeLabel = item.type.charAt(0).toUpperCase() + item.type.slice(1);
            meta.innerHTML = year ? `${icon} ${typeLabel} • ${year}` : `${icon} ${typeLabel}`;

            info.appendChild(title);
            info.appendChild(meta);
            itemDiv.appendChild(imageWrapper);
            itemDiv.appendChild(info);

            itemDiv.addEventListener('click', () => {
                window.location.href = `details.html?type=${item.type}&category=${item.category}&id=${item.id}`;
            });

            gallery.appendChild(itemDiv);
        });

        // Trigger scroll observer for new cards
        setTimeout(() => {
            this.observeCards();
        }, 100);
    }

    // Update pagination controls
    updatePagination(totalPages) {
        const pagination = document.getElementById('pagination');
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const currentPageSpan = document.getElementById('currentPage');
        const totalPagesSpan = document.getElementById('totalPages');
        const pageJumpInput = document.getElementById('pageJumpInput');
        
        if (totalPages <= 1) {
            if (pagination) pagination.style.display = 'none';
            return;
        }
        
        if (pagination) pagination.style.display = 'flex';
        if (currentPageSpan) currentPageSpan.textContent = this.currentPage;
        if (totalPagesSpan) totalPagesSpan.textContent = totalPages;
        
        if (pageJumpInput) {
            pageJumpInput.max = totalPages;
        }
        
        if (prevBtn) {
            prevBtn.disabled = this.currentPage === 1;
        }
        
        if (nextBtn) {
            nextBtn.disabled = this.currentPage === totalPages;
        }
    }

    // Update results count
    updateResultsCount(total, start, end) {
        const resultsCount = document.getElementById('resultsCount');
        if (resultsCount) {
            if (total === 0) {
                resultsCount.innerHTML = 'No results found';
            } else {
                resultsCount.innerHTML = `Showing <strong>${start + 1}-${end}</strong> of <strong>${total}</strong> results`;
            }
        }
    }

    // Pagination navigation
    goToNextPage() {
        this.currentPage++;
        this.renderPage();
    }

    goToPreviousPage() {
        this.currentPage--;
        this.renderPage();
    }

    // Clear all filters
    clearFilters() {
        document.getElementById('categorySelect').value = 'all';
        document.getElementById('typeSelect').value = 'all';
        document.getElementById('searchInput').value = '';
        document.getElementById('genreFilter').value = '';
        document.getElementById('yearFilter').value = '';
        document.getElementById('sortFilter').value = 'titleAsc';
        
        this.saveFilters();
        
        this.currentPage = 1;
        this.applyFilters();
    }
}

// ============================================
// INITIALIZE
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    new CatalogManager();
});