'use strict';

/**
 * Room edit - Exits menu
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
      options.push({ display: '-- Room Exits' });

      const directions = [
        'north'     ,
        'east'      ,
        'south'     ,
        'west'      ,
        'northeast' ,
        'southeast' ,
        'northwest' ,
        'southwest' ,
        'up'        ,
        'down'      
      ];

      let currExits = {};
      for (let ex in room.exits) {
        currExits[room.exits[ex].direction] = room.exits[ex];
      }

      for (let idx in directions) {
        const ex = directions[idx];
        let dispValue = sprintf('[<cyan>%-9s</cyan>]: <Não definida>', ex);
        if (currExits[ex] && typeof currExits[ex].roomId != 'undefined') {
          const roomDef = state.RoomManager.getRoom(currExits[ex].roomId);

          let roomTitle = 'Sala Inválida!!!!';
          if (roomDef) {
            roomTitle = roomDef.title;
          }
          dispValue = sprintf('[<cyan>%-9s</cyan>]: [<cyan>%-15s</cyan>][<cyan>%-35s</cyan>] (<b>%s</b>)', ex, currExits[ex].roomId, roomTitle, currExits[ex].leaveMessage ? 'Fulano' + currExits[ex].leaveMessage : 'Sem Msg');
        }
        options.push({
          display: dispValue,
          onSelect: () => {
            args.exit_selected = ex;
            return socket.emit('redit-exits-edit-menu', socket, room, args);
          },
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
      write('Enter your choice : ');

      socket.once('data', choice => {
        choice = choice.toString().trim().toLowerCase();

        if (choice == 'q') {
          return quit[0].onSelect();
        }
        
        choice = parseInt(choice, 10) - 1;
        if (isNaN(choice)) {
          args.errorMsg = 'Opção inválida!';
          return socket.emit('redit-exits-menu', socket, room, args);
        }

        const selection = options.filter(o => !!o.onSelect)[choice];

        if (selection) {
          Logger.log('Selecionado redit exits menu ' + selection.display);
          return selection.onSelect();
        }
        args.errorMsg = 'Opção inválida!';
        return socket.emit('redit-exits-menu', socket, room, args);
      });
    }
  };
};

