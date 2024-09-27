document.getElementById("createForm").addEventListener("submit", function(e) {
    const apiUrl = "http://localhost:8080/auth/register";

    e.preventDefault();
    const firstName = document.querySelector(".firstName");
    const lastName = document.querySelector(".lastName");
    const cpf = document.querySelector(".cpf");
    const senha = document.querySelector(".senha");
    const email = document.querySelector(".email");

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
    .then(response => response.json())
    .then(data => {
        console.log("Item criado:", data);
        localStorage.setItem('userId', data.id);
        criarCookie('authToken', data.token, 7);
        setTimeout(window.location.href = './transaction.html', 2500);
    })
    .catch(error => console.error("Erro ao criar item:", error));

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
