
# Usar a imagem do nginx
FROM nginx:alpine

# Copiar os arquivos HTML, CSS e JS diretamente para o diretório padrão do nginx
COPY . /usr/share/nginx/html

# Expor a porta 80
EXPOSE 80

# Iniciar o servidor nginx
CMD ["nginx", "-g", "daemon off;"]
