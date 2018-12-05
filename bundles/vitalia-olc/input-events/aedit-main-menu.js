'use strict';

const sprintf = require('sprintf-js').sprintf;
const fs = require('fs');

/**
 * Area edit - Main menu
 */
module.exports = (srcPath) => {
  const Broadcast     = require(srcPath + 'Broadcast');
  const EventUtil     = require(srcPath + 'EventUtil');
  const Logger        = require(srcPath + 'Logger');
  const Data          = require(srcPath + 'Data');
  const Area          = require(srcPath + 'Area');

  return {
    event: state => (socket, area, args) => {
      const say      = EventUtil.genSay(socket);
      const write    = EventUtil.genWrite(socket);
      const player   = args.player;
      const areaName = args.area;
      const areaPath = args.areaPath;

      let options = [];
      if (!area.info) area.info = {};
      options.push({ display: `-- Área [<cyan>${areaName}:${area.title}</cyan>]` });

      options.push({
        display: `Título : <cyan>${area.title}</cyan>`,
        onSelect: () => {
          write('Entre com o título: ');
          socket.once('data', title => {
            title = title.toString().trim();
            if (title == '') {
              args.errorMsg = 'O título é obrigatório!';
            } else {
              area.title = title;
            }
            return socket.emit('aedit-main-menu', socket, area, args);
          });
        },
      });

      options.push({
        display: `Descrição : <yellow>${area.info.description || '<Sem Descrição>'}</yellow>`,
        onSelect: () => {
          write('Entre com a descrição (Sem quebras de linha): ');
          socket.once('data', description => {
            area.info.description = description.toString().trim();
            return socket.emit('aedit-main-menu', socket, area, args);
          });
        },
      });

      options.push({
        display: `Level Min : <yellow>${area.info.level || 0}</yellow>`,
        onSelect: () => {
          write('Entre com o level mínimo: ');
          socket.once('data', lvl => {
            lvl = parseInt(lvl, 10);
            if (isNaN(lvl) || lvl < 0 || lvl > 110) {
              args.errorMsg = 'Level inválido!';
              return socket.emit('aedit-main-menu', socket, area, args);
            }
            area.info.level = lvl;
            return socket.emit('aedit-main-menu', socket, area, args);
          });
        },
      });

      options.push({
        display: `Remort Min : <yellow>${area.info.remort || 0}</yellow>`,
        onSelect: () => {
          write('Entre com o remort mínimo: ');
          socket.once('data', remort => {
            remort = parseInt(remort, 10);
            if (isNaN(remort) || remort < 0 || remort > 110) {
              args.errorMsg = 'Remort inválido!';
              return socket.emit('aedit-main-menu', socket, area, args);
            }
            area.info.remort = remort;
            return socket.emit('aedit-main-menu', socket, area, args);
          });
        },
      });

      options.push({
        display: `Tempo para reset : <yellow>${area.info.respawnInterval || 60} Segundos</yellow>`,
        onSelect: () => {
          write('0 siginifica que não reseta.')
          write('Entre com o tempo para reset (segundos): ');
          socket.once('data', time => {
            time = parseInt(time, 10);
            if (isNaN(time) || time < 0) {
              args.errorMsg = 'Segundos inválidos!';
              return socket.emit('aedit-main-menu', socket, area, args);
            }
            area.info.respawnInterval = time;
            return socket.emit('aedit-main-menu', socket, area, args);
          });
        },
      });

      // Flags
      if (typeof area.info.flags == 'undefined') {
        area.info.flags = [];
      }

      let actualFlags = area.info.flags.join(' ');
      if (actualFlags == '') {
        actualFlags = '<Nonea>';
      }

      options.push({
        display: `Flags : <yellow>${actualFlags}</yellow>`,
        onSelect: () => {
          return socket.emit('aedit-flags-menu', socket, area, args);
        },
      });

      let quit = [];
      quit.push({
        display: `Leave Menu`,
        onSelect: () => {
          write('Deseja salvar as alterações na sala? [<b>s/N</b>]: ');
          socket.once('data', confirmation => {
            say('');
            confirmation = confirmation.toString().trim().toLowerCase();

            if (!/[sn]/.test(confirmation)) {
              return socket.emit('aedit-main-menu', socket, area, args);
            }

            if (confirmation === 's') {
              area.info.last_edited = Date.now();
              area.info.last_edited_by = player.name;

              if (!fs.existsSync(areaPath)) {
                say(`Criando diretório principal...`);
                fs.mkdirSync(areaPath);
              }

              if (!fs.existsSync(areaPath + '/scripts')) {
                say(`Criando diretório para os scripts...`);
                fs.mkdirSync(areaPath + '/scripts');
              }

              if (!fs.existsSync(areaPath + '/scripts/items')) {
                say(`Criando diretório para scripts de items...`);
                fs.mkdirSync(areaPath + '/scripts/items');
              }

              if (!fs.existsSync(areaPath + '/scripts/npcs')) {
                say(`Criando diretório para scripts de mobs...`);
                fs.mkdirSync(areaPath + '/scripts/npcs');
              }

              if (!fs.existsSync(areaPath + '/scripts/rooms')) {
                say(`Criando diretório para scripts de salas...`);
                fs.mkdirSync(areaPath + '/scripts/rooms');
              }

              if (!fs.existsSync(areaPath + '/manifest.yml')) {
                say(`Criando arquivo de especificação da área...`);
                fs.closeSync(fs.openSync(areaPath + '/manifest.yml', 'w'));
              }

              if (!fs.existsSync(areaPath + '/items.yml')) {
                say(`Criando arquivo de especificação de items...`);
                fs.closeSync(fs.openSync(areaPath + '/items.yml', 'w'));
              }

              if (!fs.existsSync(areaPath + '/npcs.yml')) {
                say(`Criando arquivo de especificação de mobs...`);
                fs.closeSync(fs.openSync(areaPath + '/npcs.yml', 'w'));
              }

              if (!fs.existsSync(areaPath + '/rooms.yml')) {
                say(`Criando arquivo de especificação de salas...`);
                fs.closeSync(fs.openSync(areaPath + '/rooms.yml', 'w'));
              }

              Data.saveFile(areaPath + '/manifest.yml', area);
              say('Carregando nova área...');
              const manifest = Data.parseFile(areaPath + '/manifest.yml');
              const newArea = new Area('vitalia-areas', area.name, manifest);
              state.AreaManager.addArea(newArea);

              say(`<green>Área salva.</green>`);
              //area.addarea(newarea);
              //area.removearea(area);
              /* -- Moreli: Não vou ligar pra recarregar o script agora
              if (area.script) {
                const scriptPath = path.dirname(itemsFile) + '/scripts/items/' + area.script + '.js';
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
      write('Enter your choice : ');

      socket.once('data', choice => {
        choice = choice.toString().trim().toLowerCase();

        if (choice == 'q') {
          return quit[0].onSelect();
        }

        choice = parseInt(choice, 10) - 1;
        if (isNaN(choice)) {
          args.errorMsg = 'Opção inválida!';
          return socket.emit('aedit-main-menu', socket, area, args);
        }

        const selection = options.filter(o => !!o.onSelect)[choice];

        if (selection) {
          Logger.log('Selecionado aedit main menu:' + selection.display);
          return selection.onSelect();
        }
        args.errorMsg = 'Opção inválida!';
        return socket.emit('aedit-main-menu', socket, area, args);
      });
    }
  };
};
