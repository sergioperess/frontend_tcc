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
    /*window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }*/
    
    const apiUrl = "http://localhost:8080/api/transaction";

    loadGastoOptions();
    loadGastoOptions1();
    loadAnoOptions();
    loadMesOptions();
    loadAnoOptions1();
    loadMesOptions1();

    var arrayId = [];
    // Array de todos os itens de gastos (fetched)
    let allItems = [];

    // Função para criar um novo item
    document.getElementById("createForm").addEventListener("submit", function(e) {
        e.preventDefault();

        const valor = document.querySelector(".valor");
        const type = document.querySelector(".type");
        const description = document.querySelector(".description");
        const dia = document.querySelector("#dia");
        const mes = document.querySelector("#mes");
        const ano = document.querySelector("#ano");
    
        // Validação para garantir que o tipo de gasto foi selecionado
        if (!type.value) {
            alert("Por favor, selecione um tipo de gasto.");
            return;
        }

        // Validação para garantir que o valor não está vazio
        if (!valor.value) {
            alert("Por favor, insira um valor.");
            return;
        }

        // Validação para garantir que o valor inserido é um número válido e maior que zero
        const valorFloat = parseFloat(valor.value);
        if (isNaN(valorFloat) || valorFloat <= 0) {
            alert("Por favor, insira um número válido e maior que zero.");
            return;
        }

        // Validação para garantir que a descrição não está vazia
        if (!description.value) {
            alert("Por favor, insira uma descrição.");
            return;
        }

        // Validação para garantir que o mês foi selecionado
        if (!dia.value) {
            alert("Por favor, selecione um dia.");
            return;
        }

        // Validação para garantir que o mês foi selecionado
        if (!mes.value) {
            alert("Por favor, selecione um mês.");
            return;
        }

        // Validação para garantir que o ano foi selecionado
        if (!ano.value) {
            alert("Por favor, selecione um ano.");
            return;
        }

        const data = { 
            valor: replaceDot(valor.value), 
            typeId: type.value,
            dia: dia.value,
            mes: mes.value,
            ano: ano.value,
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
            carregarOpcoes();
            document.getElementById("filterMonth").value = "";
            fetchItems();
        })
        .catch(error => console.error("Erro ao criar item:", error));

        // Fechar o modal
        modal.style.display = "none";
    });


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

    // Função para carregar as opções no select
    function loadGastoOptions1() { 
        const select = document.querySelector("#updateTypeId");   

        fetch(`http://localhost:8080/api/gastos/list/${localStorage.getItem('userId')}`, {
            headers: {
                'Authorization': `Bearer ${lerCookie('authToken')}`
            }
        })
        .then(response => {
            // Verifica se a resposta foi bem-sucedida
            if (!response.ok) {
                throw new Error("Erro ao carregar os tipos de gastos");
            }
            return response.json();  // Converte a resposta em JSON
        })
        .then(data => {
            // Limpa o select antes de adicionar os novos valores
            select.innerHTML = "";

            // Adiciona uma opção padrão
            const defaultOption = document.createElement("option");
            defaultOption.value = ""; // Valor vazio
            defaultOption.textContent = "Selecione o tipo de gasto"; // Texto padrão
            select.appendChild(defaultOption);            

            // Ordena os dados em ordem alfabética com base no nome
            data.sort((a, b) => a.nome.localeCompare(b.nome));

            // Itera sobre os dados recebidos e cria <option> para cada um
            data.forEach(item => {
                const option = document.createElement("option");
                option.value = item.id; // O ID do tipo de gasto como valor da opção
                option.textContent = item.nome; // Nome do tipo de gasto como texto da opção
                select.appendChild(option); // Adiciona a opção ao select
            });
        })
        .catch(error => {
            console.error("Erro ao carregar as opções:", error);
            // Exibe uma mensagem de erro no select caso a requisição falhe
            select.innerHTML = "<option value=''>Erro ao carregar opções</option>";
        });
    }

    // Função para carregar as opções no select
    function loadGastoOptions() {
        const select = document.querySelector("#typeId");      

        fetch(`http://localhost:8080/api/gastos/list/${localStorage.getItem('userId')}`, {
            headers: {
                'Authorization': `Bearer ${lerCookie('authToken')}`
            }
        })
        .then(response => {
            // Verifica se a resposta foi bem-sucedida
            if (!response.ok) {
                throw new Error("Erro ao carregar os tipos de gastos");
            }
            return response.json();  // Converte a resposta em JSON
        })
        .then(data => {
            // Limpa o select antes de adicionar os novos valores
            select.innerHTML = "";

            // Adiciona uma opção padrão
            const defaultOption = document.createElement("option");
            defaultOption.value = ""; // Valor vazio
            defaultOption.textContent = "Selecione o tipo de gasto"; // Texto padrão
            select.appendChild(defaultOption);
            
            // Ordena os dados em ordem alfabética com base no nome
            data.sort((a, b) => a.nome.localeCompare(b.nome));

            // Itera sobre os dados recebidos e cria <option> para cada um
            data.forEach(item => {
                const option = document.createElement("option");
                option.value = item.id; // O ID do tipo de gasto como valor da opção
                option.textContent = item.nome; // Nome do tipo de gasto como texto da opção
                select.appendChild(option); // Adiciona a opção ao select
            });
        })
        .catch(error => {
            console.error("Erro ao carregar as opções:", error);
            // Exibe uma mensagem de erro no select caso a requisição falhe
            select.innerHTML = "<option value=''>Erro ao carregar opções</option>";
        });
    }

    // Função para carregar os dados e preencher o select
    function carregarOpcoes() {
        const select = document.getElementById("filterType");

        fetch(`http://localhost:8080/api/gastos/list/${localStorage.getItem('userId')}`, {
            headers: {
                'Authorization': `Bearer ${lerCookie('authToken')}` 
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
                        const itemMonthIndex = item.mes; // O mês está armazenado como número (1-12)
                        return mesesPorExtenso[itemMonthIndex - 1] === filterMonth; // Compara com o nome do mês selecionado                        
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

    // Função para habilitar/desabilitar os botões de atualizar e deletar
    function toggleButtons() {
        const updateFormContainer = document.getElementById('updateForm');
        const deleteFormContainer = document.getElementById('deleteForm');
        
        // Mostra o formulário de atualizar se apenas um item estiver selecionado
        if (arrayId.length === 1) {
            updateFormContainer.style.display = "block";
            deleteFormContainer.style.display = "block"; // Também podemos exibir o botão de deletar
            carregarDadosItem(arrayId[0]);
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

    // Função para renderizar itens na tabela com base nos dados fornecidos
    function renderItems(items) {
        const itemTable = document.getElementById("itemTable"); // Seleciona a tabela
        const tbody = itemTable.querySelector("tbody"); // Seleciona o corpo da tabela
        tbody.innerHTML = ""; // Limpa o corpo da tabela antes de atualizar

        items.forEach(item => {
            // Criação da linha da tabela <tr>
            const row = document.createElement("tr");

            // Criação da célula com checkbox
            const checkboxCell = document.createElement("td");
            const checkbox = document.createElement("input");
            checkbox.type = 'checkbox';

            // Adiciona o checkbox à célula
            checkboxCell.appendChild(checkbox);
            row.appendChild(checkboxCell);

            // Criação da célula de ID
            const idCell = document.createElement("td");
            idCell.textContent = item.id;
            row.appendChild(idCell);

            // Criação da célula de Valor
            const valorCell = document.createElement("td");
            valorCell.textContent = updateValor(item.valor);
            row.appendChild(valorCell);

            // Criação da célula de Data
            const dataCell = document.createElement("td");
            dataCell.textContent = updateDateTime(item.dia, item.mes, item.ano);
            row.appendChild(dataCell);

            // Criação da célula de Tipo de Gasto
            const tipoGastoCell = document.createElement("td");
            tipoGastoCell.textContent = item.type;
            row.appendChild(tipoGastoCell);

            // Criação da célula de Descrição
            const descricaoCell = document.createElement("td");
            descricaoCell.textContent = item.description;
            row.appendChild(descricaoCell);

            // Adiciona a linha ao corpo da tabela
            tbody.appendChild(row);

            // Evento de mudança para o checkbox
            checkbox.addEventListener('change', function() {
                if (this.checked) {
                    addInArray(item.id);
                } else {
                    removeInArray(item.id);
                }
                console.log(arrayId); // Exibe o array atualizado no console
                toggleButtons();
            });

            // Adiciona evento de clique à linha, sem alterar o array
            row.addEventListener('click', function() {
                // Verifica se o clique foi diretamente no checkbox para evitar duplicação de eventos
                if (event.target !== checkbox) {
                    checkbox.checked = !checkbox.checked; // Alterna o estado do checkbox
                    checkbox.dispatchEvent(new Event('change')); // Dispara o evento 'change' do checkbox
                }
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
        toggleButtons();
    }

   // Função para formatação de data
    function updateDateTime(dia, mes, ano) {
        const day = String(dia).padStart(2, '0'); // Garante que o dia tenha 2 dígitos
        const month = String(mes).padStart(2, '0'); // Garante que o mês tenha 2 dígitos
        const year = String(ano); // Converte o ano para string, se necessário

        // Retorna a data no formato dd/mm/yyyy
        return `${day}/${month}/${year}`;
    }

    // Função para formatação da moeda 
    function updateValor(valor){
        return valor.toLocaleString('pt-br',{style: 'currency', currency: 'BRL'});
    }

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

    // Função para atualizar um item
    document.getElementById("updateForm").addEventListener("submit", function(e) {
        e.preventDefault();

        const valor = document.getElementById("valor").value;
        const type = document.getElementById("updateTypeId").value;
        const description = document.getElementById("description").value;
        const dia = document.querySelector("#diaUpdate");
        const mes = document.querySelector("#mesUpdate");
        const ano = document.querySelector("#anoUpdate");

        // Validação para garantir que o tipo de gasto foi selecionado
        if (!type) {
            alert("Por favor, selecione um tipo de gasto.");
            return;
        }

        // Validação para garantir que o valor não está vazio
        if (!valor) {
            alert("Por favor, insira um valor.");
            return;
        }

        // Validação para garantir que a descrição não está vazia
        if (!description) {
            alert("Por favor, insira uma descrição.");
            return;
        }

        // Validação para garantir que o mês foi selecionado
        if (!mes.value) {
            alert("Por favor, selecione um mês.");
            return;
        }

        // Validação para garantir que o mês foi selecionado
        if (!dia.value) {
            alert("Por favor, selecione um dia.");
            return;
        }

        // Validação para garantir que o ano foi selecionado
        if (!ano.value) {
            alert("Por favor, selecione um ano.");
            return;
        }


        const data = { 
            valor: replaceDot(valor), 
            typeId: type,
            description: description,
            dia: dia.value,
            mes: mes.value,
            ano: ano.value
        };

        console.log(data)

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
                document.getElementById("filterMonth").value = "";
                carregarOpcoes();
                fetchItems();
                removeInArray(aux);
            })
            .catch(error => console.error("Erro ao atualizar item:", error));

        }else{
            alert("Selecione somente um campo de cada vez")
        }

    });

    // Função para preencher o formulário com os dados do item a ser atualizado
    function carregarDadosItem(transactionId) {
        fetch(`${apiUrl}/${transactionId}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${lerCookie("authToken")}`,
            },
        })
            .then((response) => {
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error("Erro ao buscar os dados do item.");
                }
            })
            .then((item) => {
                loadDiaOptions1(item.mes);
                document.getElementById("valor").value = item.valor || "";
                document.getElementById("description").value = item.description || "";
                document.querySelector("#diaUpdate").value = item.dia || "";
                document.querySelector("#mesUpdate").value = item.mes || "";
                document.querySelector("#anoUpdate").value = item.ano || "";
            })
            .catch((error) => {
                console.error("Erro ao carregar os dados do item:", error);
                alert("Não foi possível carregar os dados do item.");
            });
    }

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

    function loadAnoOptions() {
        const select = document.querySelector("#ano"); // Seleciona o <select> de anos
    
        // Obtém o ano atual
        const anoAtual = new Date().getFullYear();
        const anosAdicionais = 5; // Quantos anos à frente serão exibidos
    
        // Itera pelos anos e cria <option> para cada ano
        for (let i = 0; i <= anosAdicionais; i++) {
            const option = document.createElement("option");
            option.value = anoAtual - i; // Define o valor da opção como o ano
            option.textContent = anoAtual - i; // Define o texto da opção como o ano
            select.appendChild(option); // Adiciona a opção ao select
        }
    }

    function loadMesOptions() {
        const select = document.querySelector("#mes"); // Seleciona o <select> de meses
    
        // Array com os nomes dos meses
        const meses = [
            "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", 
            "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
        ];
    
        // Limpa o select antes de adicionar os novos valores
        select.innerHTML = "";
    
        // Adiciona uma opção padrão
        const defaultOption = document.createElement("option");
        defaultOption.value = ""; // Valor vazio para a opção padrão
        defaultOption.textContent = "Selecione o mês"; // Texto da opção padrão
        select.appendChild(defaultOption);
    
        // Itera pelos meses e cria <option> para cada mês
        meses.forEach((mes, index) => {
            const option = document.createElement("option");
            option.value = index + 1; // Define o valor da opção como o número do mês (1 para Janeiro, etc.)
            option.textContent = mes; // Define o texto da opção como o nome do mês
            select.appendChild(option); // Adiciona a opção ao select
        });

        // Evento para carregar os dias quando um mês é selecionado
        select.addEventListener("change", () => {
            const mesSelecionado = parseInt(select.value); // Obtém o valor do mês selecionado
            loadDiaOptions(mesSelecionado); // Chama a função para carregar os dias
        });
    }

    function loadDiaOptions(mesSelecionado) {
        const diaSelect = document.querySelector("#dia"); // Seleciona o <select> de dias
    
        // Limpa o select de dias antes de adicionar novos valores
        diaSelect.innerHTML = "";

        // Adiciona a opção padrão "Selecione o dia"
        const defaultOption = document.createElement("option");
        defaultOption.value = "";
        defaultOption.textContent = "Selecione o dia";
        diaSelect.appendChild(defaultOption);
    
        // Verifica se um mês válido foi selecionado
        if (!mesSelecionado || isNaN(mesSelecionado) || mesSelecionado < 1 || mesSelecionado > 12) {
            const defaultOption = document.createElement("option");
            defaultOption.value = "";
            defaultOption.textContent = "Selecione um mês válido";
            diaSelect.appendChild(defaultOption);
            return;
        }
    
        // Calcula o número de dias no mês selecionado
        const diasNoMes = new Date(2024, mesSelecionado, 0).getDate();
    
        // Preenche os dias no select
        for (let dia = 1; dia <= diasNoMes; dia++) {
            const option = document.createElement("option");
            option.value = dia; // O valor será o número do dia
            option.textContent = dia; // O texto exibido também será o número do dia
            diaSelect.appendChild(option); // Adiciona a opção ao select
        }
    }

    function loadDiaOptions1(mesSelecionado) {
        const diaSelect = document.querySelector("#diaUpdate"); // Seleciona o <select> de dias
    
        // Limpa o select de dias antes de adicionar novos valores
        diaSelect.innerHTML = "";

        // Adiciona a opção padrão "Selecione o dia"
        const defaultOption = document.createElement("option");
        defaultOption.value = "";
        defaultOption.textContent = "Selecione o dia";
        diaSelect.appendChild(defaultOption);
    
        // Verifica se um mês válido foi selecionado
        if (!mesSelecionado || isNaN(mesSelecionado) || mesSelecionado < 1 || mesSelecionado > 12) {
            const defaultOption = document.createElement("option");
            defaultOption.value = "";
            defaultOption.textContent = "Selecione um mês válido";
            diaSelect.appendChild(defaultOption);
            return;
        }
    
        // Calcula o número de dias no mês selecionado
        const diasNoMes = new Date(2024, mesSelecionado, 0).getDate();
    
        // Preenche os dias no select
        for (let dia = 1; dia <= diasNoMes; dia++) {
            const option = document.createElement("option");
            option.value = dia; // O valor será o número do dia
            option.textContent = dia; // O texto exibido também será o número do dia
            diaSelect.appendChild(option); // Adiciona a opção ao select
        }
    }
    

    function loadAnoOptions1() {
        const select = document.querySelector("#anoUpdate"); // Seleciona o <select> de anos
    
        // Obtém o ano atual
        const anoAtual = new Date().getFullYear();
        const anosAdicionais = 5; // Quantos anos à frente serão exibidos
    
        // Itera pelos anos e cria <option> para cada ano
        for (let i = 0; i <= anosAdicionais; i++) {
            const option = document.createElement("option");
            option.value = anoAtual - i; // Define o valor da opção como o ano
            option.textContent = anoAtual - i; // Define o texto da opção como o ano
            select.appendChild(option); // Adiciona a opção ao select
        }
    }

    function loadMesOptions1() {
        const select = document.querySelector("#mesUpdate"); // Seleciona o <select> de meses
    
        // Array com os nomes dos meses
        const meses = [
            "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", 
            "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
        ];
    
        // Limpa o select antes de adicionar os novos valores
        select.innerHTML = "";
    
        // Adiciona uma opção padrão
        const defaultOption = document.createElement("option");
        defaultOption.value = ""; // Valor vazio para a opção padrão
        defaultOption.textContent = "Selecione o mês"; // Texto da opção padrão
        select.appendChild(defaultOption);
    
        // Itera pelos meses e cria <option> para cada mês
        meses.forEach((mes, index) => {
            const option = document.createElement("option");
            option.value = index + 1; // Define o valor da opção como o número do mês (1 para Janeiro, etc.)
            option.textContent = mes; // Define o texto da opção como o nome do mês
            select.appendChild(option); // Adiciona a opção ao select
        });

        // Evento para carregar os dias quando um mês é selecionado
        select.addEventListener("change", () => {
            const mesSelecionado = parseInt(select.value); // Obtém o valor do mês selecionado
            loadDiaOptions1(mesSelecionado); // Chama a função para carregar os dias
        });
    }

    // Carregar a lista de itens ao iniciar a página
    fetchItems();
});
