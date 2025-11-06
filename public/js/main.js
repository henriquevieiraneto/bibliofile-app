// public/js/main.js

const API_BASE_URL = '/api';
const GOOGLE_BOOKS_API_URL = 'https://www.googleapis.com/books/v1/volumes?q='; 

// Elementos DOM (Declarados no topo para serem acessíveis em todo o script)
const registroFormSection = document.getElementById('registro-form-section');
const registroLeituraForm = document.getElementById('registro-leitura-form');
const btnRegistrarLeitura = document.getElementById('btn-registrar-leitura');
const btnCancelarRegistro = document.getElementById('cancelar-registro');
const salvarLeituraBtn = document.getElementById('salvar-leitura-btn');
const listaLeituras = document.getElementById('lista-leituras');
const totalLivrosSpan = document.getElementById('total-livros');
const mediaNotasSpan = document.getElementById('media-notas');
const applyFiltersBtn = document.getElementById('apply-filters-btn');
const filterGenero = document.getElementById('filter-genero');
const filterNota = document.getElementById('filter-nota');
const userProfileName = document.getElementById('user-name-profile');
const searchInput = document.getElementById('main-search-input'); 

// Elementos do Formulário
const formTitle = document.getElementById('form-title'); 
const apiSearchInput = document.getElementById('api-search-input');
const apiSearchBtn = document.getElementById('api-search-btn'); 
const inputTitulo = document.getElementById('titulo');
const inputAutor = document.getElementById('autor');
const inputGenero = document.getElementById('genero');
const inputTotalPaginas = document.getElementById('total_paginas');
const inputTempoLeitura = document.getElementById('tempo_leitura'); 
const inputNota = document.getElementById('nota');
const inputResenha = document.getElementById('resenha');

// Variáveis de estado global
let lastCapaUrl = null; 
let allLeiturasData = []; 
let editingLeituraId = null;
let cardListenersAttached = false; // Flag para garantir que os listeners de cartão só sejam anexados uma vez.


// ----------------------------------------------------
// FUNÇÕES DE UTILIDADE E RENDERING
// ----------------------------------------------------

function getAuthHeader() {
    const userId = localStorage.getItem('userId');
    if (!userId) {
        return {};
    }
    return { 
        'Content-Type': 'application/json',
        'x-user-id': userId 
    };
}

function handleLogout() {
    localStorage.removeItem('userId');
    window.location.href = '/login.html';
}

function renderLivroCard(leitura) {
    const card = document.createElement('div');
    card.classList.add('livro-card');
    card.setAttribute('data-leitura-id', leitura.id_leitura);

    const notaArredondada = Math.round(leitura.nota);
    const estrelas = '★'.repeat(notaArredondada) + '☆'.repeat(5 - notaArredondada);

    const capaContent = leitura.capa_url && leitura.capa_url.startsWith('http')
        ? `<img src="${leitura.capa_url}" alt="Capa de ${leitura.titulo}" class="capa-img">`
        : `Capa do Livro`;

    card.innerHTML = `
        <div class="livro-capa">${capaContent}</div>
        <h4>${leitura.titulo}</h4>
        <small>${leitura.autor}</small>
        <div class="rating-line">
            <p class="nota-estrelas">${estrelas} (${leitura.nota})</p>
        </div>
        <div class="info-details">
            <small>Páginas: ${leitura.total_paginas || '?'}</small>
            <small>Gênero: ${leitura.genero || 'Geral'}</small>
        </div>
        
        <div class="card-actions">
            <button class="btn-edit" data-id="${leitura.id_leitura}">Editar</button>
            <button class="btn-delete" data-id="${leitura.id_leitura}">Excluir</button>
        </div>
    `;
    return card;
}

function renderLeituras(leituras) {
    if (!listaLeituras) return; 
    listaLeituras.innerHTML = ''; 
    if (leituras && leituras.length > 0) {
        leituras.forEach(leitura => {
            listaLeituras.appendChild(renderLivroCard(leitura));
        });
        // A função setupCardEventListeners será chamada apenas uma vez na inicialização
        // Se já foi chamada, não a chamamos novamente.
        if (!cardListenersAttached) {
            setupCardEventListeners();
            cardListenersAttached = true;
        }
    } else {
        listaLeituras.innerHTML = '<p>Nenhuma leitura encontrada com os critérios atuais.</p>';
    }
}


// ----------------------------------------------------
// FUNÇÕES DE AÇÃO E DASHBOARD
// ----------------------------------------------------

/**
 * Anexa o listener de eventos para os botões Editar/Excluir nos cards.
 * Usa delegação de eventos para eficiência.
 */
function setupCardEventListeners() {
    if (!listaLeituras) return; 
    
    listaLeituras.addEventListener('click', (e) => {
        const target = e.target;
        const id = target.getAttribute('data-id');

        if (!id) return;

        if (target.classList.contains('btn-edit')) {
            handleEdit(id);
        } else if (target.classList.contains('btn-delete')) {
            handleDelete(id);
        }
    });
}


async function handleDelete(id) {
    if (!confirm("Tem certeza que deseja excluir esta leitura?")) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/leituras/${id}`, {
            method: 'DELETE',
            headers: getAuthHeader()
        });

        if (response.status === 204 || response.status === 200) {
            alert('Leitura excluída com sucesso!');
        } else {
            if (response.status === 401) return handleLogout();
            const result = await response.json();
            alert(`Falha ao excluir leitura: ${result.message}`);
            return;
        }
        
        loadDashboard();

    } catch (error) {
        console.error('Erro de rede ao excluir leitura:', error);
        alert('Erro de conexão com o servidor.');
    }
}


function handleEdit(id) {
    const leitura = allLeiturasData.find(l => String(l.id_leitura) === String(id));
    
    if (!leitura) {
        alert("Leitura não encontrada para edição.");
        return;
    }

    editingLeituraId = leitura.id_leitura;

    // Preenchimento dos campos do formulário
    inputTitulo.value = leitura.titulo || '';
    inputAutor.value = leitura.autor || '';
    inputGenero.value = leitura.genero || '';
    inputTotalPaginas.value = leitura.total_paginas || '';
    inputTempoLeitura.value = leitura.tempo_leitura_horas || ''; 
    inputNota.value = leitura.nota || '';
    inputResenha.value = leitura.resenha || '';
    
    lastCapaUrl = leitura.capa_url || null; 

    // Atualiza os textos do formulário
    if (formTitle) formTitle.textContent = 'Editar Leitura';
    if (salvarLeituraBtn) salvarLeituraBtn.textContent = 'Salvar Edição';

    toggleRegistroForm(true); 
}


async function loadDashboard() {
    const userId = localStorage.getItem('userId');
    if (!userId) {
        handleLogout();
        return; 
    }

    try {
        const response = await fetch(`${API_BASE_URL}/dashboard`, {
            method: 'GET',
            headers: getAuthHeader()
        });
        
        if (!response.ok) {
            if (response.status === 401) return handleLogout();
            throw new Error(`Erro do servidor: ${response.status}`);
        }

        const data = await response.json();

        if (userProfileName) userProfileName.textContent = data.usuario.nome;
        if (totalLivrosSpan) totalLivrosSpan.textContent = data.estatisticas.total_livros_lidos;
        if (mediaNotasSpan) mediaNotasSpan.textContent = data.estatisticas.media_notas;
        
        allLeiturasData = data.leituras;

        renderLeituras(allLeiturasData);

    } catch (error) {
        console.error('Erro ao carregar o dashboard:', error);
        if (listaLeituras) listaLeituras.innerHTML = `<p style="color: red;">Erro ao carregar dados: ${error.message}.</p>`;
    }
}

async function applyAllFilters() {
    const termoBusca = searchInput.value.toLowerCase().trim();
    const generoFiltro = filterGenero.value;
    const notaFiltro = filterNota.value.split(' ')[0];
    
    try {
        const params = new URLSearchParams();
        if (generoFiltro !== 'Todos os gêneros') {
            params.append('genero', generoFiltro);
        }
        if (notaFiltro && notaFiltro !== 'Todas') {
            params.append('nota', notaFiltro);
        }

        const response = await fetch(`${API_BASE_URL}/leituras/filtro?${params.toString()}`, {
            method: 'GET',
            headers: getAuthHeader()
        });

        if (!response.ok) {
            if (response.status === 401) return handleLogout();
            throw new Error('Falha ao filtrar dados no servidor');
        }

        let filteredData = await response.json();
        
        if (termoBusca) {
            filteredData = filteredData.filter(leitura => {
                return (
                    leitura.titulo.toLowerCase().includes(termoBusca) ||
                    leitura.autor.toLowerCase().includes(termoBusca) ||
                    (leitura.genero && leitura.genero.toLowerCase().includes(termoBusca))
                );
            });
        }

        renderLeituras(filteredData);

    } catch (error) {
        console.error('Erro ao aplicar filtros:', error);
        renderLeituras([]);
    }
}


async function searchBookAndFillForm(query) {
    if (!query) return;

    lastCapaUrl = null; 
    const feedbackElement = apiSearchBtn || inputTitulo; 
    const originalText = feedbackElement.textContent || 'Buscar Livro Online';
    
    if (apiSearchBtn) apiSearchBtn.textContent = 'Buscando...';
    
    try {
        let url = GOOGLE_BOOKS_API_URL;
        
        if (query.match(/^(978|979)[0-9\-]{10,13}$/)) {
            url += `isbn:${query}`;
        } else {
            url += query;
        }

        const response = await fetch(url);
        const data = await response.json();

        if (data.items && data.items.length > 0) {
            const volumeInfo = data.items[0].volumeInfo;
            
            const titulo = volumeInfo.title || '';
            const autor = volumeInfo.authors ? volumeInfo.authors.join(', ') : '';
            const paginas = volumeInfo.pageCount || '';
            
            const rawCapaUrl = volumeInfo.imageLinks ? (volumeInfo.imageLinks.thumbnail || volumeInfo.imageLinks.smallThumbnail) : null;
            
            const finalCapaUrl = rawCapaUrl ? rawCapaUrl.replace('http:', 'https:') : null;

            if (inputTitulo && !inputTitulo.value) inputTitulo.value = titulo;
            if (inputAutor && !inputAutor.value) inputAutor.value = autor;
            if (inputTotalPaginas && !inputTotalPaginas.value) inputTotalPaginas.value = paginas;
            
            lastCapaUrl = finalCapaUrl; 
            
            if (apiSearchBtn) alert(`Dados de "${titulo}" encontrados.`);
            
        } else {
            if (apiSearchBtn) alert("Nenhum livro encontrado com este termo.");
        }

    } catch (error) {
        console.error('Erro ao buscar livro na API:', error);
        if (apiSearchBtn) alert("Ocorreu um erro ao buscar o livro online.");
    } finally {
        if (apiSearchBtn) apiSearchBtn.textContent = originalText;
        if (apiSearchBtn) apiSearchBtn.disabled = false;
    }
}


function toggleRegistroForm(show) {
    if (show) {
        if (registroFormSection) registroFormSection.classList.remove('hidden');
        if (btnRegistrarLeitura) btnRegistrarLeitura.classList.add('hidden');
    } else {
        if (registroFormSection) registroFormSection.classList.add('hidden');
        if (btnRegistrarLeitura) btnRegistrarLeitura.classList.remove('hidden');
        
        editingLeituraId = null; 
        lastCapaUrl = null;
        if (registroLeituraForm) registroLeituraForm.reset(); 
        
        if (formTitle) formTitle.textContent = 'Registre sua Leitura';
        if (salvarLeituraBtn) salvarLeituraBtn.textContent = 'Registrar Leitura';
    }
}

// ----------------------------------------------------
// NOVO: Funções de Inicialização de Listeners
// ----------------------------------------------------

function setupGlobalEventListeners() {
    // 1. Listeners de Filtro e Busca Global
    if (searchInput) searchInput.addEventListener('input', applyAllFilters);
    if (applyFiltersBtn) applyFiltersBtn.addEventListener('click', applyAllFilters); // <<< APLICAR FILTROS

    // 2. Listener do Botão de Registro (Mostra o Formulário)
    if (btnRegistrarLeitura) btnRegistrarLeitura.addEventListener('click', () => { // <<< + REGISTRAR LEITURA
        editingLeituraId = null;
        if (registroLeituraForm) registroLeituraForm.reset();
        if (formTitle) formTitle.textContent = 'Registre sua Leitura';
        if (salvarLeituraBtn) salvarLeituraBtn.textContent = 'Registrar Leitura';
        lastCapaUrl = null; 
        toggleRegistroForm(true);
    });

    // 3. Listener do Botão Cancelar
    if (btnCancelarRegistro) btnCancelarRegistro.addEventListener('click', () => toggleRegistroForm(false));

    // 4. Listener de Busca Automática (Campo Título)
    if (inputTitulo) {
        inputTitulo.addEventListener('blur', () => {
            const query = inputTitulo.value.trim();
            if (query && !editingLeituraId) {
                searchBookAndFillForm(query);
            }
        });
    }

    // 5. Listener de Busca Manual da API
    if (apiSearchBtn) {
        apiSearchBtn.addEventListener('click', async () => {
            const query = apiSearchInput.value.trim();
            searchBookAndFillForm(query);
        });
    }

    // 6. Listener de Submissão do Formulário (POST ou PUT)
    if (registroLeituraForm) {
        registroLeituraForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const formData = new FormData(registroLeituraForm);
            const data = Object.fromEntries(formData.entries());

            data.capa_url = lastCapaUrl; 

            let method = 'POST';
            let url = `${API_BASE_URL}/leituras`;

            if (editingLeituraId) {
                method = 'PUT';
                url = `${API_BASE_URL}/leituras/${editingLeituraId}`;
            }
            
            try {
                const response = await fetch(url, {
                    method: method,
                    headers: getAuthHeader(),
                    body: JSON.stringify(data)
                });

                if (response.status === 204 || response.status === 200) {
                     alert(`Leitura ${editingLeituraId ? 'editada' : 'registrada'} com sucesso!`);
                } else {
                     if (response.status === 401) return handleLogout();
                     const result = await response.json();
                     alert(`Falha: ${result.message}`);
                     return;
                }

                toggleRegistroForm(false); 
                loadDashboard(); 
            } catch (error) {
                console.error('Erro de rede:', error);
                alert('Erro de conexão com o servidor.');
            }
        });
    }
}


// INICIALIZAÇÃO
document.addEventListener('DOMContentLoaded', () => {
    setupGlobalEventListeners(); // Anexa todos os listeners globais
    loadDashboard();           // Carrega os dados e anexa os listeners dos cards (Editar/Excluir)
});