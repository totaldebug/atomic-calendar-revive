FROM node:latest

RUN apt update

RUN apt upgrade  -y

RUN apt install zsh -y

RUN wget https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh -O - | zsh || true

EXPOSE 5000

CMD ["zsh"]
