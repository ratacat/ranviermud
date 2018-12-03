'use strict';

const sprintf = require('sprintf-js').sprintf;
const fs = require('fs');

/**
 * Item edit - Main menu
 */
module.exports = (srcPath) => {
  const Broadcast = require(srcPath + 'Broadcast');
  const EventUtil = require(srcPath + 'EventUtil');
  const Logger    = require(srcPath + 'Logger');
  const Data      = require(srcPath + 'Data');
  const ItemTypeProperties = require(srcPath + 'ItemTypeProperties');
  const PlayerConditions = require(srcPath + 'PlayerConditions');

  return {
    event: state => (socket, obj, args) => {
      const say      = EventUtil.genSay(socket);
      const write    = EventUtil.genWrite(socket);
      const area     = args.areaRef;
      const player   = args.player;
      let   objFile  = args.parsed;
      const filepath = args.filepath;
      const areaPath = args.areaPath;

      if (!obj.properties) obj.properties = {};
      if (!obj.metadata) obj.metadata = {};

      let options = [];
      options.push({ display: `-- Item [<cyan>${area.name}:${obj.id}</cyan>]` });

      options.push({
        display: `Nome : <yellow>${obj.name}</yellow>`,
        onSelect: () => {
          write('Entre com o nome: ');
          socket.once('data', name => {
            name = name.toString().trim();
            if (name == '') {
              args.errorMsg = 'O nome é obrigatório!';
            } else {
              obj.name = name;
            }
            return socket.emit('oedit-main-menu', socket, obj, args);
          });
        },
      });

      options.push({
        display: `Atalhos : <yellow>${typeof obj.keywords == 'undefined' || obj.keywords == '' ? '<red>Nenhum!!!</red>': obj.keywords}</yellow>`,
        onSelect: () => {
          write('Entre com TODOS os atalhos (Separadas por virgula, sem espaço): ');
          socket.once('data', keywords => {
            obj.keywords = (keywords.toString().trim()).split(',');
            return socket.emit('oedit-main-menu', socket, obj, args);
          });
        },
      });

      options.push({
        display: `Descrição na sala : <yellow>${obj.roomDesc}</yellow>`,
        onSelect: () => {
          write('Entre com a descrição (No chão da sala): ');
          socket.once('data', roomDesc => {
            obj.roomDesc = roomDesc.toString().trim();
            return socket.emit('oedit-main-menu', socket, obj, args);
          });
        },
      });

      options.push({
        display: `Descrição : <yellow>${obj.description}</yellow>`,
        onSelect: () => {
          write('Entre com a descrição (Sem quebras de linha): ');
          socket.once('data', description => {
            obj.description = description.toString().trim();
            return socket.emit('oedit-main-menu', socket, obj, args);
          });
        },
      });

      let extraDescs = '';
      for (let desc in obj.extraDescs) {
        extraDescs += extraDescs != '' ? ',' + desc : desc;
      }
      options.push({
        display: `Descrições extras : <yellow>${extraDescs != '' ? extraDescs : '<Nenhuma>'}</yellow>`,
        onSelect: () => {
          return socket.emit('oedit-extradesc-menu', socket, obj, args);
        },
      });

      options.push({
        display: `Level Min : <yellow>${obj.metadata.level}</yellow>`,
        onSelect: () => {
          write('Entre com o level mínimo: ');
          socket.once('data', lvl => {
            lvl = parseInt(lvl, 10);
            if (isNaN(lvl) || lvl < 0 || lvl > 110) {
              args.errorMsg = 'Level inválido!';
              return socket.emit('oedit-main-menu', socket, obj, args);
            }
            obj.metadata.level = lvl;
            return socket.emit('oedit-main-menu', socket, obj, args);
          });
        },
      });

      options.push({
        display: `Remort Min : <yellow>${obj.metadata.remort || 0}</yellow>`,
        onSelect: () => {
          write('Entre com o remort mínimo: ');
          socket.once('data', remort => {
            remort = parseInt(remort, 10);
            if (isNaN(remort) || remort < 0 || remort > 110) {
              args.errorMsg = 'Remort inválido!';
              return socket.emit('oedit-main-menu', socket, obj, args);
            }
            obj.metadata.remort = remort;
            return socket.emit('oedit-main-menu', socket, obj, args);
          });
        },
      });

      options.push({
        display: `Máximo de Objetos no MUD : <yellow>${obj.metadata.max_items || 999}</yellow>`,
        onSelect: () => {
          say('Número máximo no jogo, qualquer lugar conta, com Deuses, casa, player offline, tudo.');
          say('Este número é utilizado somente em resets do item (area resetando), não impede o item de ser carregado por um Deus.')
          say('Mínimo: <green>0</green> (Não reseta), Máximo: <green>999</green>');
          write('Entre o número máximo deste item no MUD: ');
          socket.once('data', max_items => {
            max_items = parseInt(max_items, 10);
            if (isNaN(max_items) || max_items < 0 || max_items > 999) {
              args.errorMsg = 'Número inválido!';
              return socket.emit('oedit-main-menu', socket, obj, args);
            }
            obj.metadata.max_items = max_items;
            return socket.emit('oedit-main-menu', socket, obj, args);
          });
        },
      });

      options.push({
        display: `Tipo : <yellow>${obj.type}</yellow>`,
        onSelect: () => {
          return socket.emit('oedit-type-menu', socket, obj, args);
        },
      });

      // Mostrar as propriedades atuais do tipo
      let printedTitle = 0;
      for (let att in ItemTypeProperties[obj.type]) {
        if (printedTitle == 0) {
          printedTitle = 1;
          options.push({
            display: `Propriedades específicas do tipo ${obj.type}`,
            onSelect: () => {
              return socket.emit('oedit-type-specifics', socket, obj, args);
            },
          });
        }
        options.push({ display: sprintf("     -> %-20s : <yellow>%s</yellow>", ItemTypeProperties[obj.type][att].text, obj.properties[ItemTypeProperties[obj.type][att].name]) });
      }
      

      options.push({
        display: `Valor : <yellow>${obj.metadata.value || 0}</yellow>`,
        onSelect: () => {
          write('Entre com o valor: ');
          socket.once('data', val => {
            val = parseInt(val, 10);
            if (isNaN(val) || val < 0) {
              args.errorMsg = 'Valor inválido!';
              return socket.emit('oedit-main-menu', socket, obj, args);
            }
            obj.metadata.value = val;
            return socket.emit('oedit-main-menu', socket, obj, args);
          });
        },
      });

      options.push({
        display: `Moeda : <yellow>${obj.metadata.currency || 'gold'}</yellow>`,
        onSelect: () => {
          write('Entre com a moeda (Padrão "gold"): ');
          socket.once('data', val => {
            obj.metadata.currency = val.toString().trim();
            return socket.emit('oedit-main-menu', socket, obj, args);
          });
        },
      });

      // Flags
      if (typeof obj.metadata.flags == 'undefined') {
        obj.metadata.flags = [];
      }

      let actualFlags = obj.metadata.flags.join(' ');
      if (actualFlags == '') {
        actualFlags = '<Nenhuma>';
      }

      options.push({
        display: `Flags : <yellow>${actualFlags}</yellow>`,
        onSelect: () => {
          return socket.emit('oedit-flags-menu', socket, obj, args);
        },
      });

      // Afetamentos
      if (typeof obj.metadata.affects == 'undefined') {
        obj.metadata.affects = [];
      }

      let actualAffects = obj.metadata.affects.join(' ');
      if (actualAffects == '') {
        actualAffects = '<Nenhuma>';
      }

      options.push({
        display: `Afetamentos : <yellow>${actualAffects}</yellow>`,
        onSelect: () => {
          return socket.emit('oedit-affects-menu', socket, obj, args);
        },
      });

      options.push({
        display: `Modificadores`,
        onSelect: () => {
          return socket.emit('oedit-modifiers-menu', socket, obj, args);
        }
      });
      for (let mod in obj.metadata.stats) {
        options.push({ display: sprintf("<green>%15s</green> : <yellow>%s</yellow>", mod, obj.metadata.stats[mod])});
      }

      options.push({
        display: `Behaviors : <yellow>${obj.behaviors ? JSON.stringify(obj.behaviors) : '<Nenhum>'}</yellow>`,
        onSelect: () => {
          args.errorMsg = 'Ainda em construção!';
          //return socket.emit('oedit-behaviors-menu', socket, obj, args);
          return socket.emit('oedit-main-menu', socket, obj, args);
        },
      });


      options.push({
        display: `Script : <yellow>${obj.script || '<Nenhum>'}</yellow>`,
        onSelect: () => {
          // Validacao da existencia do script?
          write('Entre com o script: ');
          socket.once('data', script => {
            script = script.toString().trim();

            if (script != '') {
              const scriptPath = areaPath + '/scripts/items/' + script + '.js';
              if (!fs.existsSync(scriptPath)) {
                args.errorMsg = 'Script inexistente: ' + area.name + '/scripts/items/' + script + '.js';
                return socket.emit('oedit-main-menu', socket, obj, args);
              }
            }

            obj.script = script;
            return socket.emit('oedit-main-menu', socket, obj, args);
          });
        },
      });

      options.push({
        display: `Slot : <yellow>[${obj.metadata.slot ? obj.metadata.slot.join(',').toUpperCase() : '<Nenhum>'}]</yellow>`,
        onSelect: () => {
          return socket.emit('oedit-slots-menu', socket, obj, args);
        },
      });

      /*
      options.push({
        display: `Qualidade : <yellow>${obj.quality || 'common'}</yellow>`,
        onSelect: () => {
          // TODO: Menu limitando opcoes
          write('Entre com a qualidade: ');
          socket.once('data', quality => {
            obj.quality = quality.toString().trim();
            return socket.emit('oedit-main-menu', socket, obj, args);
          });
        },
      });
      */

      options.push({
        display: `Peso : <yellow>${obj.metadata.weight || 0}</yellow>`,
        onSelect: () => {
          write('Entre com o peso: ');
          socket.once('data', weight => {
            weight = parseInt(weight, 10);
            if (isNaN(weight) || weight < 0) {
              args.errorMsg = 'Peso inválido!';
              return socket.emit('oedit-main-menu', socket, obj, args);
            }
            obj.metadata.weight = weight;
            return socket.emit('oedit-main-menu', socket, obj, args);
          });
        },
      });

      let quit = [];
      quit.push({
        display: `Sair`,
        onSelect: () => {
          write('Deseja salvar as alterações no objeto? [<b>s/N</b>]: ');
          socket.once('data', confirmation => {
            say('');
            confirmation = confirmation.toString().trim().toLowerCase();

            if (!/[sn]/.test(confirmation)) {
              return socket.emit('oedit-main-menu', socket, obj, args);
            }

            if (confirmation === 's') {
              obj.metadata.last_edited = Date.now();
              obj.metadata.last_edited_by = player.name;
              Data.saveFile(filepath, objFile);
              state.ItemFactory.setDefinition(area.name + ':' + obj.id, obj);
              /* -- Moreli: Não vou ligar pra recarregar o script agora
              if (obj.script) {
                const scriptPath = path.dirname(itemsFile) + '/scripts/items/' + obj.script + '.js';
                if (fs.existsSync(scriptPath)) {
                  this.loadEntityScript(this.state.ItemFactory, entityRef, scriptPath);
                }
              }
              */
              say(`<green>Alterações salvas.</green>`);
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
          return socket.emit('oedit-main-menu', socket, obj, args);
        }

        const selection = options.filter(o => !!o.onSelect)[choice];

        if (selection) {
          Logger.log('Selecionado oedit main menu:' + selection.display);
          return selection.onSelect();
        }
        args.errorMsg = 'Opção inválida!';
        return socket.emit('oedit-main-menu', socket, obj, args);
      });
    }
  };
};
