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

    const apiUrl = "http://localhost:8080/api/planejamento" 

    const listaCompleta = [];
    const somaPlanejamentoPorId = {}; // Armazena o total por nome de gasto

    loadGastoOptions();
    loadAnoOptions();
    loadMesOptions();

    // Função para criar um novo item
    document.getElementById("createForm").addEventListener("submit", function(e) {
        e.preventDefault();

        const valor = document.querySelector(".valor");
        const type = document.querySelector("#tipoId");
        const mes = document.querySelector("#mes");
        const ano = document.querySelector("#ano");

        // Validação para garantir que o tipo de gasto foi selecionado
        if (!valor.value) {
            alert("Por favor, insira um valor.");
            return;
        }
    
        // Validação para garantir que o tipo de gasto foi selecionado
        if (!type.value) {
            alert("Por favor, selecione um tipo de gasto.");
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
            valorPlanejado: replaceDot(valor.value), 
            mes: mes.value,
            ano: ano.value,
            tipoId: type.value
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
            listaCompleta.length = 0;
            listaGasto();       
            
        })
        .catch(error => console.error("Erro ao criar item:", error));

        // Fechar o modal
        modal.style.display = "none";
    });

    // Função para ler e listar todos os nomes de gastos
    function listaGasto() {
        
        fetch(`http://localhost:8080/api/gastos/list/${localStorage.getItem('userId')}`, {
            headers: {
                'Authorization': `Bearer ${lerCookie('authToken')}`
            }
        })
        .then(response => response.json())
        .then(data => {
            // Armazena os nomes dos gastos
            const nomesGastos = data.map(gasto => gasto.nome); 
            const idsGastos = data.map(gasto => gasto.id); // Armazena os IDs dos gastos

            listaPlanejamento(nomesGastos, idsGastos);   // Busca e lista os valores de planejamento por ID
        })
        .catch(error => console.error("Erro ao carregar itens:", error));
    }

    function listaPlanejamento(nomesGastos, idsGastos) {
        nomesGastos.forEach(nome => {
            somaPlanejamentoPorId[nome] = 0; // Define o total inicial como 0
        });
    
        // Função auxiliar para fazer a requisição sequencialmente
        const fetchSequentially = async (idsGastos) => {
            for (const idGasto of idsGastos) {
                try {
                    const response = await fetch(`http://localhost:8080/api/planejamento/list/${idGasto}`, {
                        headers: {
                            'Authorization': `Bearer ${lerCookie('authToken')}`
                        }
                    });
                    const data = await response.json();
    
                    // Verifica se a resposta contém dados
                    if (Array.isArray(data)) {
                        // Itera sobre os dados de planejamento e acumula os valores e detalhes
                        data.forEach(planejamento => {
                            const valor = planejamento.valorPlanejado || 0; // Usa 0 se valorPlanejado for undefined
                            const nomeGasto = planejamento.type; // Mapeia o tipo do planejamento
                            const mes = planejamento.mes;
                            const ano = planejamento.ano;
    
                            // Verifica se o nome do gasto existe nos nomes obtidos anteriormente
                            if (nomesGastos.includes(nomeGasto)) {
                                somaPlanejamentoPorId[nomeGasto] += valor; // Acumula o valor de planejamento para o nome do gasto
    
                                // Salva o objeto completo de planejamento na lista
                                listaCompleta.push({
                                    nome: nomeGasto,
                                    valor: valor,
                                    mes: mes,
                                    ano: ano
                                });
                            }
                        });
                    }
                } catch (error) {
                    console.error(`Erro ao carregar planejamento para o gasto ${idGasto}:`, error);
                }
            }
            // Renderiza a tabela após todas as requisições serem concluídas
            renderizarTabelaFiltrada(listaCompleta);
        };
    
        // Chama a função auxiliar para iniciar as requisições
        fetchSequentially(idsGastos);
    }

    // Função para renderizar a tabela com os itens filtrados
    function renderizarTabelaFiltrada(itemsFiltrados) {
        const tabela = document.getElementById('itemTable').getElementsByTagName('tbody')[0];
        tabela.innerHTML = ''; // Limpa a tabela antes de renderizar novamente

        let totalValor = 0; // Inicializa o total

        itemsFiltrados.forEach(item => {
            const novaLinha = tabela.insertRow();

            const celulaNome = novaLinha.insertCell();
            celulaNome.textContent = item.nome;

            const celulaData = novaLinha.insertCell();
            celulaData.textContent = `${String(item.mes).padStart(2, '0')}/${item.ano}`;

            const celulaValor = novaLinha.insertCell();
            celulaValor.textContent = `R$ ${item.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

            totalValor += item.valor; // Acumula o valor para o total
        });

        // Cria a linha de total
        const linhaTotal = tabela.insertRow();
        
        const celulaTotalNome = linhaTotal.insertCell();
        celulaTotalNome.textContent = "Total"; // Nome da célula total
        celulaTotalNome.colSpan = 2; // Abrevia o total em 2 colunas, ajustando conforme necessário
        celulaTotalNome.style.fontWeight = 'bold'; // Define o texto em negrito

        const celulaTotalValor = linhaTotal.insertCell();
        celulaTotalValor.textContent = `R$ ${totalValor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`; // Mostra o total
        celulaTotalValor.style.fontWeight = 'bold'; // Define o texto em negrito

        // Adiciona a linha de total à tabela
        tabela.appendChild(linhaTotal);
    }

    // Função para carregar os dados e preencher o select
    function carregarOpcoes() {
        preencherSelectAno();

        // Array de meses por extenso para comparação
        const mesesPorExtenso = [
            "janeiro", "fevereiro", "março", "abril", "maio",
            "junho", "julho", "agosto", "setembro", "outubro",
            "novembro", "dezembro"
        ];

        // Função para filtrar os itens
        function applyFilters() {
            const filterYear = document.getElementById("filterYear").value; // Ano selecionado
            const filterMonth = document.getElementById("filterMonth").value; // Mês selecionado (nome por extenso)

            let planejamentoItems = listaCompleta; // Começa com a lista completa de planejamentos

            // Aplica o filtro de ano se um ano for selecionado
            if (filterYear) {
                planejamentoItems = planejamentoItems.filter(item => item.ano === parseInt(filterYear));
            }

            // Aplica o filtro de mês se um mês for selecionado
            if (filterMonth) {
                planejamentoItems = planejamentoItems.filter(item => {
                    const itemMonthIndex = item.mes; // O mês está armazenado como número (1-12)
                    return mesesPorExtenso[itemMonthIndex - 1] === filterMonth; // Compara com o nome do mês selecionado
                });
            }

            // Inicializa os planejamentos filtrados para cada tipo de gasto com valor 0
            const planejamentosFiltrados = {};
            Object.keys(somaPlanejamentoPorId).forEach(tipo => {
                planejamentosFiltrados[tipo] = 0; // Inicializa valores acumulados
            });

            // Calcula o total de planejamentos filtrados por tipo
            planejamentoItems.forEach(item => {
                const tipo = item.nome;
                if (planejamentosFiltrados[tipo] !== undefined) {
                    planejamentosFiltrados[tipo] += item.valor || 0; // Acumula o total de planejamento para o tipo
                }
            });

            // Renderiza os itens filtrados na tabela e gráfico
            renderizarTabelaFiltrada(planejamentoItems); // Atualiza a tabela
        }

        // Adiciona o evento de mudança para os dois campos
        document.getElementById("filterYear").addEventListener("change", applyFilters);
        document.getElementById("filterMonth").addEventListener("change", applyFilters);
    }

    // Chama a função para carregar as opções quando a página carregar
    window.onload = carregarOpcoes;

    // Função para preencher o select de ano
    function preencherSelectAno() {
        const yearSelect = document.getElementById("filterYear");
        const currentYear = new Date().getFullYear(); // Obtém o ano atual
        const endYear = currentYear + 5; // Define o ano final (10 anos no futuro)

        for (let year = currentYear; year <= endYear; year++) {
            const option = document.createElement("option");
            option.value = year;
            option.textContent = year;
            yearSelect.appendChild(option);
        }
    }


    // Função para carregar as opções no select
    function loadGastoOptions() {
        const select = document.querySelector("#tipoId");      

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

    function loadAnoOptions() {
        const select = document.querySelector("#ano"); // Seleciona o <select> de anos
    
        // Obtém o ano atual
        const anoAtual = new Date().getFullYear();
        const anosAdicionais = 5; // Quantos anos à frente serão exibidos
    
        // Itera pelos anos e cria <option> para cada ano
        for (let i = 0; i <= anosAdicionais; i++) {
            const option = document.createElement("option");
            option.value = anoAtual + i; // Define o valor da opção como o ano
            option.textContent = anoAtual + i; // Define o texto da opção como o ano
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
    }

    // Função para trocar a vírgula pelo ponto
    function replaceDot(valor){
        return valor.replace(",", ".");
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

    // Função de logout
    document.getElementById("logout").addEventListener("click", function(e) {
        // Remover token do localStorage ou sessionStorage
        //localStorage.removeItem('authToken'); // ou sessionStorage.removeItem('token');
        
        excluirCookie("authToken");
        
        localStorage.removeItem('userId'); // Remove o id do usuário
        
        // Redirecionar o usuário para a página de login ou outra página
        window.location.href = './home.html';

    });

    // Chama a função para listar os gastos e renderizar a tabela
    listaGasto();   

});