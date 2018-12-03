'use strict';

/**
 * Room edit - Editar saída da sala
 */

const sprintf = require('sprintf-js').sprintf;

module.exports = (srcPath) => {
  const EventUtil     = require(srcPath + 'EventUtil');
  const Logger        = require(srcPath + 'Logger');

  return {
    event: state => (socket, room, args) => {
      const say      = EventUtil.genSay(socket);
      const write    = EventUtil.genWrite(socket);

      let options = [];
      options.push({ display: `-- Saída [<cyan>${args.exit_selected}</cyan>]` });
      if (typeof room.exits == 'undefined') room.exits = [];
      let currExit;
      let roomDef;
      for (let ex in room.exits) {
        if (room.exits[ex].direction == args.exit_selected) {
          currExit = ex;
          roomDef = state.RoomManager.getRoom(room.exits[currExit].roomId);
        }
      }

      if (!currExit) {
        currExit = room.exits.length;
        room.exits.push({ 'direction' : args.exit_selected });
      }

      let roomTitle = 'Sala Inválida!!!!';
      if (roomDef) {
        roomTitle = roomDef.title;
      }

      options.push({
        display: `Destino : <cyan>${room.exits[currExit].roomId ? room.exits[currExit].roomId + ' - ' + roomTitle: 'Não definido'}</cyan>`,
        onSelect: () => {
          say(`ID da sala de destino (Exemplo: midgaard:10)`);
          say('Digite -1 para remover a saída.');
          write('Entre com o ID (-1 para remover): ');
          socket.once('data', id => {
            id = id.toString().trim();
            if (id == '-1') {
              delete room.exits[currExit].roomId;
              return socket.emit('redit-exits-edit-menu', socket, room, args);
            }
            roomDef = state.RoomManager.getRoom(id);
            if (!roomDef) {
              args.errorMsg = `Sala inexistente: [${id}]`;
            } else {
              room.exits[currExit].roomId = id;
            }
            return socket.emit('redit-exits-edit-menu', socket, room, args);
          });
        },
      });

      options.push({
        display: `Mensagem : <b>${room.exits[currExit].leaveMessage ? 'Fulano' + room.exits[currExit].leaveMessage : 'Sem Mensagem'}</b>`,
        onSelect: () => {
          say('A mensagem aparece depois do nome do player. Exemplo de mensagem:');
          say('"desaparece na escuridão."');
          say('Produzirá: Fulano desaparece na escuridão.');
          write(`Qual mensagem após o nome do player ao sair da sala? `);
          socket.once('data', msg => {
            msg = msg.toString().trim();
            if (msg == '') {
              delete room.exits[currExit].leaveMessage;
            } else {
              room.exits[currExit].leaveMessage = ' ' + msg;
            }
            return socket.emit('redit-exits-edit-menu', socket, room, args);
          });
        },
      });

      options.push({
        display: 'Remover esta saída',
        onSelect: () => {
          room.exits.splice(currExit, 1);
          return socket.emit('redit-exits-menu', socket, room, args);
        },
      });

      let optionI = 0;
      options.forEach((opt) => {
        if (opt.onSelect) {
          optionI++;
          say(`[<green>${optionI < 10 ? ' ' : ''}${optionI}</green>] ${opt.display}`);
        } else {
          say(`${opt.display}`);
        }
      });

      let quit = [];
      quit.push({
        display: 'Voltar ao menu anterior',
        onSelect: () => {
          if (!room.exits[currExit].roomId) {
            room.exits.splice(currExit, 1);
          }
          return socket.emit('redit-exits-menu', socket, room, args);
        },
      });
      say('');
      say(`[<green>Q</green>]  ${quit[0].display}`);
      say('');
      if (typeof args.errorMsg != 'undefined' && args.errorMsg != '') {
        say(`<red>${args.errorMsg}</red>`);
        args.errorMsg = '';
      }

      write('Entre com a opção : ');

      socket.once('data', choice => {
        choice = choice.toString().trim().toLowerCase();

        if (choice == 'q') {
          return quit[0].onSelect();
        }

        choice = parseInt(choice, 10) - 1;
        if (isNaN(choice)) {
          args.errorMsg = 'Opção inválida!';
          return socket.emit('redit-exits-edit-menu', socket, room, args);
        }

        const selection = options.filter(o => !!o.onSelect)[choice];

        if (selection) {
          Logger.log('Selecionado redit exits edit menu:' + selection.display);
          return selection.onSelect();
        }
        args.errorMsg = 'Opção inválida!';
        return socket.emit('redit-exits-edit-menu', socket, room, args);
      });
    }
  };
};
