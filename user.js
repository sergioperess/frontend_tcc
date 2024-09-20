document.addEventListener("DOMContentLoaded", function() {
    const apiUrl = "http://localhost:8080/users";

    // Função para criar um novo item
    document.getElementById("createForm").addEventListener("submit", function(e) {
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

        fetch(`http://localhost:8080/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(data => {
            console.log(`${data.token}`)
            console.log("Item criado:", data);
            fetchItems();
        })
        .catch(error => console.error("Erro ao criar item:", error));
    });

    // Função para ler e listar todos os itens
    function fetchItems() {
        fetch(apiUrl,{
                headers: { 
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            })
            .then(response => response.json())
            .then(data => {
                const itemList = document.getElementById("itemList");
                itemList.innerHTML = "";
                data.forEach(item => {
                    const li = document.createElement("li");
                    li.textContent = `
                        ID: ${item.id}, 
                        Nome: ${item.firstName}, 
                        Sobrenome: ${item.lastName},
                        Senha: ${item.senha},
                        E-mail: ${item.email}`;
                    itemList.appendChild(li);
                });
            })
            .catch(error => console.error("Erro ao carregar itens:", error),
            console.log(localStorage.getItem("authToken")));
    }

    // Função para atualizar um item
    document.getElementById("updateForm").addEventListener("submit", function(e) {
        e.preventDefault();
        const id = document.getElementById("id").value;
        const firstName = document.getElementById("firstName").value;
        const lastName = document.getElementById("lastName").value;

        const data = { 
            firstName: firstName, 
            lastName: lastName
        };

        fetch(`${apiUrl}?userId=${id}`, {
            method: 'PATCH',
            headers: { 
                'Authorization': `Bearer ${localStorage.getItem("token")}`,
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(data => {
            console.log("Item atualizado:", data);
            fetchItems();
        })
        .catch(error => console.error("Erro ao atualizar item:", error));
    });

    // Função para deletar um item
    document.getElementById("deleteForm").addEventListener("submit", function(e) {
        e.preventDefault();
        const id = document.getElementById("deleteId").value;

        fetch(`${apiUrl}/${id}`, {
            method: 'DELETE',
            headers: { 
                'Authorization': `Bearer ${localStorage.getItem("token")}`
                }
        })
        .then(response => {
            if (response.ok) {
                console.log("Item deletado");
                fetchItems();
            } else {
                console.error("Erro ao deletar item");
            }
        })
        .catch(error => console.error("Erro ao deletar item:", error));
    });

    // Carregar a lista de itens ao iniciar a página
    fetchItems();
});
