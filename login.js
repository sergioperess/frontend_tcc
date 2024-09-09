document.getElementById('loginForm').addEventListener('submit', function(event) {
    const apiUrl = "http://localhost:8080/auth";

    event.preventDefault(); // Impede o envio padrão do formulário

    // Coleta os dados do formulário
    const senha = document.querySelector(".senha");
    const email = document.querySelector(".email");

    const data = { 
        senha: senha.value,
        email: email.value
    };


    // Faz a requisição usando fetch
    fetch(`${apiUrl}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
    .then(response => response.json()) // Converte a resposta para JSON
    .then(data => {
        if (data.title == "NOT_FOUND! Consult the documentation" || data.message == "Senha incorreta") {
            console.log("Falha no login!", data); 
        } else {
            console.log("Login realizado com sucesso", data)
            console.log(`${data.token}`)
            return `${data.token}`
        }
    })
    .catch(error => console.error("Erro ao logar:", error))
});