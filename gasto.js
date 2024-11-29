document.addEventListener("DOMContentLoaded", function() {

    // Obtém os elementos do DOM
    const modal = document.getElementById("createItemModal");
    const btn = document.getElementById("create-item");
    const closeBtn = document.querySelector(".close");

    // Quando o usuário clicar no botão "Adicionar Novo Planejamento", o modal é exibido
    btn.onclick = function() {
        modal.style.display = "flex"; // Altera para "flex" para centralizar
    }

    // Quando o usuário clicar no "X", o modal é fechado
    closeBtn.onclick = function() {
        modal.style.display = "none";
    }

    // Quando o usuário clicar fora do modal, ele também é fechado
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }

    const apiUrl = "http://localhost:8080/api/gastos";

    let allItems = [];

    var arrayId = [];


    // Função para criar um novo item
    document.getElementById("createForm").addEventListener("submit", async function(e) {
        e.preventDefault();
        const nome = document.querySelector(".nome").value;
        const aux = nome.charAt(0).toUpperCase() + nome.slice(1).toLowerCase();

        try {
            // Verificar se o tipo de gasto já existe
            const tipoGasto = await findType(nome);
    
            if (tipoGasto) {
                // Se o tipo de gasto já existe, exibir mensagem de erro
                alert("Tipo de gasto já existe. Não é possível criar um novo com o mesmo nome.");
            } else {
                // Se o tipo de gasto não existe, prosseguir com a criação
                const data = { 
                    nome: aux,
                    userId: localStorage.getItem('userId')
                };
                
                // Realizar a requisição para criar o novo gasto
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${lerCookie('authToken')}`
                    },
                    body: JSON.stringify(data)
                });
    
                const createdData = await response.json();
                console.log("Item criado:", createdData);
    
                // Atualizar a lista de itens
                fetchItems();
    
                // Fechar o modal (se estiver usando um)
                if (modal) {
                    modal.style.display = "none";
                }
            }
        } catch (error) {
            console.error("Erro ao verificar tipo de gasto ou ao criar item:", error);
        }
  
    });

    // Função para ler e listar todos os itens
    function fetchItems() {
        fetch(`${apiUrl}/list/${localStorage.getItem('userId')}`, {
            headers: {
                'Authorization': `Bearer ${lerCookie('authToken')}`
            }
        })
        .then(response => response.json())
        .then(data => {
            allItems = data; // Salva todos os itens no array allItems
            renderItems(allItems); // Renderiza todos os itens inicialmente
        })
        .catch(error => console.error("Erro ao carregar itens:", error));
    }

    // Função para renderizar itens na lista com base nos dados fornecidos
    function renderItems(items) {
        const tbody = document.querySelector("#itemTable tbody");
        tbody.innerHTML = ""; // Limpa o corpo da tabela antes de atualizar

        items.forEach(item => {
            // Criação da linha da tabela <tr>
            const row = document.createElement("tr");

            // Criação da célula com checkbox
            const checkboxCell = document.createElement("td");
            const checkbox = document.createElement("input");
            checkbox.type = 'checkbox';
            checkboxCell.appendChild(checkbox);
            row.appendChild(checkboxCell);

            // Criação da célula de ID
            const idCell = document.createElement("td");
            idCell.textContent = item.id;
            row.appendChild(idCell);

            // Criação da célula de Nome
            const nomeCell = document.createElement("td");
            nomeCell.textContent = item.nome;
            row.appendChild(nomeCell);

            // Adiciona a linha ao corpo da tabela
            tbody.appendChild(row);

            // Evento de mudança para o checkbox
            checkbox.addEventListener('change', function () {
                if (this.checked) {
                    addInArray(item.id);
                } else {
                    removeInArray(item.id);
                }
                console.log(arrayId); // Exibe o array atualizado no console
                toggleButtons();
            });
        });
    }

    // Função para habilitar/desabilitar os botões de atualizar e deletar
    function toggleButtons() {
        const updateFormContainer = document.getElementById('updateForm');
        const deleteFormContainer = document.getElementById('deleteForm');
        
        // Mostra o formulário de atualizar se apenas um item estiver selecionado
        if (arrayId.length === 1) {
            updateFormContainer.style.display = "block";
            deleteFormContainer.style.display = "block"; // Também podemos exibir o botão de deletar
        } else if (arrayId.length > 1) {
            // Se mais de um item for selecionado, apenas o botão de deletar será exibido
            updateFormContainer.style.display = "none";
            deleteFormContainer.style.display = "block";
        } else {
            // Nenhum item selecionado, esconde ambos os formulários
            updateFormContainer.style.display = "none";
            deleteFormContainer.style.display = "none";
        }
    }

    // Função para atualizar um item
    document.getElementById("updateForm").addEventListener("submit", function(e) {
        e.preventDefault();

        const nome = document.getElementById("nome").value;

        const data = { 
            nome: nome.charAt(0).toUpperCase() + nome.slice(1).toLowerCase()
        };

        if(arrayId.length === 1){

            var aux = arrayId[0];

            fetch(`${apiUrl}?gastoId=${aux}`, {
                method: 'PATCH',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${lerCookie('authToken')}`
                },
                body: JSON.stringify(data)
            })
            .then(response => response.json())
            .then(data => {
                console.log("Item atualizado:", data);
                fetchItems();
                removeInArray(aux);
            })
            .catch(error => console.error("Erro ao atualizar item:", error));

        }else{
            alert("Selecione somente um campo de cada vez")
        }

    });

    // Função para deletar um item
    document.getElementById("deleteForm").addEventListener("submit", function(e) {
        e.preventDefault();

        for (let index = 0; index < arrayId.length; index++) {  
            var aux = arrayId[index];
            fetch(`${apiUrl}/${aux}`, {
                method: 'DELETE',
                headers: { 
                    'Authorization': `Bearer ${lerCookie('authToken')}`
                }
            })
            .then(response => {
                if (response.ok) {
                    console.log("Item deletado");
                    removeInArray(aux);
                    fetchItems();                    
                } else {
                    console.error("Erro ao deletar item");
                }
            })
            .catch(error => console.error("Erro ao deletar item:", error));          
        }
        arrayId.length = 0;  
    });

    // Função para selecionar todos os checkboxes
    document.getElementById("selectAll").addEventListener("click", function() {
        arrayId.length = 0;
        const checkboxes = document.querySelectorAll("#itemTable tbody input[type='checkbox']");
        checkboxes.forEach(checkbox => {
            checkbox.checked = true; // Marca todos os checkboxes
            const itemId = parseInt(checkbox.closest("tr").querySelector("td:nth-child(2)").textContent); // Obtém o ID do item
            addInArray(itemId); // Adiciona o ID ao array
        });
    });

    // Função para remover a seleção de todos os checkboxes
    document.getElementById("deselectAll").addEventListener("click", function() {
        const checkboxes = document.querySelectorAll("#itemTable tbody input[type='checkbox']");
        checkboxes.forEach(checkbox => {
            checkbox.checked = false; // Desmarca todos os checkboxes
            const itemId = parseInt(checkbox.closest("tr").querySelector("td:nth-child(2)").textContent); // Obtém o ID do item
            removeInArray(itemId); // Remove o ID do array
        });
        arrayId.length = 0;
    });

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

    // Função para add um item no arrai de userId
    function addInArray(data){
        arrayId.push(data);
    }

    // Função para remover um item no array de userId
    function removeInArray(data){
        const index = arrayId.indexOf(data); 
        if (index > -1) {
            arrayId.splice(index, 1);
        }
    }

    // Função para excluir o cookie
    function excluirCookie(nome) {
        criarCookie(nome, "", -1);
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


    // Função de logout
    document.getElementById("logout").addEventListener("click", function(e) {
        // Remover token do localStorage ou sessionStorage
        //localStorage.removeItem('authToken'); // ou sessionStorage.removeItem('token');
        
        excluirCookie("authToken");
        
        localStorage.removeItem('userId'); // Remove o id do usuário
        
        // Redirecionar o usuário para a página de login ou outra página
        window.location.href = './home.html';

    });

    // Função para verificar se o tipo de gasto já existe
    async function tipoGastoExists(nome) {
        try {
            const response = await fetch(`${apiUrl}/${encodeURIComponent(nome)}/${localStorage.getItem('userId')}`, {
                headers: {
                    'Authorization': `Bearer ${lerCookie('authToken')}`
                }
            });

            if (!response.ok) {
                throw new Error("Erro na resposta da API: " + response.status);
            }

            const data = await response.json();
            return data.length > 0; // Retorna true se existir, false caso contrário
        } catch (error) {
            console.error("Erro ao verificar tipo de gasto:", error);
            return false; // Em caso de erro, assume que não existe
        }
    }


    // Função para procurar o id do Tipo de Gasto
    function findType(index) {
        // Formata o tipo de gasto (primeira letra maiúscula, restante minúsculas)
        const aux = index.charAt(0).toUpperCase() + index.slice(1).toLowerCase();
        console.log("Tipo de gasto formatado:", aux);

        // Retorna uma Promise para facilitar o controle assíncrono
        return fetch(`${apiUrl}/${aux}/${localStorage.getItem('userId')}`, {
            headers: {
                'Authorization': `Bearer ${lerCookie('authToken')}`
            }
        })
        .then(response => {
            if (response.ok) {
                // Se a resposta for OK, o tipo de gasto existe
                return response.json();
            } else if (response.status === 404) {
                // Se o status for 404, significa que o tipo de gasto não foi encontrado
                return null;
            } else {
                throw new Error('Erro ao buscar o tipo de gasto');
            }
        })
        .catch(error => {
            console.error("Erro ao carregar itens:", error);
            throw error;  // Rejeitar a Promise em caso de erro
        });
    }

    // Carregar a lista de itens ao iniciar a página
    fetchItems();

});