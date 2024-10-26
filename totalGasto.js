document.addEventListener("DOMContentLoaded", function() {
    const apiUrl = "http://localhost:8080/api/transaction";

    let allItems = [];  // Lista de todos os itens
    // Variável para armazenar os dados completos
    let listaCompleta = [];
    let gastosPorTipo = {}; // Armazena os gastos por tipo
    let somaPlanejamentoPorId = {};

    let myChart;

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

            listaValoresGasto(nomesGastos);
            listaPlanejamento(nomesGastos, idsGastos);   // Busca e lista os valores de planejamento por ID
        })
        .catch(error => console.error("Erro ao carregar itens:", error));
    }

    // Função para buscar os valores dos gastos
    function listaValoresGasto(nomesGastos) {
        fetch(`${apiUrl}/list/${localStorage.getItem('userId')}`, {
            headers: {
                'Authorization': `Bearer ${lerCookie('authToken')}`
            }
        })
        .then(response => response.json())
        .then(data => {
            // Inicializa os gastos com 0 para cada nome
            nomesGastos.forEach(nome => {
                gastosPorTipo[nome] = 0; // Define o total inicial como 0
            });

            // Armazena os valores em um objeto
            data.forEach(gasto => {
                const tipo = gasto.type;
                const total = gasto.valor;

                // Verifica se o nome do gasto existe nos nomes obtidos anteriormente
                if (nomesGastos.includes(tipo)) {
                    gastosPorTipo[tipo] += total; // Acumula o total se o nome do gasto existir
                }
            });

            allItems = data; // Armazena todos os itens
            console.log(allItems)
            renderGastosPorTipo(gastosPorTipo, somaPlanejamentoPorId); // Renderiza a tabela inicialmente
        })
        .catch(error => console.error("Erro ao carregar itens:", error));
    }

    function listaPlanejamento(nomesGastos, idsGastos) {
        nomesGastos.forEach(nome => {
            somaPlanejamentoPorId[nome] = 0; // Define o total inicial como 0
        });
    
        // Faz uma requisição para cada ID de gasto sequencialmente
        const fetchPromises = idsGastos.map(idGasto => {
            return fetch(`http://localhost:8080/api/planejamento/list/${idGasto}`, {
                headers: {
                    'Authorization': `Bearer ${lerCookie('authToken')}`
                }
            })
            .then(response => response.json())
            .then(data => {
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
                renderGastosPorTipo(gastosPorTipo, somaPlanejamentoPorId); // Renderiza a tabela inicialmente
            })
            .catch(error => {
                console.error(`Erro ao carregar planejamento para o gasto ${idGasto}:`, error);
            });
        });
    }

    function renderizarGrafico(gastosPorTipo, somaPlanejamentoPorId) {
        const ctx = document.getElementById('myChart').getContext('2d');

        // Destruir o gráfico existente se já houver um
        if (myChart) {
            myChart.destroy();
        }
    
        const labels = Object.keys(gastosPorTipo);
        const dadosGastos = Object.values(gastosPorTipo);
        const dadosPlanejamento = Object.values(somaPlanejamentoPorId);
    
        myChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels, 
                datasets: [
                    {
                        label: 'Planejamento',
                        data: dadosPlanejamento,
                        backgroundColor: 'rgba(54, 162, 235, 0.6)',
                        borderColor: 'rgba(54, 162, 235, 1)',
                        borderWidth: 1
                    },
                    {
                        label: 'Gastos',
                        data: dadosGastos,
                        backgroundColor: 'rgba(255, 99, 132, 0.6)',
                        borderColor: 'rgba(255, 99, 132, 1)',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                },plugins: {
                    datalabels: {
                        anchor: 'end',
                        align: 'end',
                        offset: -4,
                        formatter: (value) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, // Formata o valor com "R$"
                        color: 'black',
                        font: {
                            weight: 'bold'
                        }
                    }
                }
            },
            plugins: [ChartDataLabels] // Adicione o plugin para mostrar os valores
        });
    }

    function renderGastosPorTipo(gastosPorTipo, somaPlanejamentoPorId) {
        const tableBody = document.getElementById("itemTable").querySelector("tbody"); // Seleciona o corpo da tabela
        tableBody.innerHTML = ""; // Limpa o corpo da tabela antes de adicionar novos itens
    
        console.log("gastosPorTipo:", gastosPorTipo);
        console.log("somaPlanejamentoPorId:", somaPlanejamentoPorId);
        let totalGastos = 0; // Variável para armazenar a soma dos gastos
        let totalPlanejamento = 0; // Variável para a soma dos valores de planejamento
    
        // Itera sobre o objeto de gastos por tipo
        for (const [tipo, total] of Object.entries(gastosPorTipo)) {
            const row = document.createElement("tr");
    
            // Cria célula para "Tipo de Gasto"
            const tipoCell = document.createElement("td");
            tipoCell.textContent = tipo;
    
            // Cria célula para "Total"
            const totalCell = document.createElement("td");
            totalCell.textContent = updateValor(total); // Formata o total com duas casas decimais
    
            // Cria célula para "Planejamento"
            const planejamentoCell = document.createElement("td");
            const planejamentoValor = somaPlanejamentoPorId[tipo] || 0; // Verifica o valor de planejamento para este tipo
            planejamentoCell.textContent = updateValor(planejamentoValor); // Formata o valor de planejamento
    
            // Adiciona as células à linha
            row.appendChild(tipoCell);
            row.appendChild(totalCell);
            row.appendChild(planejamentoCell); // Adiciona a célula de planejamento à linha
    
            // Adiciona a linha ao corpo da tabela
            tableBody.appendChild(row);
    
            // Acumula o total dos gastos e planejamento
            totalGastos += total;
            totalPlanejamento += planejamentoValor;
        }
    
        // Adiciona uma linha de total ao final da tabela
        const totalRow = document.createElement("tr");
        const totalLabelCell = document.createElement("td");
        totalLabelCell.textContent = "Total"; // Texto da célula
        totalLabelCell.style.fontWeight = "bold"; // Destaca o texto
    
        const totalValueCell = document.createElement("td");
        totalValueCell.textContent = updateValor(totalGastos); // Formata o total com duas casas decimais
    
        const totalPlanejamentoCell = document.createElement("td");
        totalPlanejamentoCell.textContent = updateValor(totalPlanejamento); // Formata o total de planejamento
    
        totalRow.appendChild(totalLabelCell);
        totalRow.appendChild(totalValueCell);
        totalRow.appendChild(totalPlanejamentoCell); // Adiciona o total de planejamento
    
        // Adiciona a linha de total ao corpo da tabela
        tableBody.appendChild(totalRow);

        // Chamar a função do gráfico ao final do preenchimento da tabela
        renderizarGrafico(gastosPorTipo, somaPlanejamentoPorId);
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

            let filteredItems = allItems; // Presume que allItems contém todos os itens disponíveis
            let planejamentoItems = listaCompleta; // A lista completa de planejamentos

            // Aplica o filtro de ano se um ano for selecionado
            if (filterYear) {
                filteredItems = filteredItems.filter(item => {
                    const itemYear = item.ano; // Extrai o ano do item
                    return itemYear === parseInt(filterYear); // Compara com o ano selecionado
                });

                planejamentoItems = planejamentoItems.filter(item => {
                    const itemYear = item.ano; // O ano já está presente no objeto planejamento
                    return itemYear === parseInt(filterYear); // Compara com o ano selecionado
                });
            }

            // Aplica o filtro de mês se um mês for selecionado
            if (filterMonth) {
                filteredItems = filteredItems.filter(item => {
                    const itemMonthIndex = item.mes; // O mês está armazenado como número (1-12)
                    return mesesPorExtenso[itemMonthIndex - 1] === filterMonth; // Compara com o nome do mês selecionado
                });

                planejamentoItems = planejamentoItems.filter(item => {
                    const itemMonthIndex = item.mes; // O mês está armazenado como número (1-12) no objeto planejamento
                    return mesesPorExtenso[itemMonthIndex - 1] === filterMonth; // Compara com o nome do mês selecionado
                });
            }

            // Inicializa os gastos filtrados e planejamentos filtrados com 0 para cada tipo
            const gastosFiltrados = {};
            const planejamentosFiltrados = {};

            Object.keys(gastosPorTipo).forEach(tipo => {
                gastosFiltrados[tipo] = 0; // Inicializa gastos filtrados
            });

            Object.keys(somaPlanejamentoPorId).forEach(tipo => {
                planejamentosFiltrados[tipo] = 0; // Inicializa planejamentos filtrados
            });

            // Atualiza os gastos por tipo com os valores filtrados
            filteredItems.forEach(item => {
                const tipo = item.type;

                // Acumula total
                if (gastosFiltrados[tipo] !== undefined) {
                    gastosFiltrados[tipo] += item.valor || 0; // Acumula o total
                }
            });

            // Atualiza os planejamentos filtrados com os valores filtrados
            planejamentoItems.forEach(item => {
                const tipo = item.nome; // No objeto de planejamento, o tipo é o nome
                if (planejamentosFiltrados[tipo] !== undefined) {
                    planejamentosFiltrados[tipo] += item.valor || 0; // Acumula o total de planejamento
                }
            });

            // Renderiza os itens filtrados
            renderGastosPorTipo(gastosFiltrados, planejamentosFiltrados);
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
        const startYear = currentYear - 10; // Define o ano inicial (exemplo: 10 anos atrás)

        for (let year = currentYear; year >= startYear; year--) {
            const option = document.createElement("option");
            option.value = year;
            option.textContent = year;
            yearSelect.appendChild(option);
        }
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
    
    // Função para formatação da moeda 
    function updateValor(valor) {
        return valor.toLocaleString('pt-br', {style: 'currency', currency: 'BRL'});
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

    // Chama a função para listar os gastos e renderizar a tabela
    listaGasto();   
});
