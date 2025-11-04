// public/js/auth.js

document.addEventListener('DOMContentLoaded', () => {
    const currentPath = window.location.pathname;
    const form = document.querySelector('form');
    const apiEndpoint = currentPath.includes('cadastro') ? '/api/cadastro' : '/api/login';

    // Se estiver em uma página de autenticação e já tiver token, redireciona para o dashboard
    if (localStorage.getItem('userId') && (currentPath.includes('login') || currentPath.includes('cadastro'))) {
        window.location.href = '/';
        return;
    }

    // Se estiver na página principal e NÃO TIVER token, redireciona para o login
    if (!localStorage.getItem('userId') && currentPath === '/') {
        window.location.href = '/login.html';
        return;
    }


    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());

            try {
                const response = await fetch(apiEndpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });

                const result = await response.json();

                if (response.ok) {
                    alert(result.message);
                    
                    // Salva o ID do usuário (ou token) para simular a sessão
                    localStorage.setItem('userId', result.userId); 
                    
                    // Redireciona para o dashboard (index.html)
                    window.location.href = '/'; 
                } else {
                    alert(`Erro: ${result.message}`);
                }

            } catch (error) {
                console.error('Erro de rede:', error);
                alert('Erro de conexão com o servidor.');
            }
        });
    }
});