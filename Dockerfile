FROM nginx:alpine

COPY index.html /usr/share/nginx/html/
COPY *.css /usr/share/nginx/html/
COPY *.js /usr/share/nginx/html/
COPY *.json /usr/share/nginx/html/
COPY *.svg /usr/share/nginx/html/
COPY *.txt /usr/share/nginx/html/
COPY images /usr/share/nginx/html/images/

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
