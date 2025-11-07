// public/js/main.js

const API_BASE_URL = '/api';
const GOOGLE_BOOKS_API_URL = 'https://www.googleapis.com/books/v1/volumes?q='; 

// Elementos DOM
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

// Campos do Formulário
const formTitle = document.getElementById('form-title');
const apiSearchInput = document.getElementById('api-search-input');
const apiSearchBtn = document.getElementById('api-search-btn'); 
const inputTitulo = document.getElementById('titulo');
const inputAutor = document.getElementById('autor');
const inputGenero = document.getElementById('genero'); // Agora é input text
const inputTotalPaginas = document.getElementById('total_paginas');
const inputTempoLeitura = document.getElementById('tempo_leitura');
const inputNota = document.getElementById('nota');
const inputResenha = document.getElementById('resenha');

// Estado global
let lastCapaUrl = null;
let allLeiturasData = [];
let editingLeituraId = null;
let cardListenersAttached = false; 


// ----------------------------------------------------
// UTILITÁRIOS E RENDERIZAÇÃO
// ----------------------------------------------------

function getAuthHeader() {
    const userId = localStorage.getItem('userId');
    if (!userId) return { 'Content-Type': 'application/json' };
    return {
        'Content-Type': 'application/json',
        'x-user-id': userId
    };
}

function handleLogout() {
    localStorage.removeItem('userId');
    window.location.href = '/login.html';
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

function renderLivroCard(leitura) {
    const card = document.createElement('div');
    card.classList.add('livro-card');
    card.dataset.leituraId = leitura.id_leitura;

    const notaArredondada = Math.round(leitura.nota || 0);
    const estrelas = '★'.repeat(notaArredondada) + '☆'.repeat(5 - notaArredondada);

    const capaContent = leitura.capa_url?.startsWith('http')
        ? `<img src="${leitura.capa_url}" alt="Capa de ${leitura.titulo}" class="capa-img">`
        : `Capa do Livro`;

    card.innerHTML = `
        <div class="livro-capa">${capaContent}</div>
        <h4>${leitura.titulo}</h4>
        <small>${leitura.autor}</small>
        <div class="rating-line">
            <p class="nota-estrelas">${estrelas} (${leitura.nota ?? '-'})</p>
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

    if (leituras?.length) {
        leituras.forEach(leitura => listaLeituras.appendChild(renderLivroCard(leitura)));
        if (!cardListenersAttached) {
            setupCardEventListeners();
            cardListenersAttached = true;
        }
    } else {
        listaLeituras.innerHTML = '<p>Nenhuma leitura encontrada com os critérios atuais.</p>';
    }
}

// ----------------------------------------------------
// EVENTOS DOS CARDS E AÇÕES CRUD
// ----------------------------------------------------

function setupCardEventListeners() {
    if (!listaLeituras) return;

    listaLeituras.onclick = null; // Limpa o listener anterior
    
    listaLeituras.onclick = async (e) => {
        const btn = e.target.closest('button');
        if (!btn) return;
        const id = btn.dataset.id;
        if (!id) return;

        if (btn.classList.contains('btn-edit')) {
            handleEdit(id);
        } else if (btn.classList.contains('btn-delete')) {
            handleDelete(id);
        }
    };
}

async function handleDelete(id) {
    if (!confirm("Tem certeza que deseja excluir esta leitura?")) return;

    try {
        const response = await fetch(`${API_BASE_URL}/leituras/${id}`, {
            method: 'DELETE',
            headers: getAuthHeader()
        });

        if (response.status === 204 || response.ok) { 
            alert('Leitura excluída com sucesso!');
        } else {
            if (response.status === 401) return handleLogout();
            const { message } = await response.json();
            throw new Error(message || 'Erro ao excluir leitura');
        }

        await loadDashboard();
    } catch (err) {
        console.error(err);
        alert('Erro ao excluir leitura: ' + err.message);
    }
}

function handleEdit(id) {
    const leitura = allLeiturasData.find(l => String(l.id_leitura) === String(id));
    if (!leitura) return alert("Leitura não encontrada.");

    editingLeituraId = leitura.id_leitura;

    // Preenchimento dos campos do formulário
    inputTitulo.value = leitura.titulo || '';
    inputAutor.value = leitura.autor || '';
    inputGenero.value = leitura.genero || ''; // Campo de texto
    inputTotalPaginas.value = leitura.total_paginas || '';
    inputTempoLeitura.value = leitura.tempo_leitura_horas || '';
    inputNota.value = leitura.nota || '';
    inputResenha.value = leitura.resenha || '';
    lastCapaUrl = leitura.capa_url || null;

    formTitle.textContent = 'Editar Leitura';
    salvarLeituraBtn.textContent = 'Salvar Edição';
    toggleRegistroForm(true);
}

// ----------------------------------------------------
// DASHBOARD E FILTROS
// ----------------------------------------------------

async function loadDashboard() {
    const userId = localStorage.getItem('userId');
    if (!userId) return handleLogout();

    try {
        const response = await fetch(`${API_BASE_URL}/dashboard`, {
            headers: getAuthHeader()
        });

        if (!response.ok) {
            if (response.status === 401) return handleLogout();
            throw new Error(`Erro: ${response.status}`);
        }

        const data = await response.json();

        userProfileName.textContent = data.usuario?.nome || 'Usuário';
        totalLivrosSpan.textContent = data.estatisticas?.total_livros_lidos ?? 0;
        mediaNotasSpan.textContent = data.estatisticas?.media_notas ?? '-';

        allLeiturasData = data.leituras || [];
        renderLeituras(allLeiturasData);
        
    } catch (error) {
        console.error('Erro ao carregar dashboard:', error);
        if (listaLeituras) listaLeituras.innerHTML = `<p style="color:red;">Erro ao carregar: ${error.message}. Verifique o terminal Node.js.</p>`;
    }
}

async function applyAllFilters() {
    const termoBusca = searchInput.value.trim().toLowerCase();
    const generoFiltro = filterGenero.value;
    const notaFiltro = filterNota.value.split(' ')[0];

    try {
        const params = new URLSearchParams();
        if (generoFiltro && generoFiltro !== 'Todos os gêneros') params.append('genero', generoFiltro);
        if (notaFiltro && notaFiltro !== 'Todas') params.append('nota', notaFiltro);

        const response = await fetch(`${API_BASE_URL}/leituras/filtro?${params}`, {
            headers: getAuthHeader()
        });

        if (!response.ok) throw new Error('Falha ao filtrar leituras.');

        let filteredData = await response.json();

        if (termoBusca) {
            filteredData = filteredData.filter(l =>
                l.titulo?.toLowerCase().includes(termoBusca) ||
                l.autor?.toLowerCase().includes(termoBusca) ||
                l.genero?.toLowerCase().includes(termoBusca)
            );
        }

        renderLeituras(filteredData);
    } catch (err) {
        console.error(err);
        renderLeituras([]);
    }
}

// ----------------------------------------------------
// GOOGLE BOOKS API (Busca e Preenchimento Automático)
// ----------------------------------------------------

async function searchBookAndFillForm(query) {
    if (!query) return;

    lastCapaUrl = null;
    const feedbackElement = apiSearchBtn || inputTitulo; 
    const originalText = apiSearchBtn?.textContent || 'Buscar Livro Online';
    
    if (apiSearchBtn) apiSearchBtn.textContent = 'Buscando...';
    
    try {
        let url = GOOGLE_BOOKS_API_URL + (query.match(/^(978|979)[0-9\-]{10,13}$/) ? `isbn:${query}` : query);
        const response = await fetch(url);
        const data = await response.json();

        if (!data.items?.length) {
            alert("Nenhum livro encontrado.");
            return;
        }

        const volume = data.items[0].volumeInfo;
        
        // Extrai a primeira categoria ou 'Geral' se não houver
        const genero = volume.categories?.length ? volume.categories[0] : '';
        
        // Preenche apenas se vazio
        inputTitulo.value ||= volume.title || '';
        inputAutor.value ||= (volume.authors?.join(', ') || '');
        inputTotalPaginas.value ||= volume.pageCount || '';
        inputGenero.value ||= genero; // Preenche o novo campo de texto do Gênero

        lastCapaUrl = volume.imageLinks?.thumbnail?.replace('http:', 'https:') || null;

        alert(`Livro "${volume.title}" encontrado!`);
    } catch (err) {
        console.error(err);
        alert("Erro ao buscar o livro online.");
    } finally {
        if (apiSearchBtn) apiSearchBtn.textContent = originalText;
        if (apiSearchBtn) apiSearchBtn.disabled = false;
    }
}

// ----------------------------------------------------
// EVENTOS GLOBAIS E SUBMISSÃO
// ----------------------------------------------------

function setupGlobalEventListeners() {
    if (searchInput) searchInput.addEventListener('input', applyAllFilters);
    if (applyFiltersBtn) applyFiltersBtn.addEventListener('click', applyAllFilters);

    if (btnRegistrarLeitura) btnRegistrarLeitura.addEventListener('click', () => toggleRegistroForm(true));
    if (btnCancelarRegistro) btnCancelarRegistro.addEventListener('click', () => toggleRegistroForm(false)); // Listener corrigido

    if (inputTitulo) {
        inputTitulo.addEventListener('blur', () => {
            const query = inputTitulo.value.trim();
            if (query && !editingLeituraId) searchBookAndFillForm(query);
        });
    }

    if (apiSearchBtn) {
        apiSearchBtn.addEventListener('click', () => {
            const query = apiSearchInput.value.trim();
            if (query) searchBookAndFillForm(query);
        });
    }

    if (registroLeituraForm) {
        registroLeituraForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const rawFormData = Object.fromEntries(new FormData(registroLeituraForm).entries());
            
            // CRÍTICO: Conversão de strings vazias/números para tipagem correta no DB
            const formData = {
                ...rawFormData,
                // Converte para INT/FLOAT ou NULL se a string for vazia (para colunas opcionais)
                total_paginas: rawFormData.total_paginas ? parseInt(rawFormData.total_paginas) : null,
                tempo_leitura_horas: rawFormData.tempo_leitura_horas ? parseFloat(rawFormData.tempo_leitura_horas) : null,
                nota: parseFloat(rawFormData.nota),
                resenha: rawFormData.resenha || null,
                capa_url: lastCapaUrl
            };

            const method = editingLeituraId ? 'PUT' : 'POST';
            const url = editingLeituraId
                ? `${API_BASE_URL}/leituras/${editingLeituraId}`
                : `${API_BASE_URL}/leituras`;

            try {
                const response = await fetch(url, {
                    method,
                    headers: getAuthHeader(),
                    body: JSON.stringify(formData)
                });

                if (response.status === 204 || response.ok) {
                    alert(`Leitura ${editingLeituraId ? 'atualizada' : 'registrada'} com sucesso!`);
                } else {
                    if (response.status === 401) return handleLogout();
                    const { message } = await response.json();
                    throw new Error(message);
                }

                toggleRegistroForm(false);
                await loadDashboard();
            } catch (err) {
                console.error('Erro ao salvar:', err);
                alert('Erro ao salvar: ' + err.message);
            }
        });
    }
}

// ----------------------------------------------------
// INICIALIZAÇÃO
// ----------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
    setupGlobalEventListeners();
    loadDashboard();
});