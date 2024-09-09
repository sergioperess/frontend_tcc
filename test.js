document.getElementById('loginForm').addEventListener('submit', async function(event) {
    const apiUrl = "http://localhost:8080/auth";
    
    event.preventDefault(); // Impede o envio padrão do formulário

    // Obtém os valores dos campos
    const senha = document.querySelector(".senha");
    const email = document.querySelector(".email");

    // Dados de login do usuário
    const loginData = {
        email: email.value,
        senha: senha.value
    };

    // Função para fazer login e obter o token
    async function login() {
        try {
            const response = await fetch(`${apiUrl}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(loginData)
            });

            if (!response.ok) {
                throw new Error('Falha no login');
            }

            const data = await response.json();
            const token = data.token; // Supondo que o token esteja no campo token

            // Armazene o token no localStorage (ou sessionStorage)
            localStorage.setItem('authToken', token);

            console.log('Login bem-sucedido! Token armazenado.');
        } catch (error) {
            console.error('Erro ao fazer login:', error);
        }
    }

    // Chame a função para fazer o login
    login();

});
