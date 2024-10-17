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
        if (!type) {
            alert("Por favor, selecione um tipo de gasto.");
            return;
        }

        // Validação para garantir que o mês foi selecionado
        if (!mes) {
            alert("Por favor, selecione um mês.");
            return;
        }

        // Validação para garantir que o ano foi selecionado
        if (!ano) {
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
        })
        .catch(error => console.error("Erro ao criar item:", error));

        // Fechar o modal
        modal.style.display = "none";
    });

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

});