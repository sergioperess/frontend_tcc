document.getElementById('loginForm').addEventListener('submit', async function(event) {
    const apiUrl = "http://localhost:8080/auth";
    
    event.preventDefault(); // Impede o envio padrão do formulário

    // Obtém os valores dos campos
    const senha = document.querySelector(".senha");
    const email = document.querySelector(".email");
    const messageElement = document.getElementById("message");

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
                messageElement.textContent = "E-mail ou senha incorretos.";
                messageElement.style.color = "red";
                throw new Error('Falha no login');                
            }

            const data = await response.json();
            const token = data.token; 
            const userId = data.id;

            criarCookie('authToken', token, 7);

            // Armazene o token no localStorage (ou sessionStorage)
            //localStorage.setItem('authToken', token);
            localStorage.setItem('userId', userId);           

            console.log('Login bem-sucedido! Token armazenado.', data);

            setTimeout(window.location.href = './transaction.html', 2500);
        } catch (error) {
            console.error('Erro ao fazer login:', error);
        }
    }

    // Função para criar o cookie
    function criarCookie(nome, valor, diasExpiracao) {
        let dataExpiracao = "";
        if (diasExpiracao) {
            let data = new Date();
            data.setTime(data.getTime() + (diasExpiracao * 24 * 60 * 60 * 1000));
            dataExpiracao = "; expires=" + data.toUTCString();
        }
        // Adicionando SameSite=Lax para compatibilidade com Chrome
        document.cookie = nome + "=" + valor + dataExpiracao + "; path=/; SameSite=Lax";
    }

    // Chame a função para fazer o login
    login();

});
