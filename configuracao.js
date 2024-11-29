document.addEventListener("DOMContentLoaded", function() {

    const apiUrl = "http://localhost:8080/users";

    // Preencher os campos automaticamente ao carregar a página
    const userId = localStorage.getItem("userId");

    if (userId) {
        fetch(`${apiUrl}/${userId}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${lerCookie("authToken")}`
            }
        })
            .then((response) => {
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error("Erro ao buscar os dados do usuário.");
                }
            })
            .then((user) => {
                document.querySelector("#firstName").value = user.firstName || "";
                document.querySelector("#lastName").value = user.lastName || "";
                document.querySelector("#email").value = user.email || "";
            })
            .catch((error) => {
                console.error("Erro ao carregar os dados do usuário:", error);
                alert("Não foi possível carregar os dados do usuário.");
            });
    } else {
        alert("Usuário não autenticado. Redirecionando para login.");
        window.location.href = "/login.html"; // Redireciona se o userId não estiver no localStorage
    }

    document.getElementById("updateUserForm").addEventListener("submit", function(e) {

        e.preventDefault();
        const firstName = document.querySelector("#firstName");
        const lastName = document.querySelector("#lastName");
        const senhaAtual = document.querySelector("#senhaAtual").value;  
        const senha = document.querySelector("#senha");
        const email = document.querySelector("#email");

        // Verifica se algum campo está vazio
        if (!firstName.value.trim() || !lastName.value.trim() || !senha.value.trim() || !email.value.trim()) {
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
            senhaAtual: senhaAtual,
            senha: senha.value,
            email: email.value
        };

        fetch(`${apiUrl}?userId=${localStorage.getItem('userId')}`, {
            method: 'PATCH',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${lerCookie('authToken')}`
            },
            body: JSON.stringify(data)
        })
        .then((response) => {
            if (response.ok) {
                alert("Usuário atualizado com sucesso!");
                excluirCookie("authToken");
                localStorage.removeItem('userId');
                window.location.href = "/home.html"; // Redireciona para a página inicial
            }else if (response.status === 401) {
                alert("A senha atual está incorreta. Tente novamente.");
            } 
            else {
                alert("Erro ao atualizado o usuário.");
            }
        })
        .catch((error) => console.error("Erro na requisição:", error));
    });

    // Função para criar o cookie
    function criarCookie(nome, valor, diasExpiracao) {
        let dataExpiracao = "";
        if (diasExpiracao) {
            let data = new Date();
            data.setTime(data.getTime() + diasExpiracao * 24 * 60 * 60 * 1000);
            dataExpiracao = "; expires=" + data.toUTCString();
        }
        document.cookie = nome + "=" + valor + dataExpiracao + "; path=/; SameSite=Lax";
    }

    // Função para ler o cookie
    function lerCookie(nome) {
        let nomeIgual = nome + "=";
        let cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            let cookie = cookies[i].trim();
            if (cookie.indexOf(nomeIgual) == 0) {
                return cookie.substring(nomeIgual.length, cookie.length);
            }
        }
        return null;
    }

    // Função para excluir o cookie
    function excluirCookie(nome) {
        criarCookie(nome, "", -1);
    }

    // Função de logout
    document.getElementById("logout").addEventListener("click", function(e) {
        // Remover token do localStorage ou sessionStorage
        //localStorage.removeItem('authToken'); // ou sessionStorage.removeItem('token');
        
        excluirCookie("authToken");
        
        localStorage.removeItem('userId'); // Remove o id do usuário
        
        // Redirecionar o usuário para a página de login ou outra página
        window.location.href = './home.html';

    });

});
