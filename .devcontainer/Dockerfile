FROM node:latest

RUN apt-get update

RUN apt-get install -y zsh

RUN yarn global add eslint

RUN wget https://github.com/robbyrussell/oh-my-zsh/raw/master/tools/install.sh -O - | zsh || true

CMD ["zsh"]
