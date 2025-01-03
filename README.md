# Documentação do Aplicativo Front-End

## Introdução

Este aplicativo front-end permite que os usuários gerenciem suas finanças de forma eficiente. Aqui, você encontrará instruções sobre como instalar, configurar e usar o aplicativo.

## Pré-requisitos

Antes de começar, certifique-se de ter as seguintes ferramentas instaladas:

- [Node.js](https://nodejs.org/) (versão 14 ou superior)
- [npm](https://www.npmjs.com/) (geralmente instalado junto com o Node.js)

## Ferramentas Utilizadas

- **JavaScript**: Linguagem principal utilizada para o desenvolvimento do front-end.
- **CSS**: Utilizado para estilizar e formatar a interface do usuário.
- **HTML**: Estrutura básica do conteúdo do aplicativo.

## Instalação

1. Clone o repositório do aplicativo:

   ```bash
   git clone https://github.com/sergioperess/frontend_tcc.git
   ```

2. Acesse o diretório do projeto:

   ```bash
   cd frontend_tcc
   ```

3. Compile o projeto:

   ```bash
   mvn clean install
   ```

4. Para iniciar o aplicativo é necessário criar um servidor local:

- **Utilizando Phyton 3**
    1. Abra o terminal.
    2. Inicie o servidor. Execute o seguinte comando:

        ```bash
        python -m http.server 8000
        ```
        Aqui, `8000` é o número da porta que você deseja usar. Você pode escolher outra porta se preferir, mas 8000 é uma escolha comum.
    3. Acesse o servidor no navegador. Abra um navegador da web e vá para:

        ```bash
        http://localhost:8000
        ```

- **Utilizando a extensão Live Server no VSCode**
    1. Abra o Visual Studio Code.
    2. Vá para a aba de Extensões (ícone de quadrado no menu lateral esquerdo ou use o atalho `Ctrl + Shift + X`).
    3. Na barra de pesquisa, digite **Live Server**.
    4. Encontre a extensão chamada **Live Server** (desenvolvida por **Ritwick Dey**) e clique em Instalar.
    5. - Com o arquivo HTML aberto, clique com o botão direito do mouse dentro do editor e selecione Open with Live Server. 
       - Alternativamente, com o projeto aberto, clique em **Go Live** na barra de status no canto inferior direito. 
    6. O Live Server irá abrir automaticamente seu navegador padrão e carregar a página do seu arquivo HTML, geralmente em `http://127.0.0.1:5500/`.

5. Acesse o aplicativo pelo seu navegador utilizando a requisição `http://localhost:8000/home.html` ou `http://127.0.0.1:5500/home.html`.

## Docker

Este guia ensina como configurar e iniciar o ambiente do frontend utilizando Docker.

### Pré-requisitos

- [Docker](https://www.docker.com/get-started) instalado na sua máquina.
- [Docker Compose](https://docs.docker.com/compose/install/) instalado (já incluído no Docker Desktop).

### Como iniciar o projeto

1. No diretório do projeto, construa a imagem do frontend utilizando o seguinte comando:
   ```bash
   docker-compose up -d --build
   ```
2. Acesse o frontend
   Após executar o comando acima, o Docker:
      - Compilará a aplicação frontend.
      - Iniciará o container e exporá a aplicação na porta `3000` do host.

   Abra seu navegador e acesse:
      ```bash
      http://localhost:3000/home.html
      ```

### Comandos úteis

#### Parar o ambiente

- Para parar e remover os containers associados ao projeto, utilize:

   ```bash
   docker-compose down
   ```

#### Reconstruir a aplicação

- Caso faça alterações no código ou no Dockerfile, reconstrua o container:

   ```bash
   docker-compose up -d --build
   ```

### Estrutura do projeto

#### Principais arquivos:

- `docker-compose.yaml`: Configuração do Docker Compose para o serviço frontend.
- `Dockerfile`: Instruções para construir a imagem Docker do frontend.

## Como Usar

- **Gerenciamento de Despesas:** Gerenciamento de transações.
- **Gerenciamento de Tipos de Gastos:** Gerenciamento de tipos de gastos.
- **Planejamento Financeiro:** Crie e visualize seus planejamentos financeiros.
- **Relatórios:** Relatórios com visualização de gastos e planejamentos total ou por período, além de gráfico para melhor visualização.

## Contribuição

Se deseja contribuir com o projeto, siga os seguintes passos:

1. Fork o repositório.

2. Crie um branch para a funcionalidade ou correção:

   ```bash
   git checkout -b minha-nova-funcionalidade
   ```

3. Faça commit das suas alterações:
    
   ```bash
   git commit -m 'Adicionar nova funcionalidade'
   ```
   
4. Envie para o branch original:
    
   ```bash
   git push origin minha-nova-funcionalidade
   ```
   
5. Abra um Pull Request.


