'use strict';

const sprintf = require('sprintf-js').sprintf;
const fs = require('fs');

/**
 * Room edit - Main menu
 */
module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');
  const EventUtil = require(srcPath + 'EventUtil');
  const Logger    = require(srcPath + 'Logger');
  const Data      = require(srcPath + 'Data');
  const Room      = require(srcPath + 'Room');

  return {
    event: state => (socket, room, args) => {
      const say      = EventUtil.genSay(socket);
      const write    = EventUtil.genWrite(socket);
      const area     = args.areaRef;
      const player   = args.player;
      let   roomFile  = args.parsed;
      const filepath = args.filepath;
      const areaPath = args.areaPath;

      let options = [];
      if (!room.metadata) room.metadata = {};
      options.push({ display: `-- Sala [<cyan>${area.name}:${room.id}</cyan>]` });

      options.push({
        display: `Título : <cyan>${room.title}</cyan>`,
        onSelect: () => {
          write('Entre com o título: ');
          socket.once('data', title => {
            title = title.toString().trim();
            if (title == '') {
              args.errorMsg = 'O título é obrigatório!';
            } else {
              room.title = title;
            }
            return socket.emit('redit-main-menu', socket, room, args);
          });
        },
      });

      options.push({
        display: `Descrição : <yellow>${room.description}</yellow>`,
        onSelect: () => {
          write('Entre com a descrição (Sem quebras de linha): ');
          socket.once('data', description => {
            room.description = description.toString().trim();
            return socket.emit('redit-main-menu', socket, room, args);
          });
        },
      });

      let extraDescs = '';
      for (let desc in room.extraDescs) {
        extraDescs += extraDescs != '' ? ',' + desc : desc;
      }
      options.push({
        display: `Descrições extras : <yellow>${extraDescs != '' ? extraDescs : '<Nenhuma>'}</yellow>`,
        onSelect: () => {
          return socket.emit('redit-extradesc-menu', socket, room, args);
        },
      });


      options.push({
        display: `Terreno : <yellow>[${room.metadata.terrain || 'Indefinido'}]</yellow>`,
        onSelect: () => {
          return socket.emit('redit-terrain-menu', socket, room, args);
        },
      });
      
      // Flags
      if (typeof room.metadata.roomFlags == 'undefined') {
        room.metadata.roomFlags = [];
      }

      let actualFlags = room.metadata.roomFlags.join(' ');
      if (actualFlags == '') {
        actualFlags = '<Nenhuma>';
      }

      options.push({
        display: `Flags : <yellow>${actualFlags}</yellow>`,
        onSelect: () => {
          return socket.emit('redit-flags-menu', socket, room, args);
        },
      });

      options.push({
        display: `Behaviors : <yellow>${room.behaviors ? JSON.stringify(room.behaviors) : '<Nenhum>'}</yellow>`,
        onSelect: () => {
          args.errorMsg = 'Ainda em construção!';
          //return socket.emit('redit-behaviors-menu', socket, room, args);
          return socket.emit('redit-main-menu', socket, room, args);
        },
      });

      options.push({
        display: `Script : <yellow>${room.script || '<Nenhum>'}</yellow>`,
        onSelect: () => {
          // Validacao da existencia do script?
          write('Entre com o script: ');
          socket.once('data', script => {
            script = script.toString().trim();

            if (script != '') {
              const scriptPath = areaPath + '/scripts/rooms/' + script + '.js';
              if (!fs.existsSync(scriptPath)) {
                args.errorMsg = 'Script inexistente: ' + area.name + '/scripts/rooms/' + script + '.js';
                return socket.emit('redit-main-menu', socket, room, args);
              }
            }

            room.script = script;
            return socket.emit('redit-main-menu', socket, room, args);
          });
        },
      });

      options.push({
        display: `Coordenadas : <cyan>${room.coordinates ? JSON.stringify(room.coordinates) : '<N/A>'}</cyan>`,
        onSelect: () => {
          say('Exemplo de coordenadas x y z: <green>1 0 -2</green>')
          write('Entre com as coordenadas separadas por espaço, sendo x y z: ');
          socket.once('data', coordinates => {
            const xyz = coordinates.toString().trim().split(' ');
            const x = parseInt(xyz[0]);
            const y = parseInt(xyz[1]);
            const z = parseInt(xyz[2]);
            if (isNaN(x) || isNaN(y) || isNaN(z)) {
              args.errorMsg = 'Coordenadas inválidas. Tem que ser X Y Z separadas por espaço.';
              return socket.emit('redit-main-menu', socket, room, args);
            }
            room.coordinates = [x, y, z];
            say('<green>Para as coordenadas fazerem efeito, é preciso resetar o mud.</green>');
            return socket.emit('redit-main-menu', socket, room, args);
          });
        },
      });

      options.push({
        display: 'Saídas da sala :',
        onSelect: () => {
          return socket.emit('redit-exits-menu', socket, room, args);
        },
      });

      if (room.exits && room.exits.length > 0) {
        for (let ex in room.exits) {
          const roomDef = state.RoomManager.getRoom(room.exits[ex].roomId);
          let roomTitle = 'Sala Inválida!!!!';
          if (roomDef) {
            roomTitle = roomDef.title;
          }
          options.push({ display: sprintf(' [<cyan>%-9s</cyan>] [<cyan>%-15s</cyan>][<cyan>%-35s</cyan>] (<b>%s</b>)', room.exits[ex].direction, room.exits[ex].roomId, roomTitle, room.exits[ex].leaveMessage ? 'Fulano' + room.exits[ex].leaveMessage : 'Sem Msg')});
        }
      }

      options.push({
        display: 'Portas da sala :',
        onSelect: () => {
          return socket.emit('redit-doors-menu', socket, room, args);
        },
      });

      if (room.doors) {
        const doors = new Map(Object.entries(JSON.parse(JSON.stringify(room.doors || {}))));
        for (const [key, value] of doors) {
          const roomDef = state.RoomManager.getRoom(key);
          //options.push({ display: ` [<green>${value.closed ? 'Fechada' : 'Aberta'}</green>][<green>${value.locked ? 'Trancada' : 'Destrancada'}</green>][<green>${value.hidden ? 'Oculta' : 'Visível'}</green>][<green>${value.lockedBy ? 'Key: <yellow>' + value.lockedBy + '</yellow>': 'Sem chave'}</green>] [<cyan>${key}</cyan>] <cyan>${roomDef.title}</cyan>`});
          options.push({ display: ` [<green>${value.lockedBy ? 'Key: <yellow>' + value.lockedBy + '</yellow>': 'Sem chave'}</green>] [<cyan>${key}</cyan>] <cyan>${roomDef.title}</cyan>`});
        }
      }

      options.push({
        display: 'Itens na sala :',
        onSelect: () => {
          return socket.emit('redit-items-menu', socket, room, args);
        },
      });
      
      if (room.items && room.items.length > 0) {
        for (let item in room.items) {
          if (typeof room.items[item] == 'string') {
            // Convert to object
            const id = room.items[item] + '';
            room.items[item] = {
              'id' : id,
              'respawnChance' : 100
            };
          }
          const itemDef = state.ItemFactory.getDefinition(room.items[item].id);
          options.push({ display: ` Chance: [<cyan>${room.items[item].respawnChance || '100'}%</cyan>] Substituir: [<cyan>${room.items[item].replaceOnRespawn ? 'Sim' : 'Não'}</cyan>] (<green>${room.items[item].id}</green>) <yellow>${itemDef.name}</yellow>`});
        }
      }

      options.push({
        display: 'Mobs na sala :',
        onSelect: () => {
          return socket.emit('redit-npcs-menu', socket, room, args);
        },
      });
      
      if (room.npcs && room.npcs.length > 0) {
        for (let npc in room.npcs) {
          if (typeof room.npcs[npc] == 'string') {
            // Convert to object
            const id = room.npcs[npc] + '';
            room.npcs[npc] = {
              'id' : id,
              'respawnChance' : 100,
              'maxLoad' : 1
            };
          }
          const npcDef = state.MobFactory.getDefinition(room.npcs[npc].id);
          options.push({ display: ` Chance: [<cyan>${room.npcs[npc].respawnChance}%</cyan>] Máximo: [<cyan>${room.npcs[npc].maxLoad ? room.npcs[npc].maxLoad : 1}</cyan>] (<green>${npcDef.entityReference}</green>) <yellow>${npcDef.name}</yellow>`});
        }
      }

      let quit = [];
      quit.push({
        display: `Sair`,
        onSelect: () => {
          write('Deseja salvar as alterações na sala? [<b>s/N</b>]: ');
          socket.once('data', confirmation => {
            say('');
            confirmation = confirmation.toString().trim().toLowerCase();

            if (!/[sn]/.test(confirmation)) {
              return socket.emit('redit-main-menu', socket, room, args);
            }

            if (confirmation === 's') {
              room.metadata.last_edited = Date.now();
              room.metadata.last_edited_by = player.name;
              Data.saveFile(filepath, roomFile);
              const newroom = new Room(area, room);
              state.RoomManager.removeRoom(newroom);
              state.RoomManager.addRoom(newroom);
              area.rooms.set(newroom.id, newroom);
              say(`<green>Alterações salvas.</green>`);
              say(`<green>Para que as alterações façam efeito, saia da sala.</green>`);
              //area.addRoom(newroom);
              //area.removeRoom(room);
              /* -- Moreli: Não vou ligar pra recarregar o script agora
              if (room.script) {
                const scriptPath = path.dirname(itemsFile) + '/scripts/items/' + room.script + '.js';
                if (fs.existsSync(scriptPath)) {
                  this.loadEntityScript(this.state.ItemFactory, entityRef, scriptPath);
                }
              }
              */
            } else {
              say('Alterações descartadas.');
            }

            player.socket.emit('resume-playing', player.socket, { player });
            //Broadcast.prompt(player);
          });
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
          return socket.emit('redit-main-menu', socket, room, args);
        }

        const selection = options.filter(o => !!o.onSelect)[choice];

        if (selection) {
          Logger.log('Selecionado redit main menu:' + selection.display);
          return selection.onSelect();
        }
        args.errorMsg = 'Opção inválida!';
        return socket.emit('redit-main-menu', socket, room, args);
      });
    }
  };
};
