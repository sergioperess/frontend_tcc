document.getElementById("createForm").addEventListener("submit", function(e) {
    const apiUrl = "http://localhost:8080/auth/register";

    e.preventDefault();
    const firstName = document.querySelector(".firstName");
    const lastName = document.querySelector(".lastName");
    const cpf = document.querySelector(".cpf");
    const senha = document.querySelector(".senha");
    const email = document.querySelector(".email");

    // Verifica se algum campo está vazio
    if (!firstName.value.trim() || !lastName.value.trim() || !cpf.value.trim() || !senha.value.trim() || !email.value.trim()) {
        alert("Por favor, preencha todos os campos obrigatórios.");
        return; // Interrompe o envio caso algum campo esteja vazio
    }

    // Verifica se a senha e a confirmação correspondem
    if (senha.value !== confirmSenha.value) {
        alert("As senhas não correspondem. Tente novamente.");
        return; // Interrompe o envio caso as senhas sejam diferentes
    }

    const data = { 
        firstName: firstName.value, 
        lastName: lastName.value,
        cpf: cpf.value,
        senha: senha.value,
        email: email.value
    };

    fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
    .then(//response => response.json()
        response => {
            if (!response.ok) {
                return response.json().then(errorData => {
                    if(response.status === 409){
                        alert(errorData.message);  // Mostra a mensagem de erro no alerta
                    }
                    throw new Error(JSON.stringify(errorData));
                });
            }
            return response.json();
        }
    )
    .then(data => {
        console.log("Item criado:", data);
        localStorage.setItem('userId', data.id);
        criarCookie('authToken', data.token, 7);
        setTimeout(window.location.href = './transaction.html', 2500);        
    })
    .catch(error => {
        // O erro é lançado como uma string JSON, então fazemos o parse apenas uma vez
        let errorData = JSON.parse(error.message);
    
        if (errorData.details) {
            // Caso existam outros erros nos campos
            for (const [field, message] of Object.entries(errorData.details)) {
                alert(`${message}`);
            }
        }         
    }
    );

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
});
