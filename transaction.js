document.addEventListener("DOMContentLoaded", function() {
    const apiUrl = "http://localhost:8080/api/transaction";

    // Função para criar um novo item
    document.getElementById("createForm").addEventListener("submit", function(e) {
        e.preventDefault();
        const valor = document.querySelector(".valor");
        const type = document.querySelector(".type");
        const description = document.querySelector(".description");
        const userId = document.querySelector(".userId");
    
        const data = { 
            valor: valor.value, 
            type: type.value,
            description: description.value,
            userId: userId.value
        };

        fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(data => {
            console.log("Item criado:", data);
            fetchItems();
        })
        .catch(error => console.error("Erro ao criar item:", error));
    });

    // Função para ler e listar todos os itens
    function fetchItems() {
        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                const itemList = document.getElementById("itemList");
                itemList.innerHTML = "";
                data.forEach(item => {
                    const li = document.createElement("li");
                    li.textContent = `
                        ID: ${item.id}, 
                        Valor: ${item.transaction}, 
                        Data: ${item.date},
                        Tipo de Gasto: ${item.type},
                        Descrição: ${item.description}`;
                    itemList.appendChild(li);
                });
            })
            .catch(error => console.error("Erro ao carregar itens:", error));
    }

    // Função para atualizar um item
    document.getElementById("updateForm").addEventListener("submit", function(e) {
        e.preventDefault();
        const id = document.getElementById("id").value;
        const transaction = document.getElementById("transaction").value;
        const type = document.getElementById("type").value;
        const description = document.getElementById("description").value;

        const data = { 
            transaction: transaction, 
            type: type,
            description: description
        };

        fetch(`${apiUrl}?transactionId=${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
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
            method: 'DELETE'
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
