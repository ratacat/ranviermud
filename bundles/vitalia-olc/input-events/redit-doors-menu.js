'use strict';

/**
 * Room edit - Doors menu
 */

const sprintf = require('sprintf-js').sprintf;

module.exports = (srcPath) => {
  const EventUtil = require(srcPath + 'EventUtil');
  const Logger    = require(srcPath + 'Logger');

  return {
    event: state => (socket, room, args) => {
      const say      = EventUtil.genSay(socket);
      const write    = EventUtil.genWrite(socket);

      let options = [];
      options.push({ display: '-- Portas da sala' });
      options.push({ display: 'O quê deseja fazer?' });

      let hasDoor = false;
      if (room.doors) {
        const doors = new Map(Object.entries(JSON.parse(JSON.stringify(room.doors || {}))));
        for (const [key, value] of doors) {
          hasDoor = true;
          break;
        }
      }

      if (hasDoor) {
        options.push({ display: 'Editar uma porta da sala: ' });
        if (room.doors) {
          const doors = new Map(Object.entries(JSON.parse(JSON.stringify(room.doors || {}))));
          for (const [key, value] of doors) {
            const roomDef = state.RoomManager.getRoom(key);
            if (typeof value.flags == 'undefined') {
              value.flags = [];
            }
            let actualFlags = value.flags.join(' ');
            if (actualFlags == '') {
              actualFlags = '<Nenhuma>';
            }
            options.push({
              display: ` [<cyan>${value.name || 'uma porta'}</cyan>] [<green>${value.closed ? 'Fechada' : 'Aberta'}</green>][<green>${value.locked ? 'Trancada' : 'Destrancada'}</green>][<green>${value.lockedBy ? 'Key: <yellow>' + value.lockedBy + '</yellow>': 'Sem chave'}</green>] [<cyan>${key}</cyan>] <cyan>${roomDef.title}</cyan>\r\n Flags: ${actualFlags}`,
              onSelect: (choice) => {
                choice = parseInt(choice);
                args.door_selected = key;
                return socket.emit('redit-doors-edit-menu', socket, room, args);
              },
            });
          }
        }
      }

      options.push({
        display: 'Adicionar porta na sala',
        onSelect: () => {
          args.door_selected = '';
          return socket.emit('redit-doors-edit-menu', socket, room, args);
        }
      });

      if (hasDoor) {
        options.push({
          display: 'Remover porta da sala',
          onSelect: () => {
            return socket.emit('redit-doors-rem-menu', socket, room, args);
          }
        });
      }

      let quit = [];
      quit.push({
        display: 'Voltar ao menu principal',
        onSelect: () => {
          return socket.emit('redit-main-menu', socket, room, args);
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
          return socket.emit('redit-doors-menu', socket, room, args);
        }

        const selection = options.filter(o => !!o.onSelect)[choice];

        if (selection) {
          Logger.log('Selecionado redit doors menu ' + selection.display);
          return selection.onSelect(choice);
        }
        args.errorMsg = 'Opção inválida!';
        return socket.emit('redit-doors-menu', socket, room, args);
      });
    }
  };
};

