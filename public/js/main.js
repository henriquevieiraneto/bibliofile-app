// public/js/main.js

const API_BASE_URL = '/api';

// Elementos DOM
const registroFormSection = document.getElementById('registro-form-section');
const registroLeituraForm = document.getElementById('registro-leitura-form');
const btnRegistrarLeitura = document.getElementById('btn-registrar-leitura');
const btnCancelarRegistro = document.getElementById('cancelar-registro');
const listaLeituras = document.getElementById('lista-leituras');
const totalLivrosSpan = document.getElementById('total-livros');
const mediaNotasSpan = document.getElementById('media-notas');
const applyFiltersBtn = document.getElementById('apply-filters-btn');
const filterGenero = document.getElementById('filter-genero');
const filterNota = document.getElementById('filter-nota');

// ----------------------------------------------------
// FUNÇÕES DE EXIBIÇÃO
// ----------------------------------------------------

// Função para exibir ou ocultar o formulário
function toggleRegistroForm(show) {
    if (show) {
        registroFormSection.classList.remove('hidden');
        btnRegistrarLeitura.classList.add('hidden');
    } else {
        registroFormSection.classList.add('hidden');
        btnRegistrarLeitura.classList.remove('hidden');
        registroLeituraForm.reset(); // Limpa o formulário ao fechar
    }
}

// Função para renderizar um card de livro
function renderLivroCard(leitura) {
    const card = document.createElement('div');
    card.classList.add('livro-card');

    const estrelas = '★'.repeat(Math.round(leitura.nota)) + '☆'.repeat(5 - Math.round(leitura.nota));

    card.innerHTML = `
        <div class="livro-capa">Capa do Livro</div>
        <h4>${leitura.titulo}</h4>
        <small>${leitura.autor}</small>
        <p class="nota-estrelas">${estrelas} (${leitura.nota})</p>
        <p class="livro-info">${leitura.genero} - ${leitura.total_paginas} páginas</p>
        <p class="livro-info resenha-snippet">${leitura.resenha ? leitura.resenha.substring(0, 50) + '...' : 'Sem resenha'}</p>
    `;
    return card;
}

// Função para carregar e renderizar o dashboard
async function loadDashboard() {
    try {
        const response = await fetch(`${API_BASE_URL}/dashboard`);
        const data = await response.json();

        // 1. Atualizar Estatísticas
        totalLivrosSpan.textContent = data.estatisticas.total_livros_lidos;
        mediaNotasSpan.textContent = data.estatisticas.media_notas;

        // 2. Renderizar Livros
        listaLeituras.innerHTML = '';
        if (data.leituras && data.leituras.length > 0) {
            data.leituras.forEach(leitura => {
                listaLeituras.appendChild(renderLivroCard(leitura));
            });
        } else {
            listaLeituras.innerHTML = '<p>Nenhuma leitura encontrada. Comece a registrar!</p>';
        }

    } catch (error) {
        console.error('Erro ao carregar o dashboard:', error);
        listaLeituras.innerHTML = '<p>Erro ao conectar com o servidor.</p>';
    }
}

// ----------------------------------------------------
// EVENT LISTENERS
// ----------------------------------------------------

// Botões do Formulário
btnRegistrarLeitura.addEventListener('click', () => toggleRegistroForm(true));
btnCancelarRegistro.addEventListener('click', () => toggleRegistroForm(false));

// Submissão do Formulário de Registro
registroLeituraForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(registroLeituraForm);
    const data = Object.fromEntries(formData.entries());

    try {
        const response = await fetch(`${API_BASE_URL}/leituras`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok) {
            alert('Leitura registrada com sucesso! ID: ' + result.id);
            toggleRegistroForm(false); // Fecha e limpa o formulário
            loadDashboard(); // Recarrega os dados para mostrar o novo livro
        } else {
            alert(`Falha ao registrar leitura: ${result.message}`);
        }
    } catch (error) {
        console.error('Erro de rede ao registrar leitura:', error);
        alert('Erro de conexão com o servidor.');
    }
});

// Aplicação de Filtros
applyFiltersBtn.addEventListener('click', async () => {
    const genero = filterGenero.value;
    const nota = filterNota.value.split(' ')[0]; // Pega apenas o número da nota

    const params = new URLSearchParams();
    if (genero !== 'Todos os gêneros') {
        params.append('genero', genero);
    }
    if (nota && nota !== 'Todas') {
        params.append('nota', nota);
    }

    try {
        const response = await fetch(`${API_BASE_URL}/leituras/filtro?${params.toString()}`);
        const leituras = await response.json();

        listaLeituras.innerHTML = '';
        if (leituras.length > 0) {
            leituras.forEach(leitura => {
                listaLeituras.appendChild(renderLivroCard(leitura));
            });
        } else {
            listaLeituras.innerHTML = '<p>Nenhuma leitura corresponde aos filtros selecionados.</p>';
        }
    } catch (error) {
        console.error('Erro ao aplicar filtros:', error);
        alert('Erro ao filtrar leituras.');
    }
});

// Inicia o carregamento dos dados ao carregar a página
document.addEventListener('DOMContentLoaded', loadDashboard);