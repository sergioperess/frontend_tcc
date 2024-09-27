document.addEventListener("DOMContentLoaded", function() {

    // Pegando os elementos do DOM
    var modal = document.getElementById("createItemModal");
    var btn = document.getElementById("create-item");
    var span = document.getElementsByClassName("close")[0];

    // Quando o botão "Criar Novo Item" for clicado, exibe o modal
    btn.onclick = function() {
        modal.style.display = "block";
    }

    // Quando o usuário clicar no "X", o modal será fechado
    span.onclick = function() {
        modal.style.display = "none";
    }

    // Quando o usuário clicar fora do modal, ele também será fechado
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }

    const apiUrl = "http://localhost:8080/api/transaction";

    var arrayId = [];
    // Array de todos os itens de gastos (fetched)
    let allItems = [];

    let gastoId;

    // Função para criar um novo item
    document.getElementById("createForm").addEventListener("submit", function(e) {
        e.preventDefault();
        const valor = document.querySelector(".valor");
        const type = document.querySelector(".type");
        const description = document.querySelector(".description");

        findType(type.value);

        const data = { 
            valor: replaceDot(valor.value), 
            typeId: gastoId,
            description: description.value,
            userId: localStorage.getItem('userId')
        };

        fetch(apiUrl, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${lerCookie('authToken')}`
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(data => {
            console.log("Item criado:", data);
            fetchItems();
        })
        .catch(error => console.error("Erro ao criar item:", error));

        // Fechar o modal
        modal.style.display = "none";
    });


    // Função para procurar o id do Tipo de Gasto
    async function findType(index){

        const aux = index.charAt(0).toUpperCase() + index.slice(1).toLowerCase();
        console.log(aux);

        try {
            const response = await fetch(`http://localhost:8080/api/gastos/${aux}/${localStorage.getItem('userId')}`,{
                headers: { 
                    'Authorization': `Bearer ${lerCookie('authToken')}`
                }
            })

            if (!response.ok) {
                createType(aux);               
            }

            const data = await response.json();

            gastoId = data.id;

            console.log(gastoId);
                
        } catch (error) {
            console.error('Erro ao carregar itens:"', error);
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

    function createType(index){

        const dado = { 
            nome: index,
            userId: localStorage.getItem('userId')
        };
        
        fetch(`http://localhost:8080/api/gastos`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${lerCookie('authToken')}`
            },
            body: JSON.stringify(dado)
        })
        .then(response => response.json())
        .then(item => {
            gastoId = item.id;

            console.log("Item criado:", item);
        })
        .catch(error => console.error("Erro ao criar item:", error));  
    }
    

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

        /*fetch(`${apiUrl}/list/${localStorage.getItem('userId')}`,{
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
                    const checkbox = document.createElement("input");
                    checkbox.type = 'checkbox';
                    li.textContent = `
                        ID: ${item.id}, 
                        Valor: ${updateValor(item.valor)}, 
                        Data: ${updateDateTime(item.date)},
                        Tipo de Gasto: ${item.type},
                        Descrição: ${item.description}`;
                    itemList.appendChild(checkbox);    
                    itemList.appendChild(li);

                    // Adiciona um evento de mudança (change) para o checkbox
                    checkbox.addEventListener('change', function() {
                        if (this.checked) {
                            addInArray(item.id);
                        }else{
                            removeInArray(item.id);
                        }
                        console.log(arrayId);
                    });
                });
            })
            .catch(error => console.error("Erro ao carregar itens:", error));*/
    }

    // Função para carregar os dados e preencher o select
    function carregarOpcoes() {
        const select = document.getElementById("filterType");

        // Fazer a requisição para a API (Exemplo de URL fictícia)
        fetch(`http://localhost:8080/api/gastos/list/${localStorage.getItem('userId')}`, {
            headers: {
                'Authorization': `Bearer ${lerCookie('authToken')}` // Exemplo de autenticação
            }
        })
        .then(response => response.json())  // Converte a resposta em JSON
        .then(data => {
            // Limpa o select antes de adicionar os novos valores
            select.innerHTML = "";

           
            // Adiciona uma opção padrão
            const defaultOption = document.createElement("option");
            defaultOption.value = "";
            defaultOption.textContent = "Todos";
            select.appendChild(defaultOption);

            // Itera sobre os dados recebidos e cria <option> para cada um
            data.forEach(item => {
                const option = document.createElement("option");
                option.value = item.nome; // Valor do item (ex: id)
                option.textContent = item.nome; // Texto exibido (ex: nome do tipo de gasto)
                select.appendChild(option); // Adiciona a opção ao select
            });
        })
        .catch(error => {
            console.error("Erro ao carregar as opções:", error);

            // Exibe uma mensagem de erro no select caso a requisição falhe
            select.innerHTML = "<option value=''>Erro ao carregar opções</option>";
        });

        // Array de meses por extenso para comparação
        const mesesPorExtenso = [
            "janeiro", "fevereiro", "março", "abril", "maio", 
            "junho", "julho", "agosto", "setembro", "outubro", 
            "novembro", "dezembro"
        ];

        
        // Função para filtrar os itens pelo tipo de gasto selecionado
        function applyFilters() {
            const filterType = document.getElementById("filterType").value;
            const filterMonth = document.getElementById("filterMonth").value;
        
            let filteredItems = allItems;
        
            if (filterType === "" && filterMonth === "") {
                renderItems(allItems);
            } else {
                if (filterType !== "") {
                    filteredItems = filteredItems.filter(item => item.type === filterType);
                }
                
                if (filterMonth !== "") {
                    filteredItems = filteredItems.filter(item => {
                        const itemMonthIndex = new Date(item.date).getMonth(); // Extrai o índice do mês (0-11)
                        const itemMonthName = mesesPorExtenso[itemMonthIndex]; // Mapeia para o nome do mês
                        return itemMonthName === filterMonth;
                    });
                }
            }
        
            // Renderiza os itens filtrados
            renderItems(filteredItems);
        }

        // Adiciona o evento de mudança para os dois campos
        document.getElementById("filterType").addEventListener("change", applyFilters);
        document.getElementById("filterMonth").addEventListener("change", applyFilters);
    }

    // Chama a função para carregar as opções quando a página carregar
    window.onload = carregarOpcoes;

    // Função para renderizar itens na lista com base nos dados fornecidos
    function renderItems(items) {
        const itemList = document.getElementById("itemList");
        itemList.innerHTML = ""; // Limpa a lista de itens antes de atualizar

        items.forEach(item => {
            // Criação do elemento <li>
            const li = document.createElement("li");

            // Criação do checkbox
            const checkbox = document.createElement("input");
            checkbox.type = 'checkbox';

            // Criação do texto do item
            const texto = document.createTextNode(`
                ID: ${item.id}, 
                Valor: ${updateValor(item.valor)}, 
                Data: ${updateDateTime(item.date)},
                Tipo de Gasto: ${item.type},
                Descrição: ${item.description}`);

            // Adiciona o checkbox e o texto ao <li>
            li.appendChild(checkbox);
            li.appendChild(texto);

            // Adiciona o <li> à lista
            itemList.appendChild(li);

            // Evento de mudança para o checkbox
            checkbox.addEventListener('change', function() {
                if (this.checked) {
                    addInArray(item.id);
                } else {
                    removeInArray(item.id);
                }
                console.log(arrayId); // Exibe o array atualizado no console
            });
        });
    }


    // Função para trocar a vírgula pelo ponto
    function replaceDot(valor){
        return valor.replace(",", ".");
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

    // Função para formatação de data
    function updateDateTime(data) {
        const now = new Date(data);
        const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            timeZoneName: 'short'
        };
        const formattedDate = now.toLocaleString('pt-BR', options);
        return formattedDate;
    }

    // Função para formatação da moeda 
    function updateValor(valor){
        return valor.toLocaleString('pt-br',{style: 'currency', currency: 'BRL'});
    }

    // Função para atualizar um item
    document.getElementById("updateForm").addEventListener("submit", function(e) {
        e.preventDefault();

        const valor = document.getElementById("valor").value;
        const type = document.getElementById("type").value;
        const description = document.getElementById("description").value;

        findType(type);

        const data = { 
            valor: replaceDot(valor), 
            typeId: gastoId,
            description: description
        };

        if(arrayId.length === 1){

            var aux = arrayId[0];

            fetch(`${apiUrl}?transactionId=${aux}`, {
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

    // Função de logout
    document.getElementById("logout").addEventListener("click", function(e) {
        // Remover token do localStorage ou sessionStorage
        //localStorage.removeItem('authToken'); // ou sessionStorage.removeItem('token');
        
        excluirCookie("authToken");
        
        localStorage.removeItem('userId'); // Remove o id do usuário
        
        // Redirecionar o usuário para a página de login ou outra página
        window.location.href = './home.html';

    });

    // Carregar a lista de itens ao iniciar a página
    fetchItems();
});
