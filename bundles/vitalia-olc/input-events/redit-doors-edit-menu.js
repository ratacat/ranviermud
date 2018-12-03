'use strict';

/**
 * Room edit - Adicionar item a sala
 */

const sprintf = require('sprintf-js').sprintf;

module.exports = (srcPath) => {
  const EventUtil     = require(srcPath + 'EventUtil');
  const Logger        = require(srcPath + 'Logger');

  return {
    event: state => (socket, room, args) => {
      const say      = EventUtil.genSay(socket);
      const write    = EventUtil.genWrite(socket);

      if (args.door_selected == '') {
        say('Adicionando nova porta...');
        write('Digite o ID da sala (exemplo: midgaard:1) ou \'Q\' para voltar : ');
        socket.once('data', val => {
          val = val.toString().trim().toLowerCase();
          if (val == 'q') {
            args.door_selected = '';
            return socket.emit('redit-doors-menu', socket, room, args);
          }
          // Find the room
          const roomDef = state.RoomManager.getRoom(val);
          if (!roomDef) {
            args.errorMsg = `Sala <yellow>${val}</yellow> inexistente.`;
          } else {
            // Valid room
            args.door_selected = val;
          }

          if (typeof args.errorMsg != 'undefined' && args.errorMsg != '') {
            say(`<red>${args.errorMsg}</red>`);
            args.errorMsg = '';
          }
          return socket.emit('redit-doors-edit-menu', socket, room, args);
        });
      } else {
        say('Edição de porta...');
        if (typeof room.doors == 'undefined') room.doors = {};
        if (typeof room.doors[args.door_selected] == 'undefined') {
          room.doors[args.door_selected] = {};
          room.doors[args.door_selected].flags = [];
          room.doors[args.door_selected].name = 'uma porta';
          room.doors[args.door_selected].closed = true;
          room.doors[args.door_selected].locked = false;
        }
        let door = room.doors[args.door_selected];
        const roomDef = state.RoomManager.getRoom(args.door_selected);
      
        let options = [];
        options.push({ display: `-- Porta [<cyan>${args.door_selected} - ${roomDef.title}</cyan>]` });

        options.push({
          display: `Nome da porta : <cyan>${door.name}</cyan>`,
          onSelect: () => {
            say(`Utilize nome em minúsculo, começando com artigo. Exemplo: um portão prateado`);
            write('Entre com o nome: ');
            socket.once('data', name => {
              name = name.toString().trim();
              if (name == '') {
                args.errorMsg = 'O nome utilizado vai ser o padrão <yellow>uma porta</yellow>';
              } else {
                door.name = name;
              }
              return socket.emit('redit-doors-edit-menu', socket, room, args);
            });
          },
        });

        options.push({
          display: `Fechada : <cyan>${door.closed ? 'Sim' : 'Não'}</cyan>`,
          onSelect: () => {
            write(`A porta deve ser carregada fechada? [<b>s/N</b>]: `);
            socket.once('data', confirmation => {
              say('');
              confirmation = confirmation.toString().trim().toLowerCase();

              if (!/[sn]/.test(confirmation)) {
                args.errorMsg = 'Resposta inválida!';
                return socket.emit('redit-doors-edit-menu', socket, room, args);
              }

              if (confirmation === 's') {
                door.closed = true;
              } else {
                door.closed = false;
              }
              return socket.emit('redit-doors-edit-menu', socket, room, args);
            });
          },
        });

        options.push({
          display: `Trancada : <cyan>${door.locked ? 'Sim' : 'Não'}</cyan>`,
          onSelect: () => {
            write(`A porta deve ser carregada trancada? [<b>s/N</b>]: `);
            socket.once('data', confirmation => {
              say('');
              confirmation = confirmation.toString().trim().toLowerCase();

              if (!/[sn]/.test(confirmation)) {
                args.errorMsg = 'Resposta inválida!';
                return socket.emit('redit-doors-edit-menu', socket, room, args);
              }

              if (confirmation === 's') {
                door.locked = true;
              } else {
                door.locked = false;
              }
              return socket.emit('redit-doors-edit-menu', socket, room, args);
            });
          },
        });

        const keyItem = door.lockedBy ? state.ItemFactory.getDefinition(door.lockedBy) : null;
        options.push({
          display: `Chave : [<green>${door.lockedBy || '<Sem chave>'}</green>] <yellow>${keyItem ? keyItem.name : ''}</yellow>`,
          onSelect: () => {
            write(`Qual o ID da chave desta porta? (Exemplo: midgaard:10): `);
            socket.once('data', val => {
              say('');
              val = val.toString().trim().toLowerCase();
              const checkitem = state.ItemFactory.getDefinition(val);

              if (!checkitem) {
                args.errorMsg = 'Item inválido! Porta definida como <yellow>sem chave</yellow>.';
                if (door.lockedBy) delete door.lockedBy;
              } else {
                door.lockedBy = val;
              }
              return socket.emit('redit-doors-edit-menu', socket, room, args);
            });
          },
        });

        // Flags
        if (typeof door.flags == 'undefined') {
          door.flags = [];
        }

        let actualFlags = door.flags.join(' ');
        if (actualFlags == '') {
          actualFlags = '<Nenhuma>';
        }

        options.push({
          display: `Flags : <yellow>${actualFlags}</yellow>`,
          onSelect: () => {
            return socket.emit('redit-doors-flags-menu', socket, room, door, args);
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
            return socket.emit('redit-doors-menu', socket, room, args);
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
            return socket.emit('redit-doors-edit-menu', socket, room, args);
          }

          const selection = options.filter(o => !!o.onSelect)[choice];

          if (selection) {
            Logger.log('Selecionado redit doors edit menu:' + selection.display);
            return selection.onSelect();
          }
          args.errorMsg = 'Opção inválida!';
          return socket.emit('redit-doors-edit-menu', socket, room, args);
        });
      }
    }
  };
};
