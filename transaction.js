document.addEventListener("DOMContentLoaded", function() {
    const apiUrl = "http://localhost:8080/api/transaction";

    var arrayId = [];

    // Função para criar um novo item
    document.getElementById("createForm").addEventListener("submit", function(e) {
        e.preventDefault();
        const valor = document.querySelector(".valor");
        const type = document.querySelector(".type");
        const description = document.querySelector(".description");

        findType(type.value);

        const data = { 
            valor: replaceDot(valor.value), 
            typeId: localStorage.getItem('typeId'),
            description: description.value,
            userId: localStorage.getItem('userId')
        };

        fetch(apiUrl, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(data => {
            console.log("Item criado:", data);
            fetchItems();
        })
        .catch(error => console.error("Erro ao criar item:", error));
    });


    // Função para procurar o id do Tipo de Gasto
    async function findType(index){

        const aux = index.charAt(0).toUpperCase() + index.slice(1).toLowerCase();
        console.log(aux);

        try {
            const response = await fetch(`http://localhost:8080/api/gastos/${aux}/${localStorage.getItem('userId')}`,{
                headers: { 
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            })

            if (!response.ok) {
                createType(aux);               
            }

            const data = await response.json();

            console.log(data.id);
            localStorage.setItem('typeId', data.id);  

            
        } catch (error) {
            console.error('Erro ao carregar itens:"', error);
        }            
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
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify(dado)
        })
        .then(response => response.json())
        .then(item => {
            console.log("Item criado:", item);
            localStorage.setItem('typeId', item.id);
        })
        .catch(error => console.error("Erro ao criar item:", error));  
    }
    

    // Função para ler e listar todos os itens
    function fetchItems() {
        fetch(`${apiUrl}/list/${localStorage.getItem('userId')}`,{
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
            .catch(error => console.error("Erro ao carregar itens:", error));
    }

    // Função para trocar a vírgula pelo ponto
    function replaceDot(valor){
        return valor.replace(",", ".");
    }

    // Função para add um item no arrai de userId
    function addInArray(data){
        arrayId.push(data);
    }

    // Função para remover um item no arrai de userId
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

        const data = { 
            valor: valor, 
            type: type,
            description: description
        };

        if(arrayId.length === 1){

            var aux = arrayId[0];

            fetch(`${apiUrl}?transactionId=${aux}`, {
                method: 'PATCH',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
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
            fetch(`${apiUrl}/${arrayId[index]}`, {
                method: 'DELETE',
                headers: { 
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            })
            .then(response => {
                if (response.ok) {
                    console.log("Item deletado");
                    fetchItems();
                    removeInArray(aux);
                } else {
                    console.error("Erro ao deletar item");
                }
            })
            .catch(error => console.error("Erro ao deletar item:", error));            
        }
    });

    // Função de logout
    document.getElementById("logout").addEventListener("click", function(e) {
        // Remover token do localStorage ou sessionStorage
        localStorage.removeItem('authToken'); // ou sessionStorage.removeItem('token');
        localStorage.removeItem('userId'); // Remove o id do usuário
        
        // Redirecionar o usuário para a página de login ou outra página
        window.location.href = './home.html';

    });

    // Carregar a lista de itens ao iniciar a página
    fetchItems();
});
